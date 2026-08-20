declare const process: any;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Cuerpo de solicitud inválido' });
    }
  }

  const { textoPdf } = body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY no configurada en Vercel.',
    });
  }

  if (!textoPdf) {
    return res.status(400).json({ error: 'No se recibió texto del documento.' });
  }

  const prompt = `
Eres un analizador experto de horarios de la Universidad de Los Lagos (ULagos).
A continuación tienes el texto plano extraído de un horario en PDF:

"""
${textoPdf}
"""

Extrae TODAS las asignaturas y sus bloques de clase en formato JSON estricto.

BLOQUES OFICIALES VÁLIDOS (Usa únicamente estos horarios para horaInicio y horaFin):
- "08:30" a "09:15"
- "09:30" a "10:15"
- "10:30" a "11:15"
- "11:30" a "12:15"
- "12:30" a "13:15"
- "14:15" a "15:00" (si en el PDF aparece 15:06, normalízalo a 15:00)
- "15:15" a "16:00"
- "16:15" a "17:00"
- "17:15" a "18:00"
- "18:15" a "19:00"

REGLAS DE EXTRACCIÓN:
1. "dia": Debe ser exactamente "Lunes", "Martes", "Miercoles", "Jueves" o "Viernes" (sin tildes).
2. "horaInicio" y "horaFin": Formato "HH:MM" de acuerdo a la lista de bloques oficiales anterior.
3. "tipo": Uno de "Catedra", "Taller", "Laboratorio", "Ayudantia". Si dice PRACTICO/TALLER, usa "Taller" o "Laboratorio".
4. "nombre": Nombre limpio de la asignatura en Title Case (ej: "Física Newtoniana", "Álgebra Superior", "Cálculo Diferencial e Integral", "Estructura de Datos").
5. "codigo": Código del ramo (ej: "CBI06", "CBI07", "CBI08", "FDICI03").
6. "profesor": Nombre completo limpio del docente en Title Case.
7. "sala": Nombre legible (ej: "Sala 202 (Chinquihue)", "Laboratorio de Física", "TIC 2 (Chinquihue)").
8. Agrupa todos los bloques de una misma asignatura dentro de su lista "bloques".

Responde ÚNICAMENTE con el arreglo JSON:
[
  {
    "nombre": "Cálculo Diferencial e Integral",
    "codigo": "CBI06",
    "profesor": "Miriam Del Carmen Subiabre Olavarria",
    "bloques": [
      {
        "dia": "Lunes",
        "horaInicio": "14:15",
        "horaFin": "15:00",
        "sala": "Sala 202 (Chinquihue)",
        "tipo": "Catedra"
      }
    ]
  }
]
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey.trim()}`;
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!respuesta.ok) {
      const err = await respuesta.json().catch(() => ({}));
      return res.status(respuesta.status).json({
        error: err.error?.message || `Error en la API de Gemini (${respuesta.status})`,
      });
    }

    const data = await respuesta.json();
    const jsonTexto = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json(JSON.parse(jsonTexto || '[]'));
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Error interno al procesar el horario.',
    });
  }
}
import * as pdfjsLib from 'pdfjs-dist';
import type { Asignatura, ColorAsignatura } from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const PALETA: ColorAsignatura[] = [
  'blue',
  'emerald',
  'purple',
  'amber',
  'rose',
  'indigo',
  'cyan',
];

const PROMPT_EXTRACCION = (texto: string) => `
Eres un analizador experto de horarios de la Universidad de Los Lagos (ULagos).
A continuación tienes el texto plano extraído de un horario en PDF:

"""
${texto}
"""

Extrae TODAS las asignaturas y sus bloques de clase en formato JSON estricto.

BLOQUES OFICIALES VÁLIDOS:
- "08:30" a "09:15"
- "09:30" a "10:15"
- "10:30" a "11:15"
- "11:30" a "12:15"
- "12:30" a "13:15"
- "14:15" a "15:00" (normalizar 15:06 a 15:00)
- "15:15" a "16:00"
- "16:15" a "17:00"
- "17:15" a "18:00"
- "18:15" a "19:00"

REGLAS DE EXTRACCIÓN:
1. "dia": Exactamente "Lunes", "Martes", "Miercoles", "Jueves" o "Viernes".
2. "horaInicio" y "horaFin": Formato "HH:MM" de los bloques oficiales.
3. "tipo": Uno de "Catedra", "Taller", "Laboratorio", "Ayudantia".
4. "nombre": Nombre limpio de la asignatura en Title Case.
5. "codigo": Código del ramo (ej: "CBI06", "CBI07", "CBI08", "FDICI03").
6. "profesor": Nombre completo limpio del docente en Title Case.
7. "sala": Nombre legible de la sala o laboratorio.
8. Agrupa todos los bloques de una misma asignatura en "bloques".

Responde ÚNICAMENTE con un arreglo JSON:
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

export async function extraerTextoCompletoDePdf(archivo: File): Promise<string> {
  const arrayBuffer = await archivo.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let textoCompleto = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const pagina = await pdf.getPage(i);
    const contenido = await pagina.getTextContent();
    const textoPagina = contenido.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    textoCompleto += `\n--- PAGINA ${i} ---\n${textoPagina}`;
  }

  return textoCompleto;
}

export async function procesarHorarioConIA(textoPdf: string): Promise<Asignatura[]> {
  let rawAsignaturas: any[] = [];
  const localKey = import.meta.env.VITE_GEMINI_API_KEY;

  try {
    const respuesta = await fetch('/api/analizar-horario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textoPdf }),
    });

    if (respuesta.ok) {
      rawAsignaturas = await respuesta.json();
    } else if (localKey) {
      rawAsignaturas = await procesarDirectoGemini(textoPdf, localKey);
    } else {
      const err = await respuesta.json().catch(() => ({}));
      throw new Error(err.error || `Error del servidor (${respuesta.status})`);
    }
  } catch (error: any) {
    if (localKey) {
      rawAsignaturas = await procesarDirectoGemini(textoPdf, localKey);
    } else {
      throw new Error(error.message || 'Error al procesar el horario.');
    }
  }

  let colorIdx = 0;

  return rawAsignaturas.map((item: any) => ({
    id: crypto.randomUUID(),
    nombre: item.nombre,
    codigo: item.codigo,
    profesor: item.profesor,
    color: PALETA[colorIdx++ % PALETA.length],
    condicion: 'Al día',
    creditosSct: 0,
    horasTp: 0,
    horasTa: 0,
    bloques: (item.bloques || []).map((b: any) => ({
      id: crypto.randomUUID(),
      dia: (['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'].includes(b.dia)
        ? b.dia
        : 'Lunes') as any,
      horaInicio: b.horaInicio,
      horaFin: b.horaFin,
      sala: b.sala,
      tipo: (b.tipo as any) || 'Catedra',
    })),
  }));
}

async function procesarDirectoGemini(textoPdf: string, apiKey: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey.trim()}`;
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT_EXTRACCION(textoPdf) }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  if (!respuesta.ok) {
    const err = await respuesta.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error en la API de Gemini (${respuesta.status})`);
  }

  const data = await respuesta.json();
  const jsonTexto = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(jsonTexto || '[]');
}
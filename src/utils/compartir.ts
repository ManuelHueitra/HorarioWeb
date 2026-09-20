import LZString from 'lz-string';
import type { PlanHorario, Asignatura, ColorAsignatura, DiaSemana } from '@/types';

// Esquema ligero v2 (elimina UUIDs y acorta nombres de claves)
interface PayloadCompacto {
  v: 2;
  n: string; // nombre del plan
  a: Array<{
    n: string;  // nombre
    c?: string; // código
    cl: ColorAsignatura;
    cd?: string; // condición
    s?: number;  // créditos SCT
    tp?: number; // horas TP
    ta?: number; // horas TA
    // [dia, horaInicio, horaFin, sala?, tipo?]
    b: Array<[DiaSemana, string, string, string?, string?]>;
  }>;
}

export function comprimirPlanParaUrl(plan: PlanHorario): string {
  const payload: PayloadCompacto = {
    v: 2,
    n: plan.nombre,
    a: (plan.asignaturas || []).map((asig) => ({
      n: asig.nombre,
      ...(asig.codigo ? { c: asig.codigo } : {}),
      cl: asig.color,
      ...(asig.condicion && asig.condicion !== 'Al día' ? { cd: asig.condicion } : {}),
      ...(asig.creditosSct ? { s: asig.creditosSct } : {}),
      ...(asig.horasTp ? { tp: asig.horasTp } : {}),
      ...(asig.horasTa ? { ta: asig.horasTa } : {}),
      b: (asig.bloques || []).map((b) => [
        b.dia,
        b.horaInicio,
        b.horaFin,
        b.sala || undefined,
        b.tipo || undefined,
      ]),
    })),
  };

  return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

export function descomprimirPlanDesdeUrl(dataUrl: string): Partial<PlanHorario> | null {
  try {
    const jsonStr = LZString.decompressFromEncodedURIComponent(dataUrl);
    if (!jsonStr) return null;

    const data = JSON.parse(jsonStr);

    // Si es el nuevo formato optimizado v2
    if (data.v === 2) {
      const asignaturasReconstruidas: Asignatura[] = data.a.map((raw: any) => ({
        id: crypto.randomUUID(),
        nombre: raw.n,
        codigo: raw.c || '',
        color: raw.cl,
        condicion: raw.cd || 'Al día',
        creditosSct: raw.s || 0,
        horasTp: raw.tp || 0,
        horasTa: raw.ta || 0,
        bloques: (raw.b || []).map((b: any[]) => ({
          id: crypto.randomUUID(),
          dia: b[0],
          horaInicio: b[1],
          horaFin: b[2],
          sala: b[3] || '',
          tipo: b[4] || 'Cátedra',
        })),
      }));

      return {
        nombre: data.n,
        asignaturas: asignaturasReconstruidas,
      };
    }

    // Compatibilidad con enlaces generados con la versión anterior (v1)
    return data;
  } catch (error) {
    console.error('Error al descomprimir horario:', error);
    return null;
  }
}
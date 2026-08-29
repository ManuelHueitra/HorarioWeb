import LZString from 'lz-string';
import type { PlanHorario } from '@/types';

// Comprimir un plan a una cadena segura para URLs
export function comprimirPlanParaUrl(plan: PlanHorario): string {
  const payload = {
    nombre: plan.nombre,
    asignaturas: plan.asignaturas,
    temaActivo: plan.temaActivo,
    configGrilla: plan.configGrilla,
  };
  const jsonStr = JSON.stringify(payload);
  return LZString.compressToEncodedURIComponent(jsonStr);
}

// Descomprimir los datos desde la URL
export function descomprimirPlanDesdeUrl(dataUrl: string): Partial<PlanHorario> | null {
  try {
    const jsonStr = LZString.decompressFromEncodedURIComponent(dataUrl);
    if (!jsonStr) return null;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error al descomprimir horario compartido:', error);
    return null;
  }
}
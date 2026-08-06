import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Asignatura } from '@/types';

interface HorarioState {
  nombreHorario: string;
  asignaturas: Asignatura[];
    
  setNombreHorario: (nombre: string) => void;
  agregarAsignatura: (nuevaAsignatura: Asignatura) => void;
  eliminarAsignatura: (id: string) => void;
  limpiarHorario: () => void;
}

export const useHorarioStore = create<HorarioState>()(
  persist(
    (set) => ({
      nombreHorario: 'Mi Horario 2026',
      asignaturas: [],

      setNombreHorario: (nombre) => 
        set({ nombreHorario: nombre }),

      agregarAsignatura: (nuevaAsignatura) =>
        set((state) => ({
          asignaturas: [...state.asignaturas, nuevaAsignatura],
        })),

      eliminarAsignatura: (id) =>
        set((state) => ({
          asignaturas: state.asignaturas.filter((ramo) => ramo.id !== id),
        })),

      limpiarHorario: () => 
        set({ asignaturas: [] }),
    }),
    {
      name: 'horario-web-storage',
    }
  )
);
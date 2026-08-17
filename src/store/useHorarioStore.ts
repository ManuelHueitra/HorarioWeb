import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Asignatura } from '@/types';

interface HorarioState {
  nombreHorario: string;
  asignaturas: Asignatura[];
  setNombreHorario: (nombre: string) => void;
  agregarAsignatura: (asignatura: Asignatura) => void;
  actualizarAsignatura: (asignatura: Asignatura) => void;
  eliminarAsignatura: (id: string) => void;
}

export const useHorarioStore = create<HorarioState>()(
  persist(
    (set) => ({
      nombreHorario: 'Mi Horario Semestral',
      asignaturas: [],
      setNombreHorario: (nombreHorario) => set({ nombreHorario }),
      agregarAsignatura: (asignatura) =>
        set((state) => ({
          asignaturas: [...state.asignaturas, asignatura],
        })),
      actualizarAsignatura: (asignaturaActualizada) =>
        set((state) => ({
          asignaturas: state.asignaturas.map((a) =>
            a.id === asignaturaActualizada.id ? asignaturaActualizada : a
          ),
        })),
      eliminarAsignatura: (id) =>
        set((state) => ({
          asignaturas: state.asignaturas.filter((a) => a.id !== id),
        })),
    }),
    {
      name: 'horario-storage',
    }
  )
);
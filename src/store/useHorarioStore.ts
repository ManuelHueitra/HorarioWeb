import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Asignatura, TemaHorario } from '@/types';
import { TEMAS_PREDEFINIDOS } from '@/utils/temas';

interface HorarioState {
  nombreHorario: string;
  asignaturas: Asignatura[];
  temaActivo: TemaHorario;
  temasPersonalizados: TemaHorario[];
  setNombreHorario: (nombre: string) => void;
  agregarAsignatura: (asignatura: Asignatura) => void;
  actualizarAsignatura: (asignatura: Asignatura) => void;
  eliminarAsignatura: (id: string) => void;
  setTemaActivo: (tema: TemaHorario) => void;
  guardarTemaPersonalizado: (tema: TemaHorario) => void;
  eliminarTemaPersonalizado: (id: string) => void;
}

export const useHorarioStore = create<HorarioState>()(
  persist(
    (set) => ({
      nombreHorario: 'Mi Horario Semestral',
      asignaturas: [],
      temaActivo: TEMAS_PREDEFINIDOS[0],
      temasPersonalizados: [],
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
      setTemaActivo: (temaActivo) => set({ temaActivo }),
      guardarTemaPersonalizado: (nuevoTema) =>
        set((state) => ({
          temasPersonalizados: [...state.temasPersonalizados, nuevoTema],
          temaActivo: nuevoTema,
        })),
      eliminarTemaPersonalizado: (id) =>
        set((state) => ({
          temasPersonalizados: state.temasPersonalizados.filter((t) => t.id !== id),
          temaActivo:
            state.temaActivo.id === id ? TEMAS_PREDEFINIDOS[0] : state.temaActivo,
        })),
    }),
    {
      name: 'horario-storage',
    }
  )
);
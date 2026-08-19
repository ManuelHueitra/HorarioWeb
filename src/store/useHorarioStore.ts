import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Asignatura,
  TemaHorario,
  PlanHorario,
} from '@/types';
import { TEMAS_PREDEFINIDOS } from '@/utils/temas';

const LIMITES_DEFECTO: Record<string, string> = {
  Lunes: '18:15',
  Martes: '18:15',
  Miercoles: '18:15',
  Jueves: '18:15',
  Viernes: '18:15',
};

const PLAN_INICIAL: PlanHorario = {
  id: 'plan-a',
  nombre: 'Plan A (Principal)',
  asignaturas: [],
  temaActivo: TEMAS_PREDEFINIDOS[0],
  configGrilla: {
    limitePorDia: LIMITES_DEFECTO,
  },
};

interface HorarioState {
  planes: PlanHorario[];
  planActivoId: string;
  temasPersonalizados: TemaHorario[];

  getPlanActivo: () => PlanHorario;

  crearPlan: (nombre: string) => void;
  cambiarPlanActivo: (id: string) => void;
  renombrarPlanActivo: (nombre: string) => void;
  duplicarPlanActivo: () => void;
  eliminarPlan: (id: string) => void;

  agregarAsignatura: (asignatura: Asignatura) => void;
  actualizarAsignatura: (asignatura: Asignatura) => void;
  eliminarAsignatura: (id: string) => void;

  setLimiteDia: (dia: string, horaFin: string) => void;

  setTemaActivo: (tema: TemaHorario) => void;
  guardarTemaPersonalizado: (tema: TemaHorario) => void;
  eliminarTemaPersonalizado: (id: string) => void;
}

export const useHorarioStore = create<HorarioState>()(
  persist(
    (set, get) => ({
      planes: [PLAN_INICIAL],
      planActivoId: PLAN_INICIAL.id,
      temasPersonalizados: [],

      getPlanActivo: () => {
        const state = get();
        const encontrado = state.planes.find((p) => p.id === state.planActivoId);
        const plan = encontrado || state.planes[0] || PLAN_INICIAL;
        return {
          ...plan,
          configGrilla: {
            limitePorDia: {
              ...LIMITES_DEFECTO,
              ...(plan.configGrilla?.limitePorDia || {}),
            },
          },
        };
      },

      crearPlan: (nombre) =>
        set((state) => {
          const nuevoPlan: PlanHorario = {
            id: crypto.randomUUID(),
            nombre: nombre.trim() || `Plan ${state.planes.length + 1}`,
            asignaturas: [],
            temaActivo: TEMAS_PREDEFINIDOS[0],
            configGrilla: {
              limitePorDia: LIMITES_DEFECTO,
            },
          };
          return {
            planes: [...state.planes, nuevoPlan],
            planActivoId: nuevoPlan.id,
          };
        }),

      cambiarPlanActivo: (id) => set({ planActivoId: id }),

      renombrarPlanActivo: (nuevoNombre) =>
        set((state) => ({
          planes: state.planes.map((p) =>
            p.id === state.planActivoId ? { ...p, nombre: nuevoNombre.trim() } : p
          ),
        })),

      duplicarPlanActivo: () =>
        set((state) => {
          const actual = state.planes.find((p) => p.id === state.planActivoId);
          if (!actual) return state;

          const clon: PlanHorario = {
            ...actual,
            id: crypto.randomUUID(),
            nombre: `${actual.nombre} (Copia)`,
            asignaturas: actual.asignaturas.map((a) => ({
              ...a,
              id: crypto.randomUUID(),
              bloques: a.bloques.map((b) => ({ ...b, id: crypto.randomUUID() })),
            })),
          };

          return {
            planes: [...state.planes, clon],
            planActivoId: clon.id,
          };
        }),

      eliminarPlan: (id) =>
        set((state) => {
          if (state.planes.length <= 1) return state;
          const restantes = state.planes.filter((p) => p.id !== id);
          return {
            planes: restantes,
            planActivoId:
              state.planActivoId === id ? restantes[0].id : state.planActivoId,
          };
        }),

      agregarAsignatura: (asignatura) =>
        set((state) => ({
          planes: state.planes.map((p) =>
            p.id === state.planActivoId
              ? { ...p, asignaturas: [...p.asignaturas, asignatura] }
              : p
          ),
        })),

      actualizarAsignatura: (asignaturaActualizada) =>
        set((state) => ({
          planes: state.planes.map((p) =>
            p.id === state.planActivoId
              ? {
                  ...p,
                  asignaturas: p.asignaturas.map((a) =>
                    a.id === asignaturaActualizada.id ? asignaturaActualizada : a
                  ),
                }
              : p
          ),
        })),

      eliminarAsignatura: (id) =>
        set((state) => ({
          planes: state.planes.map((p) =>
            p.id === state.planActivoId
              ? {
                  ...p,
                  asignaturas: p.asignaturas.filter((a) => a.id !== id),
                }
              : p
          ),
        })),

      setLimiteDia: (dia, horaFin) =>
        set((state) => ({
          planes: state.planes.map((p) =>
            p.id === state.planActivoId
              ? {
                  ...p,
                  configGrilla: {
                    limitePorDia: {
                      ...(p.configGrilla?.limitePorDia || LIMITES_DEFECTO),
                      [dia]: horaFin,
                    },
                  },
                }
              : p
          ),
        })),

      setTemaActivo: (tema) =>
        set((state) => ({
          planes: state.planes.map((p) =>
            p.id === state.planActivoId ? { ...p, temaActivo: tema } : p
          ),
        })),

      guardarTemaPersonalizado: (nuevoTema) =>
        set((state) => ({
          temasPersonalizados: [...state.temasPersonalizados, nuevoTema],
          planes: state.planes.map((p) =>
            p.id === state.planActivoId ? { ...p, temaActivo: nuevoTema } : p
          ),
        })),

      eliminarTemaPersonalizado: (id) =>
        set((state) => ({
          temasPersonalizados: state.temasPersonalizados.filter((t) => t.id !== id),
          planes: state.planes.map((p) =>
            p.temaActivo.id === id ? { ...p, temaActivo: TEMAS_PREDEFINIDOS[0] } : p
          ),
        })),
    }),
    {
      name: 'horario-storage-v3',
    }
  )
);
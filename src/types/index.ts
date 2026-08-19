export type ColorAsignatura =
  | 'blue'
  | 'emerald'
  | 'purple'
  | 'amber'
  | 'rose'
  | 'indigo'
  | 'cyan';

export type DiaSemana =
  | 'Lunes'
  | 'Martes'
  | 'Miercoles'
  | 'Jueves'
  | 'Viernes';

export type TipoClase = 'Catedra' | 'Taller' | 'Laboratorio' | 'Ayudantia';

export type CondicionAsignatura = 'Regular' | 'Arrastre' | 'Adelanto';

export interface BloqueHorario {
  id: string;
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
  sala?: string;
  tipo?: TipoClase;
}

export interface Asignatura {
  id: string;
  nombre: string;
  codigo?: string;
  profesor?: string;
  color: ColorAsignatura;
  condicion?: CondicionAsignatura;
  bloques: BloqueHorario[];
  creditosSct?: number;
  horasTp?: number;
  horasTa?: number;
}

export interface TemaHorario {
  id: string;
  nombre: string;
  esPredefinido?: boolean;
  colorTitulo: string;
  colorDias: string;
  colorHoras: string;
}

export interface ConfiguracionGrilla {
  limitePorDia: Record<string, string>;
}

export interface PlanHorario {
  id: string;
  nombre: string;
  asignaturas: Asignatura[];
  temaActivo: TemaHorario;
  configGrilla: ConfiguracionGrilla;
}
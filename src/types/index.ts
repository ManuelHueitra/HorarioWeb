export type DiaSemana = 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes' | 'Sabado';

export type ColorAsignatura =
  | 'blue'
  | 'emerald'
  | 'purple'
  | 'amber'
  | 'rose'
  | 'indigo'
  | 'cyan';

export type TipoBloque = 'Catedra' | 'Taller' | 'Laboratorio' | 'Ayudantia';

export interface BloqueHorario {
  id: string;
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
  sala?: string;
  tipo?: TipoBloque;
}

export interface Asignatura {
  id: string;
  nombre: string;
  codigo?: string;
  profesor?: string;
  color: ColorAsignatura;
  condicion?: 'Al día' | 'Atrasado' | 'Adelantado';
  creditosSct?: number;
  horasTp?: number;
  horasTa?: number;
  bloques: BloqueHorario[];
}

export interface TemaHorario {
  id: string;
  nombre: string;
  esPredefinido: boolean;
  colorTitulo: string;
  colorDias: string;
  colorHoras: string;
  fondo?: string;
  texto?: string;
}

export interface PlanHorario {
  id: string;
  nombre: string;
  asignaturas: Asignatura[];
  temaActivo: TemaHorario;
  configGrilla?: {
    limitePorDia?: Record<string, string>;
  };
}
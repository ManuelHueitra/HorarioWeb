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
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado';

export interface BloqueHorario {
  id?: string;
  dia: DiaSemana | string;
  horaInicio: string;
  horaFin: string;
  sala?: string;
}

export interface Asignatura {
  id: string;
  nombre: string;
  codigo?: string;
  profesor?: string;
  color: ColorAsignatura;
  bloques: BloqueHorario[];
  creditosSct?: number;
  horasTp?: number;
  horasTa?: number;
}
// Dias de la semana permitidos en la matriz
export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

// Colores disponibles para diferenciar visualmente los ramos
export type ColorAsignatura = 
  | 'blue' 
  | 'emerald' 
  | 'purple' 
  | 'amber' 
  | 'rose' 
  | 'indigo' 
  | 'cyan';

// representa un modulo individual de clase
export interface BloqueHorario {
  id: string;  // identificador unico del bloque
  dia: DiaSemana;
  horaInicio: string; // formato 24h
  horaFin: string;   // formato 24h
  sala?: string;    // salas "AULA 102" o "LAB-3"
}

// representa una asignatura universitaria completa
export interface Asignatura {
  id: string;
  nombre: string;
  codigo?: string; // codigo de la asignatura opcional
  profesor?: string; // nombre del profesor 
  color: ColorAsignatura; 
  bloques: BloqueHorario[];
}

// Representa el horario academico global
export interface Horario {
  id: string;
  nombre: string; // Ej: "Semestre I - 2026"
  asignaturas: Asignatura[];
  creadoEn: string; 
  actualizadoEn: string; 
}
export type Turn = 'Mañana' | 'Tarde' | 'Noche';
export type Day = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

export interface TurnWithVirtual {
  turn: Turn;
  isVirtual: boolean;
}

export interface Subject {
  name: string;
  availability: {
    [key in Day]?: TurnWithVirtual[];
  };
  hidden?: boolean;
  priority?: boolean;
}

export interface Schedule {
  [key: string]: {
    day: Day;
    turn: Turn;
    isVirtual?: boolean;
  };
}

export interface Preferences {
  allowSandwich: boolean;
  maxSubjectsPerDay: number;
  blockedSlots: {
    day: Day;
    turn: Turn;
  }[];
}
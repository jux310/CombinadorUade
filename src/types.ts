export type Turn = 'Mañana' | 'Tarde' | 'Noche';
export type Day = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

export interface Subject {
  name: string;
  availability: {
    [key in Day]?: Turn[];
  };
}

export interface Schedule {
  [key: string]: {
    day: Day;
    turn: Turn;
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
export type Turn = 'Mañana' | 'Tarde' | 'Noche';
export type Day = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

export interface CourseInfo {
  turn: Turn;
  campus: string;
}

export interface TurnInfo {
  turn: Turn;
  campus?: string;
}

export interface Subject {
  name: string;
  availability: {
    [key in Day]?: CourseInfo[];
  };
  campus?: string;
  hidden?: boolean;
  priority?: boolean;
}

export interface PinamarCourse {
  name: string;
  dates: string;
  favorite?: boolean;
}

export interface Schedule {
  [key: string]: {
    day: Day;
    turn: Turn;
    campus: string;
  };
}

export interface Preferences {
  allowSandwich: boolean;
  maxSubjectsPerDay: number;
  singleCampusPerDay: boolean;
  preferVirtual: boolean;
  blockedSlots: {
    day: Day;
    turn: Turn;
  }[];
}
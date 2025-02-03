import { Preferences, Subject } from '../types';

interface EncodedData {
  subjects: Subject[];
  preferences: Preferences;
}

export function encodeCSVToURL(csvContent: string): string {
  const base64 = btoa(csvContent);
  return `${window.location.origin}${window.location.pathname}?data=${base64}`;
}

export function encodeDataToURL(data: EncodedData): string {
  const jsonString = JSON.stringify(data);
  const base64 = btoa(encodeURIComponent(jsonString));
  return `${window.location.origin}${window.location.pathname}?data=${base64}`;
}

export function decodeDataFromURL(): EncodedData | null {
  const params = new URLSearchParams(window.location.search);
  const data = params.get('data');
  if (!data) return null;
  
  try {
    const jsonString = decodeURIComponent(atob(data));
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Error decoding URL data:', e);
    return null;
  }
}

export function generateCSVFromSubjects(subjects: Subject[]): string {
  const header = 'Código,Materia,Sede,ID,Modalidad,Idioma,Turno,Año,LUNES,MARTES,MIERCOLES,JUEVES,VIERNES,SABADO,DOMINGO,Horario,Fechas,Tipo\n';
  
  const rows = subjects.map(subject => {
    const days = {
      LUNES: false,
      MARTES: false,
      MIERCOLES: false,
      JUEVES: false,
      VIERNES: false,
      SABADO: false,
      DOMINGO: false
    };
    
    Object.entries(subject.availability).forEach(([day, turns]) => {
      const dayKey = day.toUpperCase().replace('É', 'E');
      days[dayKey] = true;
    });
    
    return `,,${subject.name},,SEMANAL,ESPAÑOL,MAÑANA,,${days.LUNES},${days.MARTES},${days.MIERCOLES},${days.JUEVES},${days.VIERNES},${days.SABADO},${days.DOMINGO},07:45 11:45,,`;
  }).join('\n');
  
  return header + rows;
}

export function decodeCSVFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  const data = params.get('data');
  if (!data) return null;
  
  try {
    return decodeURIComponent(atob(data));
  } catch (e) {
    console.error('Error decoding URL data:', e);
    return null;
  }
}
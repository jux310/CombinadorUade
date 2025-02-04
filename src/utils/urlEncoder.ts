import { Preferences, Subject } from '../types';

interface EncodedData {
  subjects: Subject[];
  preferences: Preferences;
}

export function encodeDataToURL(data: EncodedData): string {
  // Minimizar los datos antes de codificar
  const minData = {
    s: data.subjects.map(s => ({
      n: s.name,
      a: Object.entries(s.availability).reduce((acc, [day, turns]) => {
        acc[day[0]] = turns.map(t => t[0]); // Solo primera letra
        return acc;
      }, {}),
      h: s.hidden
    })),
    p: {
      a: data.preferences.allowSandwich,
      m: data.preferences.maxSubjectsPerDay,
      b: data.preferences.blockedSlots.map(({day, turn}) => 
        `${day[0]}${turn[0]}`
      )
    }
  };
  const jsonString = JSON.stringify(minData);
  const base64 = btoa(encodeURIComponent(jsonString));
  return `${window.location.origin}${window.location.pathname}?data=${base64}`;
}

export function decodeDataFromURL(): EncodedData | null {
  const params = new URLSearchParams(window.location.search);
  const data = params.get('data');
  if (!data) return null;
  
  try {
    const jsonString = decodeURIComponent(atob(data));
    const minData = JSON.parse(jsonString);
    
    // Expandir los datos minimizados
    const dayMap = {
      'L': 'Lunes',
      'M': 'Martes',
      'X': 'Miércoles',
      'J': 'Jueves',
      'V': 'Viernes'
    };
    
    const turnMap = {
      'M': 'Mañana',
      'T': 'Tarde',
      'N': 'Noche'
    };
    
    return {
      subjects: minData.s.map(s => ({
        name: s.n,
        availability: Object.entries(s.a).reduce((acc, [dayKey, turns]) => {
          acc[dayMap[dayKey]] = turns.map(t => turnMap[t]);
          return acc;
        }, {}),
        hidden: s.h
      })),
      preferences: {
        allowSandwich: minData.p.a,
        maxSubjectsPerDay: minData.p.m,
        blockedSlots: minData.p.b.map(slot => ({
          day: dayMap[slot[0]],
          turn: turnMap[slot[1]]
        }))
      }
    };
  } catch (e) {
    console.error('Error decoding URL data:', e);
    return null;
  }
}
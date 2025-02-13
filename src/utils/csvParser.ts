import { Day, Turn, CourseInfo } from '../types';

interface CourseData {
  code: string;
  name: string;
  campus: string;
  id: string;
  modality: string;
  language: string;
  turn: string;
  year: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  schedule: string;
  dates: string;
  type: string;
}

function parseBoolean(value: string): boolean {
  return value.toLowerCase() === 'true';
}

function getCampusAbbreviation(campus: string, modality: string): string {
  if (modality.toUpperCase() === 'VIRTUAL') return 'V';
  
  const campusMap = {
    'MONSERRAT': 'M',
    'BELGRANO': 'B',
    'UADE VIRTUAL': 'V',
    'RECOLETA': 'R'
  };
  return campusMap[campus.toUpperCase()] || '';
}

function parseTurn(schedule: string): Turn {
  const hour = parseInt(schedule.split(' ')[0]);
  if (hour < 12) return 'Mañana';
  if (hour < 18) return 'Tarde';
  return 'Noche';
}

export function parseCSV(content: string) {
  const lines = content.split('\n');
  if (lines.length < 2) return { subjects: [], pinamarCourses: [] };

  const courses: CourseData[] = [];
  const pinamarCourses: PinamarCourse[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map(v => v.trim());
    if (values.length < 17) continue;

    courses.push({
      code: values[0],
      name: values[1],
      campus: values[2],
      id: values[3],
      modality: values[4],
      language: values[5],
      turn: values[6],
      year: values[7],
      monday: parseBoolean(values[8]),
      tuesday: parseBoolean(values[9]),
      wednesday: parseBoolean(values[10]),
      thursday: parseBoolean(values[11]),
      friday: parseBoolean(values[12]),
      saturday: parseBoolean(values[13]),
      sunday: parseBoolean(values[14]),
      schedule: values[15],
      dates: values[16],
      type: values[17] || ''
    });
  }
  
  // Separate Pinamar courses
  const pinamarData = courses.filter(course => 
    course.campus.toUpperCase().includes('PINAMAR')
  ).map(course => ({
    name: course.name,
    dates: course.dates
  }));
  
  // Remove Pinamar courses from main courses list
  const nonPinamarCourses = courses.filter(course =>
    !course.campus.toUpperCase().includes('PINAMAR')
  );

  // Group Pinamar courses by name
  const pinamarCoursesMap = new Map<string, string[]>();
  pinamarData.forEach(course => {
    const existingDates = pinamarCoursesMap.get(course.name) || [];
    if (!existingDates.includes(course.dates)) {
      pinamarCoursesMap.set(course.name, [...existingDates, course.dates]);
    }
  });

  const groupedPinamarCourses = Array.from(pinamarCoursesMap.entries()).map(([name, dates]) => ({
    name,
    dates: dates.join(' | ')
  }));

  // Group courses by name and create subject availability
  const subjectMap = new Map<string, {
    name: string;
    availability: { [key in Day]?: CourseInfo[] }
  }>();

  const dayMap: { [key: string]: Day } = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes'
  };

  for (const course of nonPinamarCourses) {
    if (course.modality.toUpperCase() === 'INTENSIVO') {
      continue;
    }

    const subject = subjectMap.get(course.name) || {
      name: course.name,
      availability: {}
    };

    const turn = parseTurn(course.schedule);
    const campus = getCampusAbbreviation(course.campus, course.modality);

    Object.entries({
      monday: course.monday,
      tuesday: course.tuesday,
      wednesday: course.wednesday,
      thursday: course.thursday,
      friday: course.friday
    }).forEach(([day, available]) => {
      if (available) {
        const dayKey = dayMap[day];
        if (!subject.availability[dayKey]) {
          subject.availability[dayKey] = [];
        }
        
        const courseInfo = {
          turn,
          campus
        };

        const existingCourse = subject.availability[dayKey]!.find(c => 
          c.turn === courseInfo.turn && c.campus === 'V'
        );

        // If we have a virtual course for this time slot, don't add non-virtual ones
        if (courseInfo.campus === 'V' || !existingCourse) {
          // Remove any existing non-virtual courses for this time slot
          if (courseInfo.campus === 'V') {
            subject.availability[dayKey] = subject.availability[dayKey]!.filter(c => 
              !(c.turn === courseInfo.turn && c.campus !== 'V')
            );
          }
          subject.availability[dayKey]!.push(courseInfo);
        }
      }
    });

    subjectMap.set(course.name, subject);
  }

  return {
    subjects: Array.from(subjectMap.values()),
    rawCourses: nonPinamarCourses,
    pinamarCourses: groupedPinamarCourses
  };
}
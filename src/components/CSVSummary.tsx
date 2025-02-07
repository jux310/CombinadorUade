import React from 'react';
import { Info } from 'lucide-react';
import { Subject } from '../types';

interface Props {
  subjects: Subject[];
  rawCourses: any[];
}

export default function CSVSummary({ subjects, rawCourses }: Props) {
  // Get virtual courses
  const virtualCourses = rawCourses.filter(course => 
    course.modality.toUpperCase() === 'VIRTUAL'
  );
  
  // Helper function to get turn from schedule
  const getTurn = (schedule: string) => {
    const hour = parseInt(schedule.split(' ')[0]);
    if (hour < 12) return 'Mañana';
    if (hour < 18) return 'Tarde';
    return 'Noche';
  };
  
  // Find incompatible subjects
  const incompatiblePairs = new Set<string>();
  
  // Helper function to check if two subjects can be taken together
  const areSubjectsIncompatible = (subject1: Subject, subject2: Subject) => {
    // Get all days where either subject has classes
    const allDays = new Set([
      ...Object.keys(subject1.availability),
      ...Object.keys(subject2.availability)
    ]);
    
    // Try to find at least one valid combination
    for (const day1 of allDays) {
      const turns1 = subject1.availability[day1] || [];
      
      for (const day2 of allDays) {
        const turns2 = subject2.availability[day2] || [];
        
        // If different days, we found a valid combination
        if (day1 !== day2) return false;
        
        // If same day but different turns, we found a valid combination
        if (!turns1.every(turn => turns2.includes(turn)) ||
            !turns2.every(turn => turns1.includes(turn))) {
          return false;
        }
      }
    }
    
    // If we couldn't find any valid combination, they're incompatible
    return true;
  };
  
  // Check all pairs of subjects for incompatibility
  for (let i = 0; i < subjects.length; i++) {
    for (let j = i + 1; j < subjects.length; j++) {
      const subject1 = subjects[i];
      const subject2 = subjects[j];
      
      if (areSubjectsIncompatible(subject1, subject2)) {
        incompatiblePairs.add([subject1.name, subject2.name].sort().join(' - '));
      }
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium text-blue-900">Resumen de Materias Importadas</h3>
      </div>
      
      <div className="space-y-4">
        {/* Virtual Courses */}
        {virtualCourses.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Materias Virtuales:</h4>
            <div className="space-y-1">
              {virtualCourses.map((course, index) => {
                const days = [];
                if (course.monday) days.push('Lunes');
                if (course.tuesday) days.push('Martes');
                if (course.wednesday) days.push('Miércoles');
                if (course.thursday) days.push('Jueves');
                if (course.friday) days.push('Viernes');
                
                return (
                  <div key={index} className="text-sm text-gray-700">
                    <span className="font-medium">{course.name}</span>
                    <span className="text-gray-500">
                      {' '}
                      ({days.join(', ')} - {course.schedule})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Incompatible Subjects */}
        {incompatiblePairs.size > 0 && (
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Materias Incompatibles:</h4>
            <div className="space-y-1">
              {Array.from(incompatiblePairs).map((pair, index) => (
                <div key={index} className="text-sm text-gray-700">
                  {pair}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
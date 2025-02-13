import React from 'react';
import { MapPin, Heart } from 'lucide-react';
import { PinamarCourse } from '../types';

interface Props {
  courses: PinamarCourse[];
  onToggleFavorite?: (index: number) => void;
}

export default function PinamarCourses({ courses, onToggleFavorite }: Props) {
  if (courses.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Materias en Sede Pinamar</h3>
        </div>
        <div className="text-sm text-gray-500 ml-2">
          ({courses.length} {courses.length === 1 ? 'materia' : 'materias'})
        </div>
      </div>
      <div className="space-y-2">
        {courses.map((course, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="font-medium">{course.name}</div>
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(index)}
                  className={`text-red-500 transition-colors ${
                    course.favorite ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${course.favorite ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Fechas disponibles:</span>
              <div className="mt-1">
                {course.dates.split(' | ').map((date, i) => (
                  <div key={i} className="ml-2 text-gray-700">• {date}</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
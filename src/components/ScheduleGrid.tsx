import React from 'react';
import { Schedule } from '../types';

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const turns = ['Mañana', 'Tarde', 'Noche'];

interface Props {
  schedule: Schedule;
}

export default function ScheduleGrid({ schedule }: Props) {
  const getSubjectForSlot = (day: string, turn: string) => {
    return Object.entries(schedule).find(
      ([_, slot]) => slot.day === day && slot.turn === turn
    )?.[0] || '';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse bg-white">
        <thead>
          <tr>
            <th className="p-3 border bg-gray-50"></th>
            {days.map(day => (
              <th key={day} className="p-3 border bg-gray-50 font-semibold">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {turns.map(turn => (
            <tr key={turn}>
              <td className="p-3 border font-medium bg-gray-50">{turn}</td>
              {days.map(day => (
                <td key={`${day}-${turn}`} className="p-3 border text-center">
                  {getSubjectForSlot(day, turn)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
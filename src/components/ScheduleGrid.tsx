import React from 'react';
import { Schedule } from '../types';

const days = {
  full: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
  short: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie']
};
const turns = {
  full: ['Mañana', 'Tarde', 'Noche'],
  short: ['☀️ M', '🌤️ T', '🌙 N']
};

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
      <table className="min-w-full border-collapse bg-white md:hidden">
        <thead>
          <tr>
            <th className="p-3 border bg-gray-50"></th>
            {turns.short.map((turn, i) => (
              <th key={turn} className="p-3 border bg-gray-50 font-semibold">{turn}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.short.map((day, i) => (
            <tr key={day}>
              <td className="p-3 border font-medium bg-gray-50 whitespace-nowrap">{day}</td>
              {turns.full.map((turn, j) => (
                <td key={`${days.full[i]}-${turn}`} className="p-3 border text-center min-h-[60px]">
                  {getSubjectForSlot(days.full[i], turn)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <table className="min-w-full border-collapse bg-white hidden md:table">
        <thead>
          <tr>
            <th className="p-3 border bg-gray-50"></th>
            {days.full.map(day => (
              <th key={day} className="p-3 border bg-gray-50 font-semibold">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {turns.full.map(turn => (
            <tr key={turn}>
              <td className="p-3 border font-medium bg-gray-50">{turn}</td>
              {days.full.map(day => (
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
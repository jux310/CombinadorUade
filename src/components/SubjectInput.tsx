import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { Day, Subject, Turn } from '../types';

interface Props {
  onAddSubject: (subject: Subject) => void;
  editingSubject?: Subject;
  onCancelEdit?: () => void;
}

const days: Day[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const turns: Turn[] = ['Mañana', 'Tarde', 'Noche'];

export default function SubjectInput({ onAddSubject, editingSubject, onCancelEdit }: Props) {
  const [name, setName] = useState(editingSubject?.name || '');
  const [availability, setAvailability] = useState<Subject['availability']>(editingSubject?.availability || {});

  const handleCancel = () => {
    setName('');
    setAvailability({});
    onCancelEdit?.();
  };

  React.useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name);
      setAvailability(editingSubject.availability);
    }
  }, [editingSubject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || Object.keys(availability).length === 0) return;

    onAddSubject({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      availability,
    });

    setName('');
    setAvailability({});
  };

  const toggleAvailability = (day: Day, turn: Turn) => {
    setAvailability(prev => {
      const newAvailability = { ...prev };
      if (!newAvailability[day]) {
        newAvailability[day] = [turn];
      } else if (newAvailability[day]?.includes(turn)) {
        newAvailability[day] = newAvailability[day]?.filter(t => t !== turn);
        if (newAvailability[day]?.length === 0) {
          delete newAvailability[day];
        }
      } else {
        newAvailability[day] = [...(newAvailability[day] || []), turn];
      }
      return newAvailability;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        {editingSubject && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        )}
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={editingSubject ? "Modificar nombre de la materia" : "Nombre de la materia"}
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={!name.trim() || Object.keys(availability).length === 0}
          className={`btn ${
            editingSubject 
              ? 'bg-green-500 hover:bg-green-600 text-white hover:shadow-md' 
              : 'btn-primary'
          }`}
        >
          {editingSubject ? 'Guardar Cambios' : 'Agregar Materia'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border"></th>
              {days.map(day => (
                <th key={day} className="p-2 border">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {turns.map(turn => (
              <tr key={turn}>
                <td className="p-2 border font-medium">{turn}</td>
                {days.map(day => (
                  <td key={`${day}-${turn}`} className="p-2 border text-center">
                    <button
                      type="button"
                      onClick={() => toggleAvailability(day, turn)}
                      className={`w-6 h-6 rounded transition-colors ${
                        availability[day]?.includes(turn)
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {availability[day]?.includes(turn) && <X className="w-4 h-4" />}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}
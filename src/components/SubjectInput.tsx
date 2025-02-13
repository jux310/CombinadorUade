import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { Day, Subject, Turn } from '../types';

const CAMPUS_CYCLE = ['M', 'V', 'R', 'B'];

const days = {
  full: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] as Day[],
  short: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie']
};
const turns = {
  full: ['Mañana', 'Tarde', 'Noche'] as Turn[],
  short: ['M', 'T', 'N']
};

interface Props {
  onAddSubject: (subject: Subject) => void;
  editingSubject?: Subject;
  onCancelEdit?: () => void;
}

export default function SubjectInput({ onAddSubject, editingSubject, onCancelEdit }: Props) {
  const [name, setName] = useState(editingSubject?.name || '');
  const [availability, setAvailability] = useState<Subject['availability']>(editingSubject?.availability || {});
  const [selectedCampus, setSelectedCampus] = useState<{ [key: string]: string }>({});
  const [priority, setPriority] = useState(editingSubject?.priority || false);

  const handleCancel = () => {
    setName('');
    setAvailability({});
    setSelectedCampus({});
    setPriority(false);
    onCancelEdit?.();
  };

  React.useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name);
      setAvailability(editingSubject.availability || {});
      const newSelectedCampus: { [key: string]: string } = {};
      Object.entries(editingSubject.availability || {}).forEach(([day, turns]) => {
        turns.forEach(({ turn, campus }) => {
          if (campus) {
            newSelectedCampus[`${day}-${turn}`] = campus;
          }
        });
      });
      setSelectedCampus(newSelectedCampus);
      setPriority(editingSubject.priority || false);
    }
  }, [editingSubject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || Object.keys(availability).length === 0) return;

    onAddSubject({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      availability: Object.entries(availability).reduce((acc, [day, turns]) => {
        acc[day] = turns.map(({ turn }) => ({
          turn,
          campus: selectedCampus[`${day}-${turn}`]
        }));
        return acc;
      }, {} as Subject['availability']),
      priority,
    });

    setName('');
    setAvailability({});
    setSelectedCampus({});
    setPriority(false);
  };

  const toggleAvailability = (day: Day, turnToToggle: Turn, isShiftClick?: boolean) => {
    const slotKey = `${day}-${turnToToggle}`;
    
    // If shift is pressed, cycle through campus options
    if (isShiftClick && availability[day]?.some(t => t.turn === turnToToggle)) {
      setSelectedCampus(prev => {
        const currentCampus = prev[slotKey];
        const currentIndex = CAMPUS_CYCLE.indexOf(currentCampus || '');
        const nextCampus = currentIndex === -1 ? CAMPUS_CYCLE[0] : 
                          currentIndex === CAMPUS_CYCLE.length - 1 ? undefined : 
                          CAMPUS_CYCLE[currentIndex + 1];
        
        const newSelectedCampus = { ...prev };
        if (nextCampus) {
          newSelectedCampus[slotKey] = nextCampus;
        } else {
          delete newSelectedCampus[slotKey];
        }
        return newSelectedCampus;
      });
      return;
    }

    setAvailability(prev => {
      const newAvailability = { ...prev };
      if (!newAvailability[day]) {
        newAvailability[day] = [{ turn: turnToToggle }];
      } else if (newAvailability[day]?.some(t => t.turn === turnToToggle)) {
        newAvailability[day] = newAvailability[day]?.filter(t => t.turn !== turnToToggle);
        if (newAvailability[day]?.length === 0) {
          delete newAvailability[day];
        }
        // Remove campus selection when slot is deselected
        setSelectedCampus(prev => {
          const newSelectedCampus = { ...prev };
          delete newSelectedCampus[slotKey];
          return newSelectedCampus;
        });
      } else {
        newAvailability[day] = [...(newAvailability[day] || []), { turn: turnToToggle }];
      }
      return newAvailability;
    });
  };

  const handleCellClick = (day: Day, turn: Turn, e: React.MouseEvent) => {
    toggleAvailability(day, turn, e.shiftKey);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        {editingSubject && (
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="priority"
            checked={priority}
            onChange={(e) => setPriority(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label htmlFor="priority" className="text-gray-700 whitespace-nowrap">
            Prioridad
          </label>
        </div>
        <button
          type="submit"
          disabled={!name.trim() || Object.keys(availability).length === 0}
          className={`w-full sm:w-auto btn ${
            editingSubject 
              ? 'bg-green-500 hover:bg-green-600 text-white hover:shadow-md' 
              : 'btn-primary'
          }`}
        >
          {editingSubject ? 'Guardar Cambios' : 'Agregar Materia'}
        </button>
      </div>

      {name.trim() && <div className="overflow-x-auto">
        <table className="min-w-full border-collapse md:hidden">
          <thead>
            <tr>
              <th className="p-2 border"></th>
              {turns.short.map((turn, i) => (
                <th key={turn} className="p-2 border">{turn}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.short.map((day, i) => (
              <tr key={day}>
                <td className="p-2 border font-medium whitespace-nowrap">{day}</td>
                {turns.full.map((turn, j) => (
                  <td key={`${days.full[i]}-${turn}`} className="p-2 border text-center">
                    <button
                      type="button"
                      onClick={(e) => handleCellClick(days.full[i], turn, e)}
                      className={`w-6 h-6 rounded transition-colors ${
                        availability[days.full[i]]?.some(t => t.turn === turn)
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {availability[days.full[i]]?.some(t => t.turn === turn) && (
                        selectedCampus[`${days.full[i]}-${turn}`] || <X className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <table className="min-w-full border-collapse hidden md:table">
          <thead>
            <tr>
              <th className="p-2 border"></th>
              {days.full.map(day => (
                <th key={day} className="p-2 border">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {turns.full.map(turn => (
              <tr key={turn}>
                <td className="p-2 border font-medium">{turn}</td>
                {days.full.map(day => (
                  <td key={`${day}-${turn}`} className="p-2 border text-center">
                    <button
                      type="button"
                      onClick={(e) => handleCellClick(day, turn, e)}
                      className={`w-6 h-6 rounded transition-colors ${
                        availability[day]?.some(t => t.turn === turn)
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {availability[day]?.some(t => t.turn === turn) && (
                        selectedCampus[`${day}-${turn}`] || <X className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-sm text-gray-600">
          <p>Shift + Click en una celda para cambiar la sede: M (Monserrat) → V (Virtual) → R (Recoleta) → B (Belgrano)</p>
        </div>
      </div>
      }
    </form>
  );
}
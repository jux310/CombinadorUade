import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, X, Heart, Settings, ChevronDown, ChevronUp, BookOpen, ListPlus, Layout } from 'lucide-react';
import { Preferences, Schedule, Subject } from './types';
import SubjectInput from './components/SubjectInput';
import ScheduleGrid from './components/ScheduleGrid';
import { generateSchedules } from './utils/scheduleGenerator';

export default function App() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState(0);
  const [editingSubject, setEditingSubject] = useState<{ subject: Subject; index: number } | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    allowSandwich: false,
    maxSubjectsPerDay: 2,
    blockedSlots: [],
  });

  const handleAddSubject = (subject: Subject) => {
    if (editingSubject) {
      const newSubjects = subjects.map((s, i) => i === editingSubject.index ? subject : s);
      const generated = generateSchedules(newSubjects, preferences);
      setSchedules(generated);
      setFavorites([]);
      setCurrentSchedule(0);
      setEditingSubject(null);
    } else {
      setSubjects(prev => [...prev, subject]);
      setSchedules([]);
      setFavorites([]);
      setCurrentSchedule(0);
    }
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(prev => prev.filter((_, i) => i !== index));
    setSchedules([]);
    setCurrentSchedule(0);
  };

  const generateSchedulesIfNeeded = useCallback(() => {
    const generated = generateSchedules(subjects, preferences);
    setSchedules(generated);
    setFavorites([]);
    setCurrentSchedule(0);
  }, [subjects, preferences]);

  useEffect(() => {
    generateSchedulesIfNeeded();
  }, [generateSchedulesIfNeeded]);

  const toggleFavorite = (index: number) => {
    setFavorites(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto sm:p-6">
        <header className="text-center mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
            <Calendar className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Combinador de Horarios
            </h1>
          </div>
        </header>

        <div className="flex flex-col gap-4 sm:gap-8">
          <section className="card p-6">
            <div 
              className="flex items-center justify-between cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => setShowPreferences(!showPreferences)}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                <h2 className="text-xl font-semibold">Preferencias</h2>
              </div>
              {showPreferences ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div className={`space-y-4 ${showPreferences ? 'mt-4' : 'hidden'}`}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowSandwich"
                  checked={preferences.allowSandwich}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    allowSandwich: e.target.checked
                  }))}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="allowSandwich" className="text-gray-700">
                  Permitir horarios sandwich (cursar mañana y noche sin tarde)
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor="maxSubjectsPerDay" className="text-gray-700">
                  Máximo de materias por día:
                </label>
                <select
                  id="maxSubjectsPerDay"
                  value={preferences.maxSubjectsPerDay}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    maxSubjectsPerDay: parseInt(e.target.value)
                  }))}
                  className="select"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Horarios Bloqueados</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 border"></th>
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(day => (
                          <th key={day} className="p-2 border">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['Mañana', 'Tarde', 'Noche'].map(turn => (
                        <tr key={turn}>
                          <td className="p-2 border font-medium">{turn}</td>
                          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(day => (
                            <td key={`${day}-${turn}`} className="p-2 border text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setPreferences(prev => {
                                    const isBlocked = prev.blockedSlots.some(
                                      slot => slot.day === day && slot.turn === turn
                                    );
                                    return {
                                      ...prev,
                                      blockedSlots: isBlocked
                                        ? prev.blockedSlots.filter(
                                            slot => !(slot.day === day && slot.turn === turn)
                                          )
                                        : [...prev.blockedSlots, { day, turn }],
                                    };
                                  });
                                }}
                                className={`w-6 h-6 rounded-md transition-all duration-200 ${
                                  preferences.blockedSlots.some(
                                    slot => slot.day === day && slot.turn === turn
                                  )
                                    ? 'bg-red-500 text-white shadow-sm'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {preferences.blockedSlots.some(
                                  slot => slot.day === day && slot.turn === turn
                                ) && <X className="w-4 h-4" />}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center gap-2 mb-2">
              <ListPlus className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
              <h2 className="text-xl font-semibold">
                {editingSubject ? 'Editar Materia' : 'Agregar Materia'}
              </h2>
            </div>
            <SubjectInput 
              onAddSubject={handleAddSubject}
              editingSubject={editingSubject?.subject}
              onCancelEdit={() => setEditingSubject(null)}
            />
          </section>

          {subjects.length > 0 && (
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                  <h2 className="text-xl font-semibold">Materias Agregadas</h2>
                </div>
              </div>
              <div className="space-y-2">
                {subjects.map((subject, index) => (
                  <div
                    key={index}
                    onClick={() => setEditingSubject({ subject, index })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingSubject({ subject, index })}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span>{subject.name}</span>
                      <span className="text-sm text-gray-500">(Clic para editar)</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSubject(index);
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {schedules.length > 0 && (
            <>
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layout className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Combinación {currentSchedule + 1} de {schedules.length}
                  </h2>
                  <button
                    onClick={() => toggleFavorite(currentSchedule)}
                    className={`text-red-500 transition-colors ml-2 ${
                      favorites.includes(currentSchedule) ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(currentSchedule) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setCurrentSchedule(prev => Math.max(0, prev - 1))}
                    disabled={currentSchedule === 0}
                    className="btn-secondary flex-1"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentSchedule(prev => Math.min(schedules.length - 1, prev + 1))}
                    disabled={currentSchedule === schedules.length - 1}
                    className="btn-secondary flex-1"
                  >
                    Siguiente
                  </button>
              </div>
              <ScheduleGrid schedule={schedules[currentSchedule]} />
            </section>
            {favorites.length > 0 && (
              <section className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                  <h2 className="text-xl font-semibold">Combinaciones Favoritas</h2>
                </div>
                <div className="space-y-6">
                  {favorites.map(index => (
                    <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Combinación {index + 1}</h3>
                        <button
                          onClick={() => toggleFavorite(index)}
                          className="text-red-500"
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                      <ScheduleGrid schedule={schedules[index]} />
                    </div>
                  ))}
                </div>
              </section>
            )}
            </>
          )}
        </div>
        <footer className="mt-8 text-center text-gray-600">
          <a
            href="https://github.com/jux310/CombinadorUade"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-blue-500 transition-colors"
          >
            Ver en GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}
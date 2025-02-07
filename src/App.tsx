import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, X, Heart, Settings, ChevronDown, ChevronUp, BookOpen, ListPlus, Layout, Download, Share2, Eye, EyeOff, Maximize } from 'lucide-react';
import { Preferences, Schedule, Subject } from './types';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CSVImport from './components/CSVImport';
import { PDFSchedule } from './components/PDFSchedule';
import CSVSummary from './components/CSVSummary';
import SubjectInput from './components/SubjectInput';
import ScheduleGrid from './components/ScheduleGrid';
import { decodeDataFromURL, encodeDataToURL } from './utils/urlEncoder';
import { parseCSV } from './utils/csvParser';
import { generateSchedules, findMaxSubjectsCombination } from './utils/scheduleGenerator';

export default function App() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState(0);
  const [currentMaxSchedule, setCurrentMaxSchedule] = useState(0);
  const [maxSubjectsFavorites, setMaxSubjectsFavorites] = useState<number[]>([]);
  const [maxSubjectsSchedule, setMaxSubjectsSchedule] = useState<{
    maxSubjects: number;
    schedules: Schedule[];
    selectedSubjects: string[];
  } | null>(null);
  const [editingSubject, setEditingSubject] = useState<{ subject: Subject; index: number } | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [importedData, setImportedData] = useState<{
    subjects: Subject[];
    rawCourses: any[];
  } | null>(null);

  const [preferences, setPreferences] = useState<Preferences>({
    allowSandwich: false,
    maxSubjectsPerDay: 2,
    blockedSlots: [],
  });
  const [pdfError, setPdfError] = useState<boolean>(false);

  const getPDFDocument = () => {
    try {
      const validSchedules = [
        ...(maxSubjectsSchedule ? maxSubjectsFavorites.map(i => maxSubjectsSchedule.schedules[i]) : []),
        ...favorites.map(i => schedules[i])
      ].filter(Boolean);

      if (validSchedules.length === 0) {
        setPdfError(true);
        return null;
      }

      return <PDFSchedule schedules={validSchedules} />;
    } catch (error) {
      console.error('Error creating PDF document:', error);
      setPdfError(true);
      return null;
    }
  };

  const handleImport = (subjects: Subject[]) => {
    setSubjects(subjects);
    setShowPreferences(false);
  };

  useEffect(() => {
    const data = decodeDataFromURL();
    if (data) {
      setSubjects(data.subjects);
      setPreferences(data.preferences);
    }
  }, []);

  const handleAddSubject = (subject: Subject) => {
    if (editingSubject) {
      const newSubjects = subjects.map((s, i) => i === editingSubject.index ? subject : s);
      setSubjects(newSubjects);
      setEditingSubject(null);
    } else {
      setSubjects(prev => [...prev, subject]);
    }
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSubjectVisibility = (index: number) => {
    setSubjects(prev => prev.map((subject, i) => 
      i === index ? { ...subject, hidden: !subject.hidden } : subject
    ));
  };

  const generateSchedulesIfNeeded = useCallback(() => {
    const generated = generateSchedules(subjects, preferences);
    setSchedules(generated);
    setFavorites([]);
    setCurrentSchedule(0);
  }, [subjects, preferences]);

  useEffect(() => {
    generateSchedulesIfNeeded();
    if (subjects.length > 0) {
      const maxResult = findMaxSubjectsCombination(subjects, preferences);
      setMaxSubjectsSchedule(maxResult);
    } else {
      setMaxSubjectsSchedule(null);
    }
  }, [generateSchedulesIfNeeded, subjects, preferences]);

  const toggleFavorite = (index: number) => {
    setFavorites(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleMaxSubjectsFavorite = (index: number) => {
    setMaxSubjectsFavorites(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleShare = () => {
    const data = {
      subjects,
      preferences
    };
    const shareableUrl = encodeDataToURL(data);
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableUrl).then(() => {
      alert('¡URL copiada al portapapeles!');
    }).catch(err => {
      console.error('Error al copiar:', err);
      alert('Error al copiar la URL');
    });
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

              {preferences.maxSubjectsPerDay > 1 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowSandwich"
                    checked={!preferences.allowSandwich}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      allowSandwich: !e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="allowSandwich" className="text-gray-700">
                    Excluir días sándwich (Cursar mañana y noche)
                  </label>
                </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Importar/Exportar</h3>
                  <div className="flex items-center gap-2">
                    <CSVImport 
                      onImport={handleImport}
                      onDataParsed={setImportedData}
                    />
                    {subjects.length > 0 && (
                      <button
                        onClick={handleShare}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
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

          {/* CSV Summary Section */}
          {importedData && (
            <section className="card p-6">
              <CSVSummary subjects={importedData.subjects} rawCourses={importedData.rawCourses} />
            </section>
          )}

          <section className="card p-6">
            <div className="flex items-center gap-2 mb-2">
              <ListPlus className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
              <h2 className="text-xl font-semibold">
                {editingSubject ? 'Editar Materia' : 'Agregar Materias'}
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSubjectVisibility(index);
                        }}
                        className={`text-gray-500 hover:text-gray-700 transition-colors ${
                          subject.hidden ? 'text-gray-400' : ''
                        }`}
                      >
                        {subject.hidden ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                      <span>{subject.name}</span>
                      {subject.hidden && (
                        <span className="text-sm text-gray-500">(Oculta)</span>
                      )}
                      {subject.priority && (
                        <span className="text-sm text-blue-500">(Prioridad)</span>
                      )}
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
            <div className="space-y-4 sm:space-y-8">
            {maxSubjectsSchedule && (
              <section className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Maximize className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                    <h2 className="text-lg sm:text-xl font-semibold">
                      Máximo de Materias en Simultáneo: {maxSubjectsSchedule.maxSubjects} 
                      {maxSubjectsSchedule.schedules.length > 1 && (
                        <span className="text-gray-500 ml-2">
                          (Combinación {currentMaxSchedule + 1} de {maxSubjectsSchedule.schedules.length})
                        </span>
                      )}
                    </h2>
                    </div>
                    <button
                      onClick={() => toggleMaxSubjectsFavorite(currentMaxSchedule)}
                      className={`text-red-500 transition-colors ${
                        maxSubjectsFavorites.includes(currentMaxSchedule) ? 'opacity-100' : 'opacity-50'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${maxSubjectsFavorites.includes(currentMaxSchedule) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
                {maxSubjectsSchedule.schedules.length > 1 ? (
                  <>
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setCurrentMaxSchedule(prev => Math.max(0, prev - 1))}
                        disabled={currentMaxSchedule === 0}
                        className="btn-secondary flex-1"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentMaxSchedule(prev => 
                          Math.min(maxSubjectsSchedule.schedules.length - 1, prev + 1)
                        )}
                        disabled={currentMaxSchedule === maxSubjectsSchedule.schedules.length - 1}
                        className="btn-secondary flex-1"
                      >
                        Siguiente
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 mb-4">
                    Única opción
                  </div>
                )}
                <ScheduleGrid schedule={maxSubjectsSchedule.schedules[currentMaxSchedule]} />
              </section>
            )}
            {subjects.some(subject => !subject.hidden) && (
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
            )}
            {(favorites.length > 0 || maxSubjectsFavorites.length > 0) && (
              <section className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                  <h2 className="text-xl font-semibold flex-1">Combinaciones Favoritas</h2>
                  {maxSubjectsFavorites.length > 0 && (
                    <div className="text-sm text-gray-500 mr-4">
                      ({maxSubjectsFavorites.length} máximas, {favorites.length} normales)
                    </div>
                  )}
                  {pdfError ? (
                    <button
                      onClick={() => setPdfError(false)}
                      className="btn-secondary inline-flex items-center gap-2 sm:gap-2 text-red-500"
                      title="Error al generar PDF. Intente de nuevo."
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Error</span>
                    </button>
                  ) : (
                    <PDFDownloadLink
                      document={getPDFDocument()}
                      fileName="horarios.pdf"
                      className="btn-secondary inline-flex items-center gap-2 sm:gap-2"
                    >
                      {({ loading, error }) => 
                        loading ? (
                          <span className="inline-flex items-center gap-2">
                            <Download className="w-4 h-4 animate-pulse" />
                            <span className="hidden sm:inline">Generando...</span>
                          </span>
                        ) : error ? (
                          <span className="inline-flex items-center gap-2 text-red-500">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Error</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Descargar</span>
                          </span>
                        )
                      }
                    </PDFDownloadLink>
                  )}
                </div>
                <div className="space-y-6">
                  {maxSubjectsFavorites.length > 0 && (
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-medium mb-4">Combinaciones Máximas Favoritas</h3>
                      {maxSubjectsFavorites.map(index => (
                        <div key={`max-${index}`} className="mb-6 last:mb-0">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-base font-medium">
                              Máximo de Materias ({maxSubjectsSchedule!.maxSubjects}) - Combinación {index + 1}
                            </h4>
                            <button
                              onClick={() => toggleMaxSubjectsFavorite(index)}
                              className="text-red-500"
                            >
                              <Heart className="w-5 h-5 fill-current" />
                            </button>
                          </div>
                          <ScheduleGrid schedule={maxSubjectsSchedule!.schedules[index]} />
                        </div>
                      ))}
                    </div>
                  )}
                  {favorites.map(index => (
                    <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Combinación Normal {index + 1}</h3>
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
            </div>
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
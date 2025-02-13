import React, { useRef } from 'react';
import { FileUp } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';
import { Subject, PinamarCourse } from '../types';

interface Props {
  onImport: (subjects: Subject[]) => void;
  onPinamarCoursesFound?: (courses: PinamarCourse[]) => void;
}

export default function CSVImport({ onImport, onPinamarCoursesFound }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const { subjects, pinamarCourses } = parseCSV(content);
      const subjectsWithHidden = subjects.map(subject => ({
        ...subject,
        hidden: true
      }));
      onImport(subjectsWithHidden);
      if (onPinamarCoursesFound && pinamarCourses.length > 0) {
        onPinamarCoursesFound(pinamarCourses);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors"
      >
        <FileUp className="w-5 h-5" />
        <span>Importar CSV</span>
      </button>
    </div>
  );
}
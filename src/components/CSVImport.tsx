import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';
import { Subject } from '../types';

interface Props {
  onImport: (subjects: Subject[]) => void;
  onDataParsed: (data: { subjects: Subject[]; rawCourses: any[] }) => void;
}

export default function CSVImport({ onImport, onDataParsed }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsedData = parseCSV(content);
      const subjectsWithHidden = parsedData.subjects.map(subject => ({
        ...subject,
        hidden: true
      }));
      onDataParsed({
        subjects: subjectsWithHidden,
        rawCourses: parsedData.rawCourses
      });
      onImport(subjectsWithHidden);
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
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Upload className="w-4 h-4" />
      </button>
    </div>
  );
}
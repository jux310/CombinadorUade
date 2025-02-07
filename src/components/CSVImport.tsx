import React, { useRef } from 'react';
import { FileUp } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';
import { Subject } from '../types';

interface Props {
  onImport: (subjects: Subject[]) => void;
}

export default function CSVImport({ onImport }: Props) {
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
        className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors"
      >
        <FileUp className="w-5 h-5" />
        <span>Importar CSV</span>
      </button>
    </div>
  );
}
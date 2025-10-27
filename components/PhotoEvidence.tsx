import React, { useState, useRef } from 'react';
import { CameraIcon, DocumentTextIcon, PaperClipIcon } from './icons';
import PhotoCaptureModal from './PhotoCaptureModal';
import { Evidence } from '../types';

interface PhotoEvidenceProps {
  evidence: Evidence[];
  isEditable: boolean;
  onAddEvidence: (evidenceItem: Evidence) => void;
}

const PhotoEvidence: React.FC<PhotoEvidenceProps> = ({ evidence, isEditable, onAddEvidence }) => {
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCaptureModalOpen = modalTitle !== null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = e.target?.result as string;
        onAddEvidence({
            data,
            name: file.name,
            type: file.type,
        });
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Allow re-uploading the same file
  };

  const handleCapture = (photoData: string) => {
    onAddEvidence({
      data: photoData,
      name: `capture-${Date.now()}.jpg`,
      type: 'image/jpeg'
    });
  };

  return (
    <div className="bg-gray-900 p-4 rounded-b-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-300">General Evidence</h3>
        {isEditable && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 rounded-md font-semibold transition-colors"
            >
                <PaperClipIcon className="w-5 h-5" />
                Attach Document
            </button>
            <button
              onClick={() => setModalTitle('Scan Document')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold transition-colors"
            >
              <DocumentTextIcon className="w-5 h-5" />
              Scan Document
            </button>
            <button
              onClick={() => setModalTitle('Capture Photo Evidence')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition-colors"
            >
              <CameraIcon className="w-5 h-5" />
              Take Photo
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {evidence.map((item, index) => (
          <div key={index} className="aspect-video bg-gray-700 rounded-md overflow-hidden group relative">
            {item.type.startsWith('image/') ? (
                <img src={item.data} alt={item.name} className="w-full h-full object-cover" />
            ) : (
                <a href={item.data} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center h-full p-2 text-center hover:bg-gray-600 transition-colors">
                    <DocumentTextIcon className="w-10 h-10 text-gray-400" />
                    <span className="text-xs text-gray-300 mt-2 break-all line-clamp-2">{item.name}</span>
                </a>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {item.name}
            </div>
          </div>
        ))}
        {evidence.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-4">No photos or documents have been added yet.</p>
        )}
      </div>

      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.png,.jpg,.jpeg"
      />

      {isCaptureModalOpen && (
        <PhotoCaptureModal
          title={modalTitle!}
          onCapture={handleCapture}
          onClose={() => setModalTitle(null)}
        />
      )}
    </div>
  );
};

export default PhotoEvidence;
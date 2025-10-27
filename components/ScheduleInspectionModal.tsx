import React, { useState } from 'react';
import { User } from '../types';

interface ScheduleInspectionModalProps {
  inspectors: Omit<User, 'password'>[];
  onClose: () => void;
  onSchedule: (title: string, inspectorId: string) => void;
}

const ScheduleInspectionModal: React.FC<ScheduleInspectionModalProps> = ({ inspectors, onClose, onSchedule }) => {
  const [title, setTitle] = useState('');
  const [selectedInspector, setSelectedInspector] = useState<string>(inspectors[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && selectedInspector) {
      onSchedule(title.trim(), selectedInspector);
    } else if (!selectedInspector) {
        alert("Please assign an inspector.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">Schedule New Inspection</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">
              Inspection Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="e.g., AS9102 FAI for Part XYZ"
            />
          </div>
          <div>
            <label htmlFor="inspector" className="block text-sm font-medium text-gray-400 mb-2">
              Assign to Inspector
            </label>
            <select
                id="inspector"
                value={selectedInspector}
                onChange={(e) => setSelectedInspector(e.target.value)}
                required
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
                <option value="" disabled>Select an Inspector</option>
                {inspectors.map(inspector => (
                    <option key={inspector.id} value={inspector.id}>{inspector.username}</option>
                ))}
            </select>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
            >
              Schedule & Get Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleInspectionModal;
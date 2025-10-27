
import React from 'react';
import { InspectionStatus } from '../types';

interface DigitalTagModalProps {
  status: InspectionStatus;
  inspectionId: string;
  onNewInspection: () => void;
}

const DigitalTagModal: React.FC<DigitalTagModalProps> = ({ status, inspectionId, onNewInspection }) => {
  const statusConfig = {
    'Accepted': {
      bgColor: 'bg-green-600',
      textColor: 'text-green-100',
      borderColor: 'border-green-400',
    },
    'Rejected': {
      bgColor: 'bg-red-600',
      textColor: 'text-red-100',
      borderColor: 'border-red-400',
    },
    'Rework': {
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-100',
      borderColor: 'border-yellow-300',
    },
    'Approved with Deviation': {
      bgColor: 'bg-blue-600',
      textColor: 'text-blue-100',
      borderColor: 'border-blue-400',
    }
  }[status];

  const completionDate = new Date().toLocaleString();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center transform transition-all scale-100">
        <h2 className="text-2xl font-bold text-gray-200 mb-2">Inspection Complete</h2>
        <p className="text-gray-400 mb-6">A digital inspection tag has been generated.</p>

        {/* New Tag Design */}
        <div className={`p-6 rounded-lg border-4 ${statusConfig.borderColor} bg-gray-900 flex flex-col items-center gap-4 text-white`}>
            {/* Header */}
            <div className="w-full text-center border-b-2 pb-2 border-gray-600">
                <h3 className="text-2xl font-bold text-cyan-400">Qopikun Services</h3>
                <p className="text-xs text-gray-400">Digital Inspection Tag</p>
            </div>

            {/* Status */}
            <div className={`w-full py-4 rounded ${statusConfig.bgColor}`}>
                <h3 className={`text-5xl font-extrabold tracking-wider uppercase ${statusConfig.textColor}`}>{status}</h3>
            </div>

            {/* Details */}
            <div className="w-full text-left space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-400">Inspection ID:</span>
                    <span className="font-mono font-semibold">{inspectionId}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Date Completed:</span>
                    <span className="font-mono font-semibold">{completionDate}</span>
                </div>
            </div>
        </div>

        <p className="text-sm text-gray-500 mt-6">The inspection report and digital tag have been emailed to all participants.</p>
        
        <button
          onClick={onNewInspection}
          className="mt-6 w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default DigitalTagModal;

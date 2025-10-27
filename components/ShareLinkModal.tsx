import React, { useState } from 'react';
import { InspectionReport } from '../types';
import { ClipboardCopyIcon, CheckCircleIcon } from './icons';

interface ShareLinkModalProps {
  inspection: InspectionReport;
  onClose: () => void;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ inspection, onClose }) => {
  const [copied, setCopied] = useState(false);
  const inspectionLink = `${window.location.href.split('#')[0]}#/inspection/${inspection.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inspectionLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleSendEmail = () => {
    alert(`An email with the inspection link would be sent to the participants.\n\nLink: ${inspectionLink}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-200 mb-2">Inspection Scheduled!</h2>
        <p className="text-gray-400 mb-6">Share the following link with the Supervisor, Client, and End User.</p>
        
        <div className="bg-gray-900 p-4 rounded-md flex items-center gap-4">
          <input
            type="text"
            value={inspectionLink}
            readOnly
            className="w-full bg-transparent text-gray-300 font-mono text-sm focus:outline-none"
          />
          <button onClick={handleCopy} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md">
            {copied ? <CheckCircleIcon className="w-5 h-5 text-green-400"/> : <ClipboardCopyIcon className="w-5 h-5" />}
          </button>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
           <button
              onClick={handleSendEmail}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Simulate Sending Email
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;

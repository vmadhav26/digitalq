
import React, { useState } from 'react';
import { InspectionReport } from '../types';
import { getInspectionSummary } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface AIAssistantProps {
  report: InspectionReport;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ report }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary('');
    try {
      const result = await getInspectionSummary(report);
      setSummary(result);
    } catch (error) {
      console.error(error);
      setSummary('Failed to generate summary.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const hasFailures = report.parameters.some(p => p.status === 'Fail');

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
        <h2 className="text-lg font-semibold text-gray-300">AI Assistant</h2>
        <SparklesIcon className="w-5 h-5 text-cyan-400"/>
      </button>
      {isOpen && (
        <div className="mt-4">
          <button
            onClick={handleGenerateSummary}
            disabled={isLoading || !hasFailures}
            className="w-full px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
                'Generate Summary & Actions'
            )}
          </button>
          {!hasFailures && <p className="text-xs text-gray-500 mt-2 text-center">AI analysis available when deviations are detected.</p>}

          {summary && (
            <div className="mt-4 p-3 bg-gray-800 rounded-md text-sm text-gray-300 whitespace-pre-wrap font-mono">
              {summary}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;

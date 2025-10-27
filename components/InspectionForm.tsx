import React, { useState } from 'react';
import { InspectionReport, InspectionParameter, ParameterStatus, ProductDetails, Evidence } from '../types';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon, TrashIcon, PlusCircleIcon, DocumentDownloadIcon, SparklesIcon, SpinnerIcon, CameraIcon, DocumentTextIcon, SearchIcon, SaveIcon } from './icons';
import { GDT_SYMBOLS } from '../constants';
import PhotoCaptureModal from './PhotoCaptureModal';

interface InspectionFormProps {
  report: InspectionReport;
  isEditable: boolean;
  onUpdateParameter: (id: number, updatedValues: Partial<InspectionParameter>) => void;
  onUpdateProductDetails: (updatedValues: Partial<ProductDetails>) => void;
  onAddParameter: () => void;
  onRemoveParameter: (id: number) => void;
  onGenerateGdtImage: (id: number) => void;
  onAddEvidenceToParameter: (parameterId: number, evidenceItem: Evidence) => void;
  onRemoveEvidenceFromParameter: (parameterId: number, evidenceIndex: number) => void;
}

const ExportModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const handleExport = (format: 'PDF' | 'Excel') => {
        alert(`A confirmation email would be sent and the report would be exported to ${format}.`);
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-sm w-full">
                <h3 className="text-xl font-bold text-gray-200 mb-4 text-center">Export Report</h3>
                <p className="text-gray-400 mb-6 text-center">Choose a format to export the inspection report.</p>
                <div className="flex flex-col gap-4">
                    <button onClick={() => handleExport('PDF')} className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition-colors">Export to PDF</button>
                    <button onClick={() => handleExport('Excel')} className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition-colors">Export to Excel</button>
                </div>
                <div className="mt-6 text-center">
                    <button onClick={onClose} className="text-gray-400 hover:text-white">Cancel</button>
                </div>
            </div>
        </div>
    );
};

const ProductDetailField: React.FC<{label: string, value: string, isEditable: boolean, onChange: (value: string) => void}> = ({ label, value, isEditable, onChange }) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-gray-400 whitespace-nowrap">{label}:</span>
            {isEditable ? (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-gray-900/50 p-1 rounded-md border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm font-semibold text-gray-300"
                />
            ) : (
                <span className="font-semibold text-gray-300">{value}</span>
            )}
        </div>
    );
}

const ParameterRow: React.FC<{ 
    param: InspectionParameter; 
    isEditable: boolean; 
    onUpdate: (id: number, updatedValues: Partial<InspectionParameter>) => void; 
    onRemove: (id: number) => void; 
    onGenerateGdtImage: (id: number) => void;
    onAddPhotoClick: (id: number) => void;
    hasBottomBorder: boolean; 
}> = ({ param, isEditable, onUpdate, onRemove, onGenerateGdtImage, onAddPhotoClick, hasBottomBorder }) => {
    const handleActualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            onUpdate(param.id, { actual: undefined, deviation: undefined, status: ParameterStatus.PENDING });
        } else {
            onUpdate(param.id, { actual: parseFloat(value) });
        }
    };
    
    const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value !== '' && !isNaN(parseFloat(value))) {
            onUpdate(param.id, { nominal: parseFloat(value) });
        }
    };

    const statusIcon = {
        [ParameterStatus.PASS]: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
        [ParameterStatus.FAIL]: <XCircleIcon className="w-6 h-6 text-red-400" />,
        [ParameterStatus.PENDING]: <MinusCircleIcon className="w-6 h-6 text-gray-500" />,
    }[param.status];
    
    const rowColor = {
        [ParameterStatus.PASS]: 'bg-green-800/20',
        [ParameterStatus.FAIL]: 'bg-red-800/20',
        [ParameterStatus.PENDING]: 'bg-gray-800',
    }[param.status];

    const borderClass = hasBottomBorder ? 'border-b border-gray-700' : '';
    const isGeneratingImage = param.gdtImage === 'loading';

    return (
        <tr className={`${rowColor} transition-colors duration-300`}>
            <td className={`px-4 py-2 text-center ${borderClass}`}>{param.id}</td>
            <td className={`px-4 py-2 ${borderClass}`}>
                {isEditable ? (
                    <input
                        type="text"
                        defaultValue={param.description}
                        onChange={(e) => onUpdate(param.id, { description: e.target.value })}
                        className="w-full bg-gray-700 p-1 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                        placeholder="Parameter description"
                    />
                ) : (
                    param.description
                )}
            </td>
            <td className={`px-4 py-2 text-right ${borderClass}`}>
                <div className="flex items-center justify-end gap-2">
                    {param.gdtImage && !isGeneratingImage && (
                         <img src={param.gdtImage} alt={`${param.gdtSymbol} representation`} className="w-8 h-8 object-contain bg-white rounded-sm p-1" title="AI-Generated Representation" />
                    )}
                    {isGeneratingImage && (
                        <div className="w-8 h-8 flex items-center justify-center">
                            <SpinnerIcon className="w-5 h-5 text-cyan-400" />
                        </div>
                    )}
                    {isEditable ? (
                        <>
                            <select
                                value={param.gdtSymbol || ''}
                                onChange={(e) => onUpdate(param.id, { gdtSymbol: e.target.value || undefined, gdtImage: undefined })}
                                className="bg-gray-700 border border-gray-600 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono text-xs"
                            >
                                <option value="">-</option>
                                {GDT_SYMBOLS.map(s => (
                                    <option key={s.symbol} value={s.symbol} title={s.name}>
                                        {s.symbol}
                                    </option>
                                ))}
                            </select>
                            {param.gdtSymbol && (
                                <button
                                    type="button"
                                    onClick={() => onGenerateGdtImage(param.id)}
                                    disabled={isGeneratingImage || !!param.gdtImage}
                                    className="p-1 text-cyan-400 hover:text-cyan-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                                    title="Generate GDT Symbol Image with AI"
                                >
                                    <SparklesIcon className="w-4 h-4" />
                                </button>
                            )}
                             <input
                                type="number"
                                step="0.001"
                                defaultValue={param.nominal.toFixed(3)}
                                onChange={handleNominalChange}
                                className="w-24 bg-gray-700 text-right p-1 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                            />
                        </>
                    ) : (
                        <div className="flex items-center justify-end gap-2">
                            {param.gdtSymbol && <span className="font-mono text-cyan-300">{param.gdtSymbol}</span>}
                            <span className="font-mono">{param.nominal.toFixed(3)}</span>
                        </div>
                    )}
                </div>
            </td>
            <td className={`px-4 py-2 text-center ${borderClass}`}>
                 {isEditable ? (
                     <div className="flex items-center gap-1 justify-center">
                        <select 
                            value={param.toleranceType}
                            onChange={(e) => onUpdate(param.id, { toleranceType: e.target.value as any })}
                            className="bg-gray-700 p-1 rounded-md border border-gray-600 font-mono"
                        >
                            <option value="+/-">+/-</option>
                            <option value="+">+</option>
                            <option value="-">-</option>
                        </select>
                        <input
                            type="number"
                            step="0.001"
                            defaultValue={param.toleranceValue.toFixed(3)}
                            onChange={(e) => onUpdate(param.id, { toleranceValue: parseFloat(e.target.value) || 0 })}
                            className="w-20 bg-gray-700 text-right p-1 rounded-md border border-gray-600 font-mono"
                        />
                     </div>
                ) : (
                    <span className="font-mono">{param.toleranceType} {param.toleranceValue.toFixed(3)}</span>
                )}
            </td>
            <td className={`px-4 py-2 text-right font-mono ${borderClass}`}>{param.utl.toFixed(3)}</td>
            <td className={`px-4 py-2 text-right font-mono ${borderClass}`}>{param.ltl.toFixed(3)}</td>
            <td className={`px-4 py-2 ${borderClass}`}>
                <input
                    type="number"
                    step="0.001"
                    defaultValue={param.actual?.toFixed(3)}
                    disabled={!isEditable}
                    onChange={handleActualChange}
                    className="w-full bg-gray-700 disabled:bg-gray-800 disabled:border-transparent text-right p-1 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
            </td>
            <td className={`px-4 py-2 text-right font-mono ${param.deviation && param.deviation !== 0 ? (param.status === ParameterStatus.FAIL ? 'text-red-400' : 'text-green-400') : ''} ${borderClass}`}>
                {param.deviation?.toFixed(3) ?? '-'}
            </td>
            <td className={`px-4 py-2 text-center ${borderClass}`}>
                <div className="flex justify-center">{statusIcon}</div>
            </td>
            <td className={`px-4 py-2 text-center ${borderClass}`}>
                {isEditable && (
                     <div className="flex items-center justify-center gap-1">
                        <button onClick={() => onAddPhotoClick(param.id)} className="text-gray-500 hover:text-cyan-400 p-1 transition-colors" aria-label="Add photo evidence">
                            <CameraIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => onRemove(param.id)} className="text-gray-500 hover:text-red-400 p-1 transition-colors" aria-label="Delete parameter">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
};

const EvidenceRow: React.FC<{ 
    param: InspectionParameter; 
    isEditable: boolean; 
    onRemoveEvidence: (parameterId: number, evidenceIndex: number) => void; 
    hasBottomBorder: boolean;
}> = ({ param, isEditable, onRemoveEvidence, hasBottomBorder }) => {
    const rowColor = {
        [ParameterStatus.PASS]: 'bg-green-800/20',
        [ParameterStatus.FAIL]: 'bg-red-800/20',
        [ParameterStatus.PENDING]: 'bg-gray-800',
    }[param.status];

    const borderClass = hasBottomBorder ? 'border-b border-gray-700' : '';

    return (
        <tr className={rowColor}>
            <td className={`px-4 py-2 ${borderClass}`}></td>
            <td className={`px-4 py-2 text-right text-gray-400 text-xs italic align-top pt-3 ${borderClass}`}>Evidence:</td>
            <td colSpan={9} className={`px-4 py-2 ${borderClass}`}>
                <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
                    {param.evidence?.map((item, index) => (
                        <div key={index} className="relative aspect-video bg-gray-700 rounded-md overflow-hidden group">
                            {item.type.startsWith('image/') ? (
                                <img src={item.data} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <a href={item.data} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center h-full p-2 text-center hover:bg-gray-600 transition-colors">
                                    <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs text-gray-300 mt-1 break-all line-clamp-2">{item.name}</span>
                                </a>
                            )}
                            {isEditable && (
                                <button
                                    onClick={() => onRemoveEvidence(param.id, index)}
                                    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove evidence"
                                >
                                    <TrashIcon className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </td>
        </tr>
    );
};

const CommentRow: React.FC<{ param: InspectionParameter; isEditable: boolean; onUpdate: (id: number, updatedValues: Partial<InspectionParameter>) => void; }> = ({ param, isEditable, onUpdate }) => {
    const rowColor = {
        [ParameterStatus.PASS]: 'bg-green-800/20',
        [ParameterStatus.FAIL]: 'bg-red-800/20',
        [ParameterStatus.PENDING]: 'bg-gray-800',
    }[param.status];
    
    return (
        <tr className={rowColor}>
            <td className="px-4 py-2 border-b border-gray-700"></td>
            <td className="px-4 py-2 border-b border-gray-700 text-right text-gray-400 text-xs italic">Comment:</td>
            <td colSpan={9} className="px-4 py-2 border-b border-gray-700">
                {isEditable ? (
                    <input
                        type="text"
                        defaultValue={param.comment || ''}
                        onChange={(e) => onUpdate(param.id, { comment: e.target.value })}
                        className="w-full bg-gray-700 p-1 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                        placeholder="Add observation, finding, or note..."
                    />
                ) : (
                    <p className="text-sm text-gray-300 italic">{param.comment}</p>
                )}
            </td>
        </tr>
    );
}


const InspectionForm: React.FC<InspectionFormProps> = ({ report, isEditable, onUpdateParameter, onUpdateProductDetails, onAddParameter, onRemoveParameter, onGenerateGdtImage, onAddEvidenceToParameter, onRemoveEvidenceFromParameter }) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [capturingPhotoForParam, setCapturingPhotoForParam] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSaveDraft = () => {
    setSaveStatus('saving');
    try {
        localStorage.setItem(`inspection_draft_${report.id}`, JSON.stringify(report));
        setSaveStatus('saved');
    } catch (error) {
        console.error("Failed to save draft to local storage", error);
        alert("Could not save draft. Local storage might be full.");
        setSaveStatus('idle');
    }

    setTimeout(() => {
        setSaveStatus('idle');
    }, 2000);
  };

  const handleCaptureForParameter = (photoData: string) => {
    if (capturingPhotoForParam === null) return;
    const evidenceItem: Evidence = {
        data: photoData,
        name: `capture-${Date.now()}.jpg`,
        type: 'image/jpeg',
    };
    onAddEvidenceToParameter(capturingPhotoForParam, evidenceItem);
  };

  const filteredParameters = report.parameters.filter(param =>
    param.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-2 gap-4 flex-wrap">
            <h2 className="text-xl font-bold text-gray-200">{report.title}</h2>
            <div className="flex items-center gap-2 flex-grow sm:flex-grow-0 sm:justify-end w-full sm:w-auto">
                {isEditable && (
                    <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                         <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-4 h-4 text-gray-500" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search parameters..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-gray-900/50 rounded-md border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm"
                        />
                    </div>
                )}
                <button 
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-semibold transition-colors flex-shrink-0"
                >
                    <DocumentDownloadIcon className="w-4 h-4" />
                    Export
                </button>
                {isEditable && (
                    <>
                        <button
                            onClick={handleSaveDraft}
                            disabled={saveStatus !== 'idle'}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-semibold transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saveStatus === 'saved' ? <CheckCircleIcon className="w-4 h-4 text-green-400" /> : <SaveIcon className="w-4 h-4" />}
                            {saveStatus === 'idle' ? 'Save Draft' : saveStatus === 'saving' ? 'Saving...' : 'Saved!'}
                        </button>
                        <button 
                            onClick={onAddParameter}
                            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-md text-sm font-semibold transition-colors flex-shrink-0"
                        >
                            <PlusCircleIcon className="w-4 h-4" />
                            Add
                        </button>
                    </>
                )}
            </div>
        </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-2 text-xs">
              <ProductDetailField label="Product Name" value={report.productDetails.productName} isEditable={isEditable} onChange={val => onUpdateProductDetails({productName: val})} />
              <ProductDetailField label="Part Number" value={report.productDetails.partNumber} isEditable={isEditable} onChange={val => onUpdateProductDetails({partNumber: val})} />
              <ProductDetailField label="Drawing Number" value={report.productDetails.drawingNumber} isEditable={isEditable} onChange={val => onUpdateProductDetails({drawingNumber: val})} />
              <ProductDetailField label="Revision" value={report.productDetails.revision} isEditable={isEditable} onChange={val => onUpdateProductDetails({revision: val})} />
              <ProductDetailField label="UOM" value={report.productDetails.uom} isEditable={isEditable} onChange={val => onUpdateProductDetails({uom: val})} />
          </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 py-3 text-center">#</th>
              <th scope="col" className="px-4 py-3">Description</th>
              <th scope="col" className="px-4 py-3 text-right">Nominal</th>
              <th scope="col" className="px-4 py-3 text-center">Tolerance</th>
              <th scope="col" className="px-4 py-3 text-right">UTL</th>
              <th scope="col" className="px-4 py-3 text-right">LTL</th>
              <th scope="col" className="px-4 py-3 text-right">Actual</th>
              <th scope="col" className="px-4 py-3 text-right">Deviation</th>
              <th scope="col" className="px-4 py-3 text-center">Status</th>
              <th scope="col" className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredParameters.length > 0 ? (
                filteredParameters.map(param => {
                    const showCommentRow = isEditable || (param.comment && param.comment.trim() !== '');
                    const showEvidenceRow = param.evidence && param.evidence.length > 0;
                    return (
                      <React.Fragment key={param.id}>
                        <ParameterRow 
                            param={param} 
                            isEditable={isEditable} 
                            onUpdate={onUpdateParameter} 
                            onRemove={onRemoveParameter} 
                            onGenerateGdtImage={onGenerateGdtImage}
                            onAddPhotoClick={setCapturingPhotoForParam}
                            hasBottomBorder={!showEvidenceRow && !showCommentRow}
                        />
                        {showEvidenceRow && (
                            <EvidenceRow 
                                param={param} 
                                isEditable={isEditable} 
                                onRemoveEvidence={onRemoveEvidenceFromParameter}
                                hasBottomBorder={!showCommentRow}
                            />
                        )}
                        {showCommentRow && (
                            <CommentRow param={param} isEditable={isEditable} onUpdate={onUpdateParameter} />
                        )}
                      </React.Fragment>
                    );
                })
            ) : (
                <tr>
                    <td colSpan={11} className="text-center py-8 text-gray-500">
                        {searchQuery ? `No parameters found for "${searchQuery}".` : "No parameters available."}
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
      {capturingPhotoForParam !== null && (
        <PhotoCaptureModal
            onCapture={handleCaptureForParameter}
            onClose={() => setCapturingPhotoForParam(null)}
        />
      )}
    </div>
  );
};

export default InspectionForm;
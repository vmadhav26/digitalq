import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { InspectionReport, UserRole, ParameterStatus, InspectionStatus } from '../types';
import { PARTICIPANTS } from '../constants';
import { CheckCircleIcon } from './icons';

interface ResultsDashboardProps {
    report: InspectionReport;
    userRole: UserRole;
    onSignOff: (role: UserRole, comment: string) => void;
    onCompleteInspection: (finalStatus: InspectionStatus) => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ report, userRole, onSignOff, onCompleteInspection }) => {
    const [comment, setComment] = useState('');
    const [isFinalizing, setIsFinalizing] = useState(false);

    const stats = useMemo(() => {
        const total = report.parameters.length;
        const checked = report.parameters.filter(p => p.status !== ParameterStatus.PENDING).length;
        const passed = report.parameters.filter(p => p.status === ParameterStatus.PASS).length;
        const failed = report.parameters.filter(p => p.status === ParameterStatus.FAIL).length;
        return { total, checked, passed, failed };
    }, [report.parameters]);

    const allChecked = stats.checked === stats.total;
    const allSigned = PARTICIPANTS.every(role => report.signatures[role].signed);

    const handleSign = () => {
        if (!allChecked || report.signatures[userRole].signed) return;
        onSignOff(userRole, comment);
    };

    const handleComplete = (status: InspectionStatus) => {
        if (allSigned) {
            onCompleteInspection(status);
        }
    };
    
    const chartData = [
        { name: 'Passed', value: stats.passed },
        { name: 'Failed', value: stats.failed },
        { name: 'Pending', value: stats.total - stats.checked },
    ];
    const COLORS = ['#10B981', '#F87171', '#6B7280'];

    return (
        <div className="bg-gray-900 p-4 rounded-lg flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-300">Live Results</h2>
            <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-800 p-2 rounded-md">
                    <p className="text-xs text-gray-400">Checked</p>
                    <p className="text-lg font-bold">{stats.checked}/{stats.total}</p>
                </div>
                <div className="bg-gray-800 p-2 rounded-md">
                    <p className="text-xs text-gray-400">Failed</p>
                    <p className={`text-lg font-bold ${stats.failed > 0 ? 'text-red-400' : 'text-gray-200'}`}>{stats.failed}</p>
                </div>
            </div>

            <div style={{ width: '100%', height: 150 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" labelLine={false}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div>
                <h3 className="text-md font-semibold mb-2 text-gray-300">Sign-Off</h3>
                <div className="space-y-3">
                    {PARTICIPANTS.map(role => {
                        const signature = report.signatures[role];
                        const isCurrentUserRole = userRole === role;
                        return (
                            <div key={role} className="bg-gray-800 p-3 rounded-md">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">{role}</span>
                                    {signature.signed ? (
                                        <span className="flex items-center text-green-400 text-sm"><CheckCircleIcon className="w-5 h-5 mr-1" /> Signed</span>
                                    ) : (
                                        isCurrentUserRole && (
                                            <button
                                                onClick={handleSign}
                                                disabled={!allChecked}
                                                className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Sign Off
                                            </button>
                                        )
                                    )}
                                </div>
                                {signature.signed && signature.comment && (
                                    <p className="text-xs text-gray-400 mt-2 border-l-2 border-gray-600 pl-2 italic">"{signature.comment}"</p>
                                )}
                                {!signature.signed && isCurrentUserRole && (
                                    <div className="mt-2">
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Add an optional comment..."
                                            rows={2}
                                            className="w-full bg-gray-700 text-xs p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-gray-800"
                                            disabled={!allChecked}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {allSigned && !isFinalizing && (
                <div>
                    <h3 className="text-md font-semibold mb-2 text-gray-300">Finalize Inspection</h3>
                    <button 
                        onClick={() => setIsFinalizing(true)}
                        className="w-full py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded-md"
                    >
                        Generate Digital Tag
                    </button>
                </div>
            )}
            
            {allSigned && isFinalizing && (
                <div>
                    <h3 className="text-md font-semibold mb-2 text-gray-300">Select Final Status</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleComplete('Accepted')} disabled={stats.failed > 0} className="w-full py-2 text-sm bg-green-600 hover:bg-green-700 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed">Accept</button>
                        <button onClick={() => handleComplete('Rejected')} disabled={stats.failed === 0} className="w-full py-2 text-sm bg-red-600 hover:bg-red-700 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed">Reject</button>
                        <button onClick={() => handleComplete('Rework')} disabled={stats.failed === 0} className="w-full py-2 text-sm bg-yellow-500 hover:bg-yellow-600 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed">Rework</button>
                        <button onClick={() => handleComplete('Approved with Deviation')} disabled={stats.failed === 0} className="w-full py-2 text-sm bg-blue-500 hover:bg-blue-600 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed">Deviate</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsDashboard;
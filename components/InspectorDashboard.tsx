import React, { useState, useEffect, useMemo } from 'react';
import { User, InspectionReport } from '../types';
import { getInspectionsForInspector } from '../data/db';
import { LogoutIcon } from './icons';
import TaskList from './TaskList';
import DashboardStats from './DashboardStats';

interface InspectorDashboardProps {
  currentUser: User;
  onStartInspection: (inspection: InspectionReport) => void;
  onLogout: () => void;
}

const InspectorDashboard: React.FC<InspectorDashboardProps> = ({ currentUser, onStartInspection, onLogout }) => {
    const [inspections, setInspections] = useState<InspectionReport[]>([]);

    useEffect(() => {
        setInspections(getInspectionsForInspector(currentUser.id));
    }, [currentUser.id]);

    const stats = useMemo(() => {
        const total = inspections.length;
        const completed = inspections.filter(i => i.isComplete).length;
        const approved = inspections.filter(i => i.finalStatus === 'Accepted').length;
        const rejected = inspections.filter(i => i.finalStatus === 'Rejected').length;
        const open = total - completed;
        return { total, completed, approved, rejected, open };
    }, [inspections]);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center bg-gray-800 p-4 rounded-lg mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-cyan-400">Inspector Dashboard</h1>
                    <p className="text-sm text-gray-400">Welcome, <span className="font-semibold">{currentUser.username}</span></p>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                    <LogoutIcon className="w-5 h-5"/>
                    Logout
                </button>
            </header>

            <DashboardStats stats={stats} />

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Your Assigned Inspections</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-700 text-xs text-gray-400 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Inspection ID</th>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inspections.length > 0 ? inspections.map(insp => (
                                    <tr key={insp.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="px-4 py-3 font-mono text-gray-500">{insp.id}</td>
                                        <td className="px-4 py-3">{insp.title}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${insp.isComplete ? (insp.finalStatus === 'Accepted' ? 'bg-green-600' : 'bg-red-600') : 'bg-yellow-600'}`}>
                                                {insp.isComplete ? insp.finalStatus : 'Scheduled'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button 
                                                onClick={() => onStartInspection(insp)}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed"
                                                disabled={insp.isComplete}
                                            >
                                                {insp.isComplete ? 'View Report' : 'Start Inspection'}
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-500">You have no scheduled inspections.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <TaskList userId={currentUser.id} />
                </div>
            </main>
        </div>
    );
};

export default InspectorDashboard;
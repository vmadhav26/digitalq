import React from 'react';
import { BriefcaseIcon, CheckCircleIcon, ClockIcon, ClipboardCheckIcon, ClipboardXIcon } from './icons';

interface Stats {
    total: number;
    completed: number;
    approved: number;
    rejected: number;
    open: number;
}

interface DashboardStatsProps {
    stats: Stats;
}

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: number, colorClass: string }> = ({ icon, title, value, colorClass }) => {
    return (
        <div className={`bg-gray-800 p-4 rounded-lg flex items-center gap-4 border-l-4 ${colorClass}`}>
            <div className={`p-3 rounded-full bg-gray-700`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard 
                icon={<BriefcaseIcon className="w-6 h-6 text-blue-400" />}
                title="Total Inspections"
                value={stats.total}
                colorClass="border-blue-500"
            />
            <StatCard 
                icon={<CheckCircleIcon className="w-6 h-6 text-purple-400" />}
                title="Completed"
                value={stats.completed}
                colorClass="border-purple-500"
            />
            <StatCard 
                icon={<ClockIcon className="w-6 h-6 text-yellow-400" />}
                title="Open Tasks"
                value={stats.open}
                colorClass="border-yellow-500"
            />
            <StatCard 
                icon={<ClipboardCheckIcon className="w-6 h-6 text-green-400" />}
                title="Components Approved"
                value={stats.approved}
                colorClass="border-green-500"
            />
            <StatCard 
                icon={<ClipboardXIcon className="w-6 h-6 text-red-400" />}
                title="Components Rejected"
                value={stats.rejected}
                colorClass="border-red-500"
            />
        </div>
    );
};

export default DashboardStats;
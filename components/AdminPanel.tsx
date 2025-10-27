import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, InspectionReport } from '../types';
import { createUser, getUsers, getAllInspections, scheduleInspection } from '../data/db';
import { ALL_USER_ROLES } from '../constants';
import { LogoutIcon, UserIcon, PlusCircleIcon } from './icons';
import ScheduleInspectionModal from './ScheduleInspectionModal';
import ShareLinkModal from './ShareLinkModal';
import DashboardStats from './DashboardStats';

interface AdminPanelProps {
  currentUser: User;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.INSPECTOR);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [inspections, setInspections] = useState<InspectionReport[]>([]);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [inspectionToShare, setInspectionToShare] = useState<InspectionReport | null>(null);

  useEffect(() => {
    setUsers(getUsers());
    setInspections(getAllInspections());
  }, []);

  const inspectors = useMemo(() => users.filter(u => u.role === UserRole.INSPECTOR), [users]);

  const stats = useMemo(() => {
    const total = inspections.length;
    const completed = inspections.filter(i => i.isComplete).length;
    const approved = inspections.filter(i => i.finalStatus === 'Accepted').length;
    const rejected = inspections.filter(i => i.finalStatus === 'Rejected').length;
    const open = total - completed;
    return { total, completed, approved, rejected, open };
  }, [inspections]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const newUser = createUser(username, password, role);
    if (newUser) {
      setMessage({ type: 'success', text: `User "${username}" created successfully.` });
      setUsers(getUsers()); // Refresh user list
      setUsername('');
      setPassword('');
    } else {
      setMessage({ type: 'error', text: `Username "${username}" already exists.` });
    }
  };

  const handleSchedule = (title: string, inspectorId: string) => {
    const newInspection = scheduleInspection(title, inspectorId);
    setInspections(getAllInspections());
    setScheduleModalOpen(false);
    setInspectionToShare(newInspection);
  };

  const findInspectorUsername = (id: string) => users.find(u => u.id === id)?.username || 'Unknown';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center bg-gray-800 p-4 rounded-lg mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">Admin Panel</h1>
          <p className="text-sm text-gray-400">Logged in as: <span className="font-semibold">{currentUser.username}</span></p>
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

      <div className="bg-gray-800 p-6 rounded-lg mt-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All Inspections</h2>
            <button
                onClick={() => setScheduleModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md font-semibold transition-colors"
            >
                <PlusCircleIcon className="w-5 h-5" />
                Schedule Inspection
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-700 text-xs text-gray-400 uppercase">
                    <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Assigned To</th>
                        <th className="px-4 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {inspections.map(insp => (
                        <tr key={insp.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <td className="px-4 py-3 font-mono text-gray-500">{insp.id}</td>
                            <td className="px-4 py-3">{insp.title}</td>
                            <td className="px-4 py-3">{findInspectorUsername(insp.scheduledById)}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${insp.isComplete ? (insp.finalStatus === 'Accepted' ? 'bg-green-600' : 'bg-red-600') : 'bg-yellow-600'}`}>
                                    {insp.isComplete ? insp.finalStatus : 'Scheduled'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Create User Form */}
        <div className="md:col-span-1 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><PlusCircleIcon className="w-6 h-6 text-cyan-400"/> Create New User</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Role</label>
              <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500">
                {ALL_USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-md font-semibold transition-colors">Create User</button>
            {message && <p className={`text-sm mt-2 text-center ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message.text}</p>}
          </form>
        </div>

        {/* User List */}
        <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><UserIcon className="w-6 h-6 text-cyan-400"/> Existing Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-700 text-xs text-gray-400 uppercase">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-4 py-2 font-mono text-gray-500">{user.id}</td>
                    <td className="px-4 py-2">{user.username}</td>
                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs rounded-full ${user.role === UserRole.ADMIN ? 'bg-purple-600' : user.role === UserRole.INSPECTOR ? 'bg-cyan-600' : 'bg-gray-600'}`}>{user.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isScheduleModalOpen && (
          <ScheduleInspectionModal
              inspectors={inspectors}
              onClose={() => setScheduleModalOpen(false)}
              onSchedule={handleSchedule}
          />
      )}
      {inspectionToShare && (
          <ShareLinkModal
              inspection={inspectionToShare}
              onClose={() => setInspectionToShare(null)}
          />
      )}
    </div>
  );
};

export default AdminPanel;
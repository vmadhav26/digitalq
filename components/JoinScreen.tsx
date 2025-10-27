import React from 'react';
import { UserRole } from '../types';
import { PARTICIPANTS } from '../constants';
import { UserIcon } from './icons';

interface JoinScreenProps {
  onJoin: (role: UserRole) => void;
  inspectionTitle: string;
}

const JoinScreen: React.FC<JoinScreenProps> = ({ onJoin, inspectionTitle }) => {
  // Exclude inspector from the join options, as they start the session
  const joinableRoles = PARTICIPANTS.filter(r => r !== UserRole.INSPECTOR);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-400">Joining Inspection</h1>
          <p className="mt-2 text-lg text-gray-300">{inspectionTitle}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">Please select your role to join:</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {joinableRoles.map((role) => (
            <button
              key={role}
              onClick={() => onJoin(role)}
              className="group flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg hover:bg-cyan-500 hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400"
            >
              <UserIcon className="w-10 h-10 text-gray-400 group-hover:text-white transition-colors"/>
              <span className="mt-2 text-md font-semibold text-gray-200 group-hover:text-white transition-colors">{role}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JoinScreen;

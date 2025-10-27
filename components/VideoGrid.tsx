
import React, { useEffect, useRef } from 'react';
import { UserRole } from '../types';
import { PARTICIPANTS } from '../constants';
import { UserIcon } from './icons';

interface VideoGridProps {
  currentUserRole: UserRole;
}

const VideoTile: React.FC<{ role: UserRole, isCurrentUser: boolean }> = ({ role, isCurrentUser }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isCurrentUser && videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => console.error("Error accessing camera: ", err));
        }
    }, [isCurrentUser]);

    return (
        <div className="relative aspect-video bg-gray-900 rounded-md overflow-hidden border-2 border-gray-700">
            {isCurrentUser ? (
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover"></video>
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-gray-600"/>
                </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1">
                {role} {isCurrentUser && '(You)'}
            </div>
        </div>
    );
};

const VideoGrid: React.FC<VideoGridProps> = ({ currentUserRole }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-gray-300">Participants</h2>
      <div className="grid grid-cols-2 gap-2">
        {PARTICIPANTS.map(role => (
          <VideoTile key={role} role={role} isCurrentUser={role === currentUserRole} />
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;

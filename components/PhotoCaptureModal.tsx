import React, { useRef, useEffect, useCallback } from 'react';

interface PhotoCaptureModalProps {
  onCapture: (photoData: string) => void;
  onClose: () => void;
  title?: string;
}

const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({ onCapture, onClose, title = "Capture Photo Evidence" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error("Error accessing camera: ", err);
        alert("Could not access camera. Please ensure permissions are granted.");
        onClose();
      });

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [onClose]);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
        onClose();
      }
    }
  }, [onCapture, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-4 max-w-3xl w-full">
        <h2 className="text-xl font-bold text-gray-200 mb-4">{title}</h2>
        <div className="relative bg-black rounded-md overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto"></video>
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCapture}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
          >
            Take Photo
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoCaptureModal;
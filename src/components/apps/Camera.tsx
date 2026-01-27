import React, { useRef, useEffect, useState } from 'react';
import { Camera as CameraIcon } from 'lucide-react';
import type { AppProps } from '../../types';

const Camera: React.FC<AppProps> = ({ onWindowDrag }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                setError("Camera access denied or unavailable.");
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="h-full bg-black relative flex flex-col">
            <div className="absolute top-0 left-0 w-full h-10 z-10" onMouseDown={onWindowDrag} />

            {error ? (
                <div className="flex-1 flex items-center justify-center text-white/50 flex-col gap-4">
                    <CameraIcon size={48} />
                    <p>{error}</p>
                </div>
            ) : (
                <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="h-full w-full object-cover transform scale-x-[-1]"
                    />
                </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-6 w-full flex justify-center items-center gap-8">
                <button className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform bg-transparent active:bg-white/20">
                    <div className="w-14 h-14 bg-white rounded-full opacity-0 active:opacity-100 transition-opacity" />
                </button>
            </div>
        </div>
    );
};

export default Camera;
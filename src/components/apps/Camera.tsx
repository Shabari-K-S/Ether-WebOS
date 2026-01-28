import React, { useRef, useEffect, useState } from 'react';
import { Camera as CameraIcon } from 'lucide-react';
import { useOSStore } from '../../store/osStore';
import type { AppProps } from '../../types';

const Camera: React.FC<AppProps> = ({ windowId, onWindowDrag }) => {
    const { windows } = useOSStore();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    const isMinimized = windows.find(w => w.id === windowId)?.isMinimized;

    const [isFlashing, setIsFlashing] = useState(false);

    useEffect(() => {
        let stream: MediaStream | null = null;
        let isMounted = true;

        const startCamera = async () => {
            try {
                // If minimized, don't start
                if (isMinimized) return;

                const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

                // Check if unmounted or minimized while waiting
                if (!isMounted) {
                    newStream.getTracks().forEach(track => track.stop());
                    return;
                }

                stream = newStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                if (isMounted) {
                    setError("Camera access denied or unavailable.");
                }
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isMinimized]);

    const captureImage = () => {
        if (videoRef.current) {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 150);

            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                // Flip horizontally to match mirror effect
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(videoRef.current, 0, 0);

                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `photo-${Date.now()}.png`;
                link.click();
            }
        }
    };

    return (
        <div className="h-full bg-black relative flex flex-col">
            <div className="absolute top-0 left-0 w-full h-10 z-10" onMouseDown={onWindowDrag} />

            {/* Flash Effect */}
            <div className={`absolute inset-0 bg-white z-20 pointer-events-none transition-opacity duration-100 ${isFlashing ? 'opacity-100' : 'opacity-0'}`} />

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
                <button
                    onClick={captureImage}
                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform bg-transparent active:bg-white/20"
                >
                    <div className="w-14 h-14 bg-white rounded-full opacity-0 active:opacity-100 transition-opacity" />
                </button>
            </div>
        </div>
    );
};

export default Camera;
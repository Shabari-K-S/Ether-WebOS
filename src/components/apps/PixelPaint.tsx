import React, { useRef, useState, useEffect } from 'react';
import type { AppProps } from '../../types';
import { Eraser, Pencil, RefreshCw } from 'lucide-react';
import { useOSStore } from '../../store/osStore';

const COLORS = ['#000000', '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55', '#8E8E93', '#C7C7CC'];

const PixelPaint: React.FC<AppProps> = ({ onWindowDrag }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState('#000000');
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
    const { theme } = useOSStore();
    const [brushSize, setBrushSize] = useState(5);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set initial canvas size relative to container
        canvas.width = canvas.parentElement?.clientWidth || 800;
        canvas.height = canvas.parentElement?.clientHeight || 600;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath(); // Reset path
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const { x, y } = getCoordinates(e);

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    return (
        <div className={`h-full flex flex-col ${theme.isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-100'}`}>
            {/* Toolbar */}
            <div className="p-3 flex items-center justify-between border-b border-inherit shadow-sm bg-inherit relative z-10" onMouseDown={onWindowDrag}>
                <div className="flex items-center space-x-2">
                    <div className="flex bg-white/10 rounded-lg p-1">
                        <button
                            onClick={() => setTool('pencil')}
                            className={`p-2 rounded ${tool === 'pencil' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-black/5'}`}
                        >
                            <Pencil size={18} />
                        </button>
                        <button
                            onClick={() => setTool('eraser')}
                            className={`p-2 rounded ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-black/5'}`}
                        >
                            <Eraser size={18} />
                        </button>
                    </div>

                    <div className="h-8 w-px bg-gray-300 mx-2" />

                    <div className="flex space-x-1">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => { setColor(c); setTool('pencil'); }}
                                className={`w-6 h-6 rounded-full border-2 ${color === c && tool === 'pencil' ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-24 accent-blue-500"
                    />
                    <button onClick={clearCanvas} className="p-2 hover:bg-black/10 rounded" title="Clear">
                        <RefreshCw size={18} className={theme.isDarkMode ? 'text-white' : 'text-black'} />
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden bg-[#e5e5e5] flex items-center justify-center p-4">
                <canvas
                    ref={canvasRef}
                    className="bg-white shadow-lg cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                />
            </div>
        </div>
    );
};

export default PixelPaint;
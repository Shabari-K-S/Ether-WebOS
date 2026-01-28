import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOSStore } from '../../store/osStore';
import { Trophy, Play, RotateCcw, Info, X } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 60;

interface SnakeProps {
    windowId?: string;
    onWindowDrag?: (e: React.MouseEvent) => void;
}

const SnakeApp: React.FC<SnakeProps> = ({ windowId, onWindowDrag }) => {
    const { theme, updateWindowSize } = useOSStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Auto-resize window on mount
    useEffect(() => {
        if (windowId) {
            updateWindowSize(windowId, 500, 580);
        }
    }, [windowId, updateWindowSize]);

    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 15 });
    const [direction, setDirection] = useState({ x: 0, y: -1 });
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(Number(localStorage.getItem('snake-high-score')) || 0);
    const [gameStarted, setGameStarted] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const moveSnake = useCallback(() => {
        if (isGameOver || !gameStarted) return;

        setSnake((prev) => {
            const head = prev[0];
            const newHead = { x: head.x + direction.x, y: head.y + direction.y };

            // Collision detection (walls)
            if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
                setIsGameOver(true);
                return prev;
            }

            // Collision detection (self)
            if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                setIsGameOver(true);
                return prev;
            }

            const newSnake = [newHead, ...prev];

            // Check if ate food
            if (newHead.x === food.x && newHead.y === food.y) {
                setScore((s) => s + 10);
                setFood({
                    x: Math.floor(Math.random() * GRID_SIZE),
                    y: Math.floor(Math.random() * GRID_SIZE),
                });
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [direction, food, isGameOver, gameStarted]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                    if (direction.y !== 1) setDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                case 's':
                    if (direction.y !== -1) setDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                case 'a':
                    if (direction.x !== 1) setDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                case 'd':
                    if (direction.x !== -1) setDirection({ x: 1, y: 0 });
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [direction]);

    useEffect(() => {
        const speed = Math.max(MIN_SPEED, INITIAL_SPEED - Math.floor(score / 50) * 10);
        const interval = setInterval(moveSnake, speed);
        return () => clearInterval(interval);
    }, [moveSnake, score]);

    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('snake-high-score', score.toString());
        }
    }, [score, highScore]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const cellSize = canvas.width / GRID_SIZE;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid lines (subtle)
        ctx.strokeStyle = theme.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width, i * cellSize);
            ctx.stroke();
        }

        // Draw snake
        snake.forEach((segment, index) => {
            const isHead = index === 0;
            ctx.fillStyle = isHead
                ? '#3b82f6' // Blue-500
                : theme.isDarkMode ? '#60a5fa' : '#2563eb';

            // Glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = isHead ? '#3b82f6' : '#60a5fa';

            const padding = 2;
            ctx.fillRect(
                segment.x * cellSize + padding,
                segment.y * cellSize + padding,
                cellSize - padding * 2,
                cellSize - padding * 2
            );

            ctx.shadowBlur = 0; // Reset for other drawings
        });

        // Draw food
        ctx.fillStyle = '#ef4444'; // Red-500
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ef4444';
        ctx.beginPath();
        ctx.arc(
            food.x * cellSize + cellSize / 2,
            food.y * cellSize + cellSize / 2,
            cellSize / 2 - 4,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

    }, [snake, food, theme.isDarkMode]);

    const resetGame = () => {
        setSnake([{ x: 10, y: 10 }]);
        setFood({ x: 15, y: 15 });
        setDirection({ x: 0, y: -1 });
        setIsGameOver(false);
        setScore(0);
        setGameStarted(true);
    };

    return (
        <div
            onMouseDown={onWindowDrag}
            className={`h-full flex flex-col items-center pt-14 px-6 pb-4 ${theme.isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}
        >
            <div className="w-full max-w-[400px] flex justify-between items-center mb-6 px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-xl backdrop-blur-xl group/hud">
                <div className="flex items-center space-x-6">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Score</span>
                        <div className="flex items-center space-x-2">
                            <Trophy size={16} className="text-yellow-500" />
                            <span className={`font-black text-xl tabular-nums ${theme.isDarkMode ? 'text-white' : 'text-gray-800'}`}>{score}</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-current opacity-10" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Best</span>
                        <span className={`font-black text-lg tabular-nums ${theme.isDarkMode ? 'text-white' : 'text-gray-800'}`}>{highScore}</span>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowInfo(true)}
                        className="p-2.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all text-inherit opacity-60 hover:opacity-100"
                    >
                        <Info size={18} />
                    </button>
                    <button
                        onClick={resetGame}
                        className={`
                            p-2.5 rounded-xl transition-all active:scale-95 shadow-md
                            ${theme.isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'}
                        `}
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            <div className="relative group">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    className={`
                        rounded-[40px] border-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] transition-all duration-500
                        ${theme.isDarkMode ? 'bg-black border-white/5 shadow-blue-500/10' : 'bg-white border-black/5'}
                        ${isGameOver ? 'opacity-50 grayscale scale-[0.98]' : ''}
                    `}
                />

                {!gameStarted && !isGameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-[32px] backdrop-blur-md animate-in fade-in duration-500">
                        <h2 className="text-white text-5xl font-black mb-12 tracking-tighter drop-shadow-2xl italic">SNAKE</h2>
                        <button
                            onClick={() => setGameStarted(true)}
                            className="flex items-center space-x-4 px-12 py-5 bg-blue-500 text-white rounded-[24px] font-black text-sm hover:bg-blue-600 hover:scale-105 transition-all active:scale-95 shadow-2xl ring-4 ring-blue-500/20"
                        >
                            <Play size={20} fill="white" />
                            <span>PLAY NOW</span>
                        </button>
                    </div>
                )}

                {isGameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-[32px] backdrop-blur-xl animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-rose-500/40">
                            <RotateCcw size={36} className="text-white" />
                        </div>
                        <h2 className="text-white text-4xl font-black mb-2 tracking-tighter italic">GAME OVER</h2>
                        <p className="text-white/40 font-bold mb-12 uppercase tracking-[0.3em] text-[10px]">Score Achieved: {score}</p>
                        <button
                            onClick={resetGame}
                            className="flex items-center space-x-3 px-12 py-5 bg-white text-black rounded-[24px] font-black text-sm hover:bg-gray-100 hover:scale-105 transition-all active:scale-95 shadow-2xl"
                        >
                            <span>RESTART NOW</span>
                        </button>
                    </div>
                )}

                {/* Info Overlay */}
                {showInfo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-2xl rounded-[32px] animate-in fade-in zoom-in-95 duration-300 z-50 p-8">
                        <button
                            onClick={() => setShowInfo(false)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex flex-col items-center text-center max-w-xs">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                                <Info size={32} className="text-blue-500" />
                            </div>
                            <h3 className="text-white text-2xl font-black mb-4 tracking-tight">HOW TO PLAY</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Movement</p>
                                    <div className="flex justify-center space-x-3">
                                        <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-black border border-white/10 shadow-lg">ARROWS</span>
                                        <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-black border border-white/10 shadow-lg">WASD</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Objective</p>
                                    <p className="text-white/70 text-sm leading-relaxed">
                                        Eat the <span className="text-rose-500 font-bold">red treats</span> to grow and score points. Avoid hitting walls or your own tail!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SnakeApp;

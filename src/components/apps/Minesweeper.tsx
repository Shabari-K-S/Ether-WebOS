import React, { useState, useEffect, useCallback } from 'react';
import { useOSStore } from '../../store/osStore';
import { Flag, Bomb, RotateCcw, Timer, Trophy, Info, X } from 'lucide-react';

type CellValue = number | 'mine';
interface Cell {
    value: CellValue;
    isRevealed: boolean;
    isFlagged: boolean;
}

const DIFFICULTIES = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 },
};

const NUMBER_COLORS = [
    '', // 0
    'text-blue-500',   // 1
    'text-emerald-500', // 2
    'text-rose-500',    // 3
    'text-violet-500',  // 4
    'text-amber-500',   // 5
    'text-cyan-500',    // 6
    'text-fuchsia-500', // 7
    'text-slate-900',   // 8
];

interface MinesweeperProps {
    windowId?: string;
    onWindowDrag?: (e: React.MouseEvent) => void;
}

const MinesweeperApp: React.FC<MinesweeperProps> = ({ windowId, onWindowDrag }) => {
    const { theme, updateWindowSize } = useOSStore();
    const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTIES>('beginner');
    const { rows, cols, mines } = DIFFICULTIES[difficulty];

    const [grid, setGrid] = useState<Cell[][]>([]);
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost' | 'idle'>('idle');
    const [minesLeft, setMinesLeft] = useState(mines);
    const [time, setTime] = useState(0);
    const [showInfo, setShowInfo] = useState(false);

    // Auto-resize window when difficulty changes
    useEffect(() => {
        if (!windowId) return;

        let width = 0;
        let height = 0;

        if (difficulty === 'beginner') {
            width = 460;
            height = 620;
        } else if (difficulty === 'intermediate') {
            width = 680;
            height = 840;
        } else { // expert
            width = 900;
            height = 840;
        }

        updateWindowSize(windowId, width, height);
    }, [difficulty, windowId, updateWindowSize]);

    const initGrid = useCallback(() => {
        const newGrid: Cell[][] = Array(rows).fill(null).map(() =>
            Array(cols).fill(null).map(() => ({
                value: 0,
                isRevealed: false,
                isFlagged: false,
            }))
        );
        setGrid(newGrid);
        setGameState('idle');
        setMinesLeft(mines);
        setTime(0);
    }, [rows, cols, mines]);

    useEffect(() => {
        initGrid();
    }, [initGrid]);

    useEffect(() => {
        let timer: any;
        if (gameState === 'playing') {
            timer = setInterval(() => setTime(t => t + 1), 1000);
        }
        return () => clearInterval(timer);
    }, [gameState]);

    const placeMines = (startRow: number, startCol: number) => {
        const newGrid = [...grid.map(row => [...row.map(cell => ({ ...cell }))])];
        let minesPlaced = 0;

        while (minesPlaced < mines) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);

            if (
                newGrid[r][c].value !== 'mine' &&
                !(Math.abs(r - startRow) <= 1 && Math.abs(c - startCol) <= 1)
            ) {
                newGrid[r][c].value = 'mine';
                minesPlaced++;
            }
        }

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (newGrid[r][c].value === 'mine') continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newGrid[nr][nc].value === 'mine') {
                            count++;
                        }
                    }
                }
                newGrid[r][c].value = count;
            }
        }

        return newGrid;
    };

    const revealCell = (r: number, c: number) => {
        if (gameState === 'won' || gameState === 'lost' || grid[r][c].isFlagged || grid[r][c].isRevealed) return;

        let currentGrid = [...grid];
        if (gameState === 'idle') {
            currentGrid = placeMines(r, c);
            setGameState('playing');
        }

        const newGrid = [...currentGrid.map(row => [...row])];

        const reveal = (row: number, col: number) => {
            if (row < 0 || row >= rows || col < 0 || col >= cols || newGrid[row][col].isRevealed || newGrid[row][col].isFlagged) return;

            newGrid[row][col].isRevealed = true;

            if (newGrid[row][col].value === 0) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        reveal(row + dr, col + dc);
                    }
                }
            }
        };

        if (newGrid[r][c].value === 'mine') {
            // Reveal all mines properly with a map to ensure re-render
            const lossGrid = newGrid.map(row => row.map(cell => ({
                ...cell,
                isRevealed: cell.value === 'mine' ? true : cell.isRevealed
            })));
            setGrid(lossGrid);
            setGameState('lost');
            return; // Exit early since we updated state
        } else {
            reveal(r, c);
            const unrevealedSafe = newGrid.flat().some(cell => !cell.isRevealed && cell.value !== 'mine');
            if (!unrevealedSafe) setGameState('won');
        }

        setGrid(newGrid);
    };

    const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
        e.preventDefault();
        if (gameState === 'won' || gameState === 'lost' || grid[r][c].isRevealed) return;

        const newGrid = [...grid.map(row => [...row])];
        const isFlagged = !newGrid[r][c].isFlagged;

        if (isFlagged && minesLeft === 0) return;

        newGrid[r][c].isFlagged = isFlagged;
        setGrid(newGrid);
        setMinesLeft(prev => isFlagged ? prev - 1 : prev + 1);

        if (gameState === 'idle') setGameState('playing');
    };

    return (
        <div
            onMouseDown={onWindowDrag}
            className={`h-full flex flex-col items-center pt-14 px-6 pb-6 ${theme.isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-100'}`}>
            {/* HUD / Header */}
            <div className={`
                w-full px-4 py-3 mb-6 flex items-center justify-between rounded-2xl border shadow-xl backdrop-blur-2xl
                ${theme.isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/5'}
            `}>
                <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.1em] opacity-40">Mines</span>
                        <div className="flex items-center space-x-1.5">
                            <Bomb size={14} className="text-rose-500" />
                            <span className={`text-lg font-black tabular-nums ${theme.isDarkMode ? 'text-white' : 'text-gray-900'}`}>{minesLeft}</span>
                        </div>
                    </div>
                    <div className="w-px h-6 bg-current opacity-10" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.1em] opacity-40">Time</span>
                        <div className="flex items-center space-x-1.5">
                            <Timer size={14} className="text-blue-500" />
                            <span className={`text-lg font-black tabular-nums ${theme.isDarkMode ? 'text-white' : 'text-gray-900'}`}>{time}s</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5 mx-2">
                    {['beginner', 'intermediate', 'expert'].map((d) => (
                        <button
                            key={d}
                            onClick={() => { setDifficulty(d as any); }}
                            className={`
                                px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300
                                ${difficulty === d
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'text-inherit opacity-40 hover:opacity-100'}
                            `}
                        >
                            {d[0]}
                        </button>
                    ))}
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowInfo(true)}
                        className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all text-inherit opacity-60 hover:opacity-100"
                    >
                        <Info size={16} />
                    </button>
                    <button
                        onClick={initGrid}
                        className={`
                            p-2.5 rounded-xl transition-all active:scale-90 shadow-md
                            ${theme.isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'}
                        `}
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            {/* Main Game Grid Container */}
            <div className={`
                p-4 rounded-[40px] border-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] relative transition-all duration-500
                ${theme.isDarkMode ? 'bg-black/40 border-white/5 shadow-blue-500/5' : 'bg-white/40 border-black/5'}
            `}>
                <div
                    className="grid gap-1.5"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        width: 'fit-content'
                    }}
                >
                    {grid.map((row, r) => row.map((cell, c) => (
                        <button
                            key={`${r}-${c}`}
                            onClick={() => revealCell(r, c)}
                            onContextMenu={(e) => toggleFlag(e, r, c)}
                            className={`
                                flex items-center justify-center transition-all duration-200 text-sm font-black relative overflow-hidden group rounded-xl
                                ${difficulty === 'expert' ? 'w-6 h-6' : (difficulty === 'intermediate' ? 'w-8 h-8' : 'w-9 h-9')}
                                ${cell.isRevealed
                                    ? (cell.value === 'mine' ? 'bg-rose-500' : (theme.isDarkMode ? 'bg-white/10' : 'bg-black/5 shadow-inner'))
                                    : (theme.isDarkMode
                                        ? 'bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_6px_rgba(0,0,0,0.3)] hover:bg-zinc-700 active:shadow-inner'
                                        : 'bg-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:bg-gray-50 active:shadow-inner')
                                }
                            `}
                        >
                            {cell.isRevealed ? (
                                cell.value === 'mine' ? <Bomb size={difficulty === 'expert' ? 14 : 18} className="text-white drop-shadow-md animate-in zoom-in-50" /> : (
                                    cell.value !== 0 && (
                                        <span className={`${NUMBER_COLORS[cell.value as number]} drop-shadow-sm ${difficulty === 'expert' ? 'text-xs' : ''}`}>
                                            {cell.value}
                                        </span>
                                    )
                                )
                            ) : (
                                cell.isFlagged && (
                                    <div className="relative animate-in zoom-in-50 duration-300">
                                        <div className="absolute inset-0 bg-rose-500/20 blur-md rounded-full" />
                                        <Flag size={difficulty === 'expert' ? 12 : 16} className="text-rose-500 relative z-10" />
                                    </div>
                                )
                            )}
                        </button>
                    )))}
                </div>

                {/* Overlays */}
                {gameState === 'won' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/10 backdrop-blur-xl rounded-[32px] animate-in fade-in zoom-in-95 duration-700 z-20 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent" />
                        <div className="relative flex flex-col items-center">
                            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                                <Trophy size={48} className="text-white animate-bounce" />
                            </div>
                            <h2 className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl italic">VICTORY</h2>
                            <p className="text-white/60 font-black text-xs tracking-[0.3em] uppercase mt-2 mb-10">Solved in {time} seconds</p>
                            <button
                                onClick={initGrid}
                                className="px-10 py-4 bg-white text-black rounded-2xl font-black text-xs hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shadow-2xl"
                            >
                                PLAY AGAIN
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'lost' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/20 backdrop-blur-[2px] rounded-[32px] animate-in fade-in zoom-in-95 duration-500 z-20">
                        <div className="relative flex flex-col items-center p-8 bg-black/60 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl">
                            <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                                <Bomb size={32} className="text-white animate-pulse" />
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter text-white drop-shadow-2xl italic">BOOM!</h2>
                            <p className="text-white/60 font-black text-[10px] tracking-[0.3em] uppercase mt-1 mb-8">Board revealed</p>
                            <button
                                onClick={initGrid}
                                className="px-8 py-3 bg-white text-black rounded-2xl font-black text-xs hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all"
                            >
                                TRY AGAIN
                            </button>
                        </div>
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
                            <h3 className="text-white text-2xl font-black mb-4 tracking-tight uppercase">Minesweeper</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                        <p className="text-blue-500 text-[10px] font-black uppercase mb-1">Left Click</p>
                                        <p className="text-white/70 text-[10px] font-bold">Reveal Cell</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                        <p className="text-rose-500 text-[10px] font-black uppercase mb-1">Right Click</p>
                                        <p className="text-white/70 text-[10px] font-bold">Flag Mine</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Goal</p>
                                    <p className="text-white/70 text-[11px] leading-relaxed">
                                        Clear the board without hitting any mines. Numbers indicate how many mines are adjacent to that cell.
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

export default MinesweeperApp;

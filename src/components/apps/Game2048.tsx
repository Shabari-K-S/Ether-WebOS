import React, { useState, useEffect, useCallback } from 'react';
import type { AppProps } from '../../types';
import { RotateCcw } from 'lucide-react';
import { useOSStore } from '../../store/osStore';

const GRID_SIZE = 4;

const Game2048: React.FC<AppProps> = ({ onWindowDrag }) => {
    const { theme } = useOSStore();
    const [board, setBoard] = useState<number[][]>([]);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Initialize Game
    const initGame = useCallback(() => {
        const newBoard = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
        addRandomTile(newBoard);
        addRandomTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);

        const storedBest = localStorage.getItem('2048-best');
        if (storedBest) setBestScore(parseInt(storedBest));
    }, []);

    useEffect(() => {
        initGame();
    }, [initGame]);

    const addRandomTile = (currentBoard: number[][]) => {
        const emptyTiles: { r: number, c: number }[] = [];
        currentBoard.forEach((row, r) => {
            row.forEach((val, c) => {
                if (val === 0) emptyTiles.push({ r, c });
            });
        });

        if (emptyTiles.length > 0) {
            const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            currentBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    };

    const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        if (gameOver) return;

        let moved = false;
        let newScore = score;
        const newBoard = board.map(row => [...row]);

        const rotate = (matrix: number[][]) => {
            const N = matrix.length;
            const res = Array(N).fill(0).map(() => Array(N).fill(0));
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    res[i][j] = matrix[N - 1 - j][i];
                }
            }
            return res;
        };

        // Normalize to "Left" movement
        let workingBoard = newBoard;
        if (direction === 'up') workingBoard = rotate(rotate(rotate(workingBoard)));
        if (direction === 'right') workingBoard = rotate(rotate(workingBoard));
        if (direction === 'down') workingBoard = rotate(workingBoard);

        // Process "Left" move
        for (let r = 0; r < GRID_SIZE; r++) {
            let row = workingBoard[r].filter(val => val !== 0);
            for (let c = 0; c < row.length - 1; c++) {
                if (row[c] === row[c + 1]) {
                    row[c] *= 2;
                    newScore += row[c];
                    row.splice(c + 1, 1);
                    moved = true; // Merge happened
                }
            }
            while (row.length < GRID_SIZE) row.push(0);

            if (workingBoard[r].join(',') !== row.join(',')) moved = true;
            workingBoard[r] = row;
        }

        // Restore orientation
        if (direction === 'up') workingBoard = rotate(workingBoard);
        if (direction === 'right') workingBoard = rotate(rotate(workingBoard));
        if (direction === 'down') workingBoard = rotate(rotate(rotate(workingBoard)));

        if (moved) {
            addRandomTile(workingBoard);
            setBoard(workingBoard);
            setScore(newScore);
            if (newScore > bestScore) {
                setBestScore(newScore);
                localStorage.setItem('2048-best', newScore.toString());
            }

            // Check Game Over
            let movesPossible = false;
            // Check zeros
            for (let i = 0; i < GRID_SIZE; i++) for (let j = 0; j < GRID_SIZE; j++) if (workingBoard[i][j] === 0) movesPossible = true;
            // Check merges
            if (!movesPossible) {
                for (let i = 0; i < GRID_SIZE; i++) {
                    for (let j = 0; j < GRID_SIZE; j++) {
                        if (i < GRID_SIZE - 1 && workingBoard[i][j] === workingBoard[i + 1][j]) movesPossible = true;
                        if (j < GRID_SIZE - 1 && workingBoard[i][j] === workingBoard[i][j + 1]) movesPossible = true;
                    }
                }
            }

            if (!movesPossible) setGameOver(true);
        }
    }, [board, score, bestScore, gameOver]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': e.preventDefault(); move('up'); break;
                case 'ArrowDown': e.preventDefault(); move('down'); break;
                case 'ArrowLeft': e.preventDefault(); move('left'); break;
                case 'ArrowRight': e.preventDefault(); move('right'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [move]);

    const getTileColor = (value: number) => {
        const colors: Record<number, string> = {
            2: 'bg-[#eee4da] text-[#776e65]',
            4: 'bg-[#ede0c8] text-[#776e65]',
            8: 'bg-[#f2b179] text-white',
            16: 'bg-[#f59563] text-white',
            32: 'bg-[#f67c5f] text-white',
            64: 'bg-[#f65e3b] text-white',
            128: 'bg-[#edcf72] text-white',
            256: 'bg-[#edcc61] text-white',
            512: 'bg-[#edc850] text-white',
            1024: 'bg-[#edc53f] text-white',
            2048: 'bg-[#edc22e] text-white shadow-[0_0_30px_10px_rgba(243,215,116,0.4)]',
        };
        return colors[value] || 'bg-[#3c3a32] text-white';
    };

    return (
        <div className={`h-full flex flex-col p-6 select-none ${theme.isDarkMode ? 'bg-[#2a2a2a] text-[#f9f6f2]' : 'bg-[#faf8ef] text-[#776e65]'}`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6" onMouseDown={onWindowDrag}>
                <div>
                    <h1 className="text-5xl font-bold mb-2">2048</h1>
                    <p className="text-sm opacity-70">Join the numbers to get to 2048!</p>
                </div>
                <div className="flex space-x-2">
                    <div className="flex flex-col items-center bg-[#bbada0] p-2 rounded min-w-[70px] text-white">
                        <span className="text-xs font-bold uppercase text-[#eee4da]">Score</span>
                        <span className="text-xl font-bold">{score}</span>
                    </div>
                    <div className="flex flex-col items-center bg-[#bbada0] p-2 rounded min-w-[70px] text-white">
                        <span className="text-xs font-bold uppercase text-[#eee4da]">Best</span>
                        <span className="text-xl font-bold">{bestScore}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={initGame}
                    className="flex items-center gap-2 px-4 py-2 bg-[#8f7a66] text-white rounded font-bold hover:bg-[#8f7a66]/90 transition-colors"
                >
                    <RotateCcw size={16} /> New Game
                </button>
                <span className="text-xs font-bold opacity-50">Use Arrow Keys</span>
            </div>

            {/* Game Board */}
            <div className="flex-1 flex items-center justify-center">
                <div className="relative bg-[#bbada0] p-3 rounded-lg w-full max-w-[400px] aspect-square">
                    {/* Grid Background */}
                    <div className="grid grid-cols-4 gap-3 h-full">
                        {Array(16).fill(0).map((_, i) => (
                            <div key={i} className="bg-[#cdc1b4] rounded w-full h-full" />
                        ))}
                    </div>

                    {/* Tiles Layer */}
                    <div className="absolute inset-3 grid grid-cols-4 gap-3 pointer-events-none">
                        {board.map((row, r) => (
                            row.map((val, c) => (
                                <div key={`${r}-${c}`} className="w-full h-full flex items-center justify-center">
                                    {val > 0 && (
                                        <div
                                            className={`
                        w-full h-full rounded flex items-center justify-center font-bold text-3xl
                        animate-in zoom-in duration-200
                        ${getTileColor(val)}
                      `}
                                        >
                                            {val}
                                        </div>
                                    )}
                                </div>
                            ))
                        ))}
                    </div>

                    {/* Game Over Overlay */}
                    {gameOver && (
                        <div className="absolute inset-0 bg-[#eee4da]/70 flex flex-col items-center justify-center rounded-lg animate-in fade-in z-20">
                            <h2 className="text-4xl font-bold text-[#776e65] mb-4">Game Over!</h2>
                            <button
                                onClick={initGame}
                                className="px-6 py-3 bg-[#8f7a66] text-white rounded font-bold hover:scale-105 transition-transform shadow-lg"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Game2048;
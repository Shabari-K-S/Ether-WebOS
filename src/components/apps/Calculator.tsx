import React, { useState, useEffect, useCallback } from 'react';
import { useOSStore } from '../../store/osStore';
import type { AppProps } from '../../types';

interface ButtonProps {
    label: string;
    type?: 'number' | 'operator' | 'function';
    onClick: () => void;
    className?: string;
    isActive?: boolean;
    isDark: boolean;
}

const CalculatorButton: React.FC<ButtonProps> = React.memo(({ label, type = 'number', onClick, className = '', isActive, isDark }) => {
    let bgClass = isDark ? 'bg-[#333]' : 'bg-[#e5e5e5] text-black';
    if (type === 'operator') bgClass = 'bg-orange-500 text-white';
    if (type === 'function') bgClass = isDark ? 'bg-[#a5a5a5] text-black' : 'bg-[#d4d4d2] text-black';

    if (isActive && type === 'operator') bgClass = 'bg-white text-orange-500';

    return (
        <button
            onClick={onClick}
            className={`
        h-12 w-full rounded-full text-xl font-medium transition-all active:brightness-125
        flex items-center justify-center
        ${bgClass}
        ${className}
      `}
        >
            {label}
        </button>
    );
});

const CalculatorApp: React.FC<AppProps> = ({ onWindowDrag }) => {
    const { theme } = useOSStore();
    const [display, setDisplay] = useState('0');
    const [prevValue, setPrevValue] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);

    const inputDigit = useCallback((digit: string) => {
        setDisplay(prevDisplay => {
            if (waitingForOperand) {
                return digit;
            }
            if (prevDisplay === '0') {
                return digit;
            }
            if (prevDisplay.length > 9) return prevDisplay;
            return prevDisplay + digit;
        });
        if (waitingForOperand) {
            setWaitingForOperand(false);
        }
    }, [waitingForOperand]);

    const inputDot = useCallback(() => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
        } else {
            setDisplay(prev => prev.indexOf('.') === -1 ? prev + '.' : prev);
        }
    }, [waitingForOperand]);

    const clear = useCallback(() => {
        setDisplay('0');
        setPrevValue(null);
        setOperator(null);
        setWaitingForOperand(false);
    }, []);

    const toggleSign = () => {
        setDisplay(prev => String(-parseFloat(prev)));
    };

    const inputPercent = () => {
        setDisplay(prev => String(parseFloat(prev) / 100));
    };

    const calculate = (prev: number, next: number, op: string): number => {
        switch (op) {
            case '+': return prev + next;
            case '-': return prev - next;
            case '*': return prev * next;
            case '/': return prev / next;
            default: return next;
        }
    };

    const performOperation = useCallback((nextOperator: string) => {
        const inputValue = parseFloat(display);

        if (prevValue === null) {
            setPrevValue(inputValue);
        } else if (operator) {
            const currentValue = prevValue || 0;
            if (!waitingForOperand || nextOperator === '=') {
                const newValue = calculate(currentValue, inputValue, operator);
                setPrevValue(newValue);
                setDisplay(String(newValue));
            }
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    }, [display, prevValue, operator, waitingForOperand]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key;
            if (['Enter', ' ', '+', '-', '*', '/'].includes(key)) e.preventDefault();
            if (key >= '0' && key <= '9') inputDigit(key);
            if (key === '.') inputDot();
            if (key === 'Enter' || key === '=') performOperation('=');
            if (key === 'Backspace') setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
            if (key === 'Escape' || key === 'c' || key === 'C') clear();
            if (key === '+') performOperation('+');
            if (key === '-') performOperation('-');
            if (key === '*') performOperation('*');
            if (key === '/') performOperation('/');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inputDigit, inputDot, performOperation, clear]);

    return (
        <div
            className={`h-full flex flex-col p-4 select-none ${theme.isDarkMode ? 'bg-black text-white' : 'bg-[#f0f0f0] text-black'}`}
            onMouseDown={onWindowDrag}
        >
            {/* Spacer for Traffic Lights */}
            <div className="h-6 w-full" />

            <div className="flex-1 flex items-end justify-end mb-4 px-2">
                <span className="text-5xl font-light tracking-tight truncate">{display}</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
                <CalculatorButton isDark={theme.isDarkMode} label={display === '0' ? 'AC' : 'C'} type="function" onClick={clear} />
                <CalculatorButton isDark={theme.isDarkMode} label="+/-" type="function" onClick={toggleSign} />
                <CalculatorButton isDark={theme.isDarkMode} label="%" type="function" onClick={inputPercent} />
                <CalculatorButton isDark={theme.isDarkMode} label="/" type="operator" isActive={operator === '/' && waitingForOperand} onClick={() => performOperation('/')} />

                <CalculatorButton isDark={theme.isDarkMode} label="7" onClick={() => inputDigit('7')} />
                <CalculatorButton isDark={theme.isDarkMode} label="8" onClick={() => inputDigit('8')} />
                <CalculatorButton isDark={theme.isDarkMode} label="9" onClick={() => inputDigit('9')} />
                <CalculatorButton isDark={theme.isDarkMode} label="*" type="operator" isActive={operator === '*' && waitingForOperand} onClick={() => performOperation('*')} />

                <CalculatorButton isDark={theme.isDarkMode} label="4" onClick={() => inputDigit('4')} />
                <CalculatorButton isDark={theme.isDarkMode} label="5" onClick={() => inputDigit('5')} />
                <CalculatorButton isDark={theme.isDarkMode} label="6" onClick={() => inputDigit('6')} />
                <CalculatorButton isDark={theme.isDarkMode} label="-" type="operator" isActive={operator === '-' && waitingForOperand} onClick={() => performOperation('-')} />

                <CalculatorButton isDark={theme.isDarkMode} label="1" onClick={() => inputDigit('1')} />
                <CalculatorButton isDark={theme.isDarkMode} label="2" onClick={() => inputDigit('2')} />
                <CalculatorButton isDark={theme.isDarkMode} label="3" onClick={() => inputDigit('3')} />
                <CalculatorButton isDark={theme.isDarkMode} label="+" type="operator" isActive={operator === '+' && waitingForOperand} onClick={() => performOperation('+')} />

                <CalculatorButton isDark={theme.isDarkMode} label="0" className="col-span-2 pl-6 text-left" onClick={() => inputDigit('0')} />
                <CalculatorButton isDark={theme.isDarkMode} label="." onClick={inputDot} />
                <CalculatorButton isDark={theme.isDarkMode} label="=" type="operator" onClick={() => performOperation('=')} />
            </div>
        </div>
    );
};

export default CalculatorApp;
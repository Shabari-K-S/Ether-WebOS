import type { AppID } from './types';
import finderIcon from './assets/finder.webp';
import browserIcon from './assets/browser.webp';
import notesIcon from './assets/notes.webp';
import pixelPaintIcon from './assets/paint.webp';
import terminalIcon from './assets/terminal.webp';
import calculatorIcon from './assets/calculator.webp';
import game2048Icon from './assets/2048game.webp';
import cameraIcon from './assets/camera.webp';
import { Activity } from 'lucide-react';
import CalendarIcon from './assets/calendar.webp';
import ClockIcon from './assets/clock.webp';

export interface AppMetadata {
    id: AppID;
    name: string;
    icon: React.ComponentType<any> | string;
    defaultWidth: number;
    defaultHeight: number;
    hideTitleBar?: boolean;
}

export const APP_METADATA: Record<AppID, AppMetadata> = {
    finder: {
        id: 'finder',
        name: 'Finder',
        icon: finderIcon,
        defaultWidth: 800,
        defaultHeight: 500,
    },
    browser: {
        id: 'browser',
        name: 'Browser',
        icon: browserIcon,
        defaultWidth: 1000,
        defaultHeight: 600,
        hideTitleBar: true,
    },
    notes: {
        id: 'notes',
        name: 'Notes',
        icon: notesIcon,
        defaultWidth: 700,
        defaultHeight: 500,
    },
    camera: {
        id: 'camera',
        name: 'Camera',
        icon: cameraIcon,
        defaultWidth: 700,
        defaultHeight: 500,
        hideTitleBar: true,
    },
    pixelpaint: {
        id: 'pixelpaint',
        name: 'Pixel Paint',
        icon: pixelPaintIcon,
        defaultWidth: 800,
        defaultHeight: 600,
    },
    game2048: {
        id: 'game2048',
        name: '2048',
        icon: game2048Icon,
        defaultWidth: 500,
        defaultHeight: 650,
        hideTitleBar: true,
    },
    calendar: {
        id: 'calendar',
        name: 'Calendar',
        icon: CalendarIcon,
        defaultWidth: 800,
        defaultHeight: 600,
    },
    clock: {
        id: 'clock',
        name: 'Clock',
        icon: ClockIcon,
        defaultWidth: 500,
        defaultHeight: 600,
    },
    terminal: {
        id: 'terminal',
        name: 'Terminal',
        icon: terminalIcon,
        defaultWidth: 600,
        defaultHeight: 400,
    },
    settings: {
        id: 'settings',
        name: 'Settings',
        icon: 'https://img.icons8.com/color/96/apple-settings.png',
        defaultWidth: 600,
        defaultHeight: 450,
    },
    calculator: {
        id: 'calculator',
        name: 'Calculator',
        icon: calculatorIcon,
        defaultWidth: 320,
        defaultHeight: 450,
        hideTitleBar: true,
    },
    taskmanager: {
        id: 'taskmanager',
        name: 'Task Manager',
        icon: Activity,
        defaultWidth: 500,
        defaultHeight: 400,
    },
    about: {
        id: 'about',
        name: 'About This Ether',
        icon: 'https://img.icons8.com/ios-filled/100/info.png',
        defaultWidth: 400,
        defaultHeight: 520,
    },
};

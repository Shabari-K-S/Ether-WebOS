
import type { AppID, AppConfig } from './types';
import FinderApp from './components/apps/Finder';
import TerminalApp from './components/apps/Terminal';
import SettingsApp from './components/apps/Settings';
import CalculatorApp from './components/apps/Calculator';
import BrowserApp from './components/apps/Browser';
import NotesApp from './components/apps/Notes';
import CameraApp from './components/apps/Camera';
import PixelPaintApp from './components/apps/PixelPaint';
import Game2048App from './components/apps/Game2048';

import finderIcon from './assets/finder.webp';
import browserIcon from './assets/browser.webp';
import notesIcon from './assets/notes.webp';
import pixelPaintIcon from './assets/paint.webp';
import terminalIcon from './assets/terminal.webp';
import calculatorIcon from './assets/calculator.webp';
import game2048Icon from './assets/2048game.webp';
import cameraIcon from './assets/camera.webp';

export const APPS: Record<AppID, AppConfig> = {
  finder: {
    id: 'finder',
    name: 'Finder',
    icon: finderIcon,
    component: FinderApp,
    defaultWidth: 800,
    defaultHeight: 500,
  },
  browser: {
    id: 'browser',
    name: 'Browser',
    icon: browserIcon,
    component: BrowserApp,
    defaultWidth: 1000,
    defaultHeight: 600,
    hideTitleBar: true,
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    icon: notesIcon,
    component: NotesApp,
    defaultWidth: 700,
    defaultHeight: 500,
  },
  camera: {
    id: 'camera',
    name: 'Camera',
    icon: cameraIcon,
    component: CameraApp,
    defaultWidth: 700,
    defaultHeight: 500,
    hideTitleBar: true,
  },
  pixelpaint: {
    id: 'pixelpaint',
    name: 'Pixel Paint',
    icon: pixelPaintIcon,
    component: PixelPaintApp,
    defaultWidth: 800,
    defaultHeight: 600,
  },
  game2048: {
    id: 'game2048',
    name: '2048',
    icon: game2048Icon,
    component: Game2048App,
    defaultWidth: 500,
    defaultHeight: 650,
    hideTitleBar: true,
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    icon: terminalIcon,
    component: TerminalApp,
    defaultWidth: 600,
    defaultHeight: 400,
  },
  settings: {
    id: 'settings',
    name: 'Settings',
    icon: 'https://img.icons8.com/color/96/apple-settings.png',
    component: SettingsApp,
    defaultWidth: 600,
    defaultHeight: 450,
  },
  calculator: {
    id: 'calculator',
    name: 'Calculator',
    icon: calculatorIcon,
    component: CalculatorApp,
    defaultWidth: 320,
    defaultHeight: 450,
    hideTitleBar: true,
  },
};

import type { AppID, AppConfig } from './types';
import FinderApp from './components/apps/Finder';
import TerminalApp from './components/apps/Terminal';
import SettingsApp from './components/apps/Settings';
import CalculatorApp from './components/apps/Calculator';
import BrowserApp from './components/apps/Browser';
import NotesApp from './components/apps/Notes';
import CameraApp from './components/apps/Camera';
import PixelPaintApp from './components/apps/PixelPaint';

export const APPS: Record<AppID, AppConfig> = {
  finder: {
    id: 'finder',
    name: 'Finder',
    icon: 'https://img.icons8.com/color/480/mac-logo.png',
    component: FinderApp,
    defaultWidth: 800,
    defaultHeight: 500,
  },
  browser: {
    id: 'browser',
    name: 'Browser',
    icon: 'https://img.icons8.com/color/96/internet--v1.png',
    component: BrowserApp,
    defaultWidth: 1000,
    defaultHeight: 600,
    hideTitleBar: true,
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    icon: 'https://img.icons8.com/plasticine/100/apple-notes--v1.png',
    component: NotesApp,
    defaultWidth: 700,
    defaultHeight: 500,
  },
  camera: {
    id: 'camera',
    name: 'Camera',
    icon: 'https://img.icons8.com/color/96/old-time-camera.png',
    component: CameraApp,
    defaultWidth: 700,
    defaultHeight: 500,
    hideTitleBar: true,
  },
  pixelpaint: {
    id: 'pixelpaint',
    name: 'Pixel Paint',
    icon: 'https://img.icons8.com/plasticine/100/paint-palette.png',
    component: PixelPaintApp,
    defaultWidth: 800,
    defaultHeight: 600,
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    icon: 'https://img.icons8.com/fluency/48/linux-terminal.png',
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
    icon: 'https://img.icons8.com/color/96/apple-calculator.png',
    component: CalculatorApp,
    defaultWidth: 320,
    defaultHeight: 450,
    hideTitleBar: true,
  },
};
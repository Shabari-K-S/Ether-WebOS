import { Terminal, Folder, Settings, Calculator, Globe, LayoutGrid } from 'lucide-react';
import type { AppID, AppConfig } from './types';
import FinderApp from './components/apps/Finder';
import TerminalApp from './components/apps/Terminal';
import SettingsApp from './components/apps/Settings';
import CalculatorApp from './components/apps/Calculator';
import BrowserApp from './components/apps/Browser';

export const APPS: Record<AppID, AppConfig> = {
  finder: {
    id: 'finder',
    name: 'Finder',
    icon: Folder,
    component: FinderApp,
    defaultWidth: 800,
    defaultHeight: 500,
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    icon: Terminal,
    component: TerminalApp,
    defaultWidth: 600,
    defaultHeight: 400,
  },
  settings: {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    component: SettingsApp,
    defaultWidth: 600,
    defaultHeight: 450,
  },
  calculator: {
    id: 'calculator',
    name: 'Calculator',
    icon: Calculator,
    component: CalculatorApp,
    defaultWidth: 320,
    defaultHeight: 450,
    hideTitleBar: true, // Calculator often looks better without heavy chrome too
  },
  browser: {
    id: 'browser',
    name: 'Browser',
    icon: Globe,
    component: BrowserApp,
    defaultWidth: 1000,
    defaultHeight: 600,
    hideTitleBar: true,
  }
};
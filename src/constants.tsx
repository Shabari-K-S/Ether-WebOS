import { Terminal, Folder, Settings, Calculator, Globe } from 'lucide-react';
import type { AppID, AppConfig } from './types';
import FinderApp from './components/apps/Finder';
import TerminalApp from './components/apps/Terminal';
import SettingsApp from './components/apps/Settings';
import CalculatorApp from './components/apps/Calculator';

// Placeholder components for apps not fully implemented in this demo
const PlaceholderApp = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center h-full text-gray-500">
    {name} is coming soon.
  </div>
);

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
  },
  browser: {
    id: 'browser',
    name: 'Browser',
    icon: Globe,
    component: PlaceholderApp,
    defaultWidth: 1000,
    defaultHeight: 600,
  }
};
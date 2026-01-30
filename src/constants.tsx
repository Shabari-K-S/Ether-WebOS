
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
import TaskManagerApp from './components/apps/TaskManager';
import CalendarApp from './components/apps/Calendar';
import ClockApp from './components/apps/Clock';
import AboutApp from './components/apps/About';
import SnakeApp from './components/apps/Snake';
import MinesweeperApp from './components/apps/Minesweeper';
import VSCodeApp from './components/apps/VSCode';

import { APP_METADATA } from './apps.config';

const APP_COMPONENTS: Record<AppID, React.ComponentType<any>> = {
  finder: FinderApp,
  terminal: TerminalApp,
  settings: SettingsApp,
  calculator: CalculatorApp,
  browser: BrowserApp,
  notes: NotesApp,
  camera: CameraApp,
  pixelpaint: PixelPaintApp,
  game2048: Game2048App,
  taskmanager: TaskManagerApp,
  calendar: CalendarApp,
  clock: ClockApp,
  about: AboutApp,
  snake: SnakeApp,
  minesweeper: MinesweeperApp,
  vscode: VSCodeApp,
};

// Merge metadata with components
export const APPS: Record<AppID, AppConfig> = Object.keys(APP_METADATA).reduce((acc, output) => {
  const id = output as AppID;
  const meta = APP_METADATA[id];
  acc[id] = {
    ...meta,
    component: APP_COMPONENTS[id],
  };
  return acc;
}, {} as Record<AppID, AppConfig>);
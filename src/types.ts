import React from 'react';

export type AppID = 'finder' | 'terminal' | 'settings' | 'calculator' | 'browser' | 'notes' | 'camera' | 'pixelpaint';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appId: AppID;
  title: string;
  position: Position;
  size: Size;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string; // For text files
  children?: string[]; // IDs of children
}

export interface AppProps {
  windowId: string;
  onWindowDrag?: (e: React.MouseEvent) => void;
}

export interface AppConfig {
  id: AppID;
  name: string;
  icon: React.ComponentType<any> | string;
  component: React.ComponentType<AppProps>;
  defaultWidth: number;
  defaultHeight: number;
  hideTitleBar?: boolean;
}

export interface ThemeConfig {
  wallpaper: string;
  isDarkMode: boolean;
  brightness: number;
  volume: number;
}
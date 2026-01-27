import React, { useState, useRef, useEffect } from 'react';
import { useOSStore } from '../../store/osStore';
import { APPS } from '../../constants';

const MatrixEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 600;

    const letters = '01';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = new Array(Math.ceil(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40 pointer-events-none" />;
};

const TerminalApp: React.FC = () => {
  const { fileSystem, createFolder, createFile, deleteNode, launchApp } = useOSStore();
  const [history, setHistory] = useState<string[]>(['Welcome to Ether Terminal. Type "help" for commands.']);
  const [input, setInput] = useState('');
  const [currentDirId, setCurrentDirId] = useState('home');
  const [matrixMode, setMatrixMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Helper to generate path string for display prompt
  const getPathString = (id: string, full: boolean = false): string => {
    if (id === 'root') return '/';

    // Build path array
    let path: string[] = [];
    let current = fileSystem[id];

    // Safety check loop
    let depth = 0;
    while (current && current.parentId && depth < 50) {
      path.unshift(current.name);
      current = fileSystem[current.parentId];
      depth++;
    }

    // Construct absolute path string (assuming /User is home)
    const absPath = '/' + path.join('/');

    if (full) return absPath;

    // For display prompt, replace /User with ~
    if (absPath.startsWith('/User')) {
      return '~' + absPath.substring(5);
    }
    return absPath;
  };

  const displayPath = getPathString(currentDirId);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const rawCmd = input.trim();
    const args = rawCmd.split(/\s+/);
    const cmd = args[0].toLowerCase();

    const newHistory = [...history, `${displayPath} $ ${rawCmd}`];

    switch (cmd) {
      case 'help':
        newHistory.push('Available commands: help, clear, ls, cd, mkdir, pwd, whoami, echo, touch, rm, cat, open, date, matrix');
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'date':
        newHistory.push(new Date().toString());
        break;
      case 'matrix':
        setMatrixMode(!matrixMode);
        newHistory.push(matrixMode ? 'Matrix mode deactivated.' : 'Wake up, Neo...');
        break;
      case 'open':
        const appName = args[1]?.toLowerCase();
        const app = Object.values(APPS).find(a => a.name.toLowerCase() === appName || a.id === appName);
        if (app) {
          launchApp(app.id);
          newHistory.push(`Opening ${app.name}...`);
        } else {
          newHistory.push(`open: application not found: ${appName}`);
          newHistory.push(`Available apps: ${Object.values(APPS).map(a => a.id).join(', ')}`);
        }
        break;
      case 'touch':
        const fileName = args[1];
        if (!fileName) {
          newHistory.push('touch: missing file operand');
        } else {
          const currentDir = fileSystem[currentDirId];
          const exists = currentDir.children?.some(id => fileSystem[id]?.name === fileName);
          if (exists) {
            // Update timestamp simulated (not implemented in types yet)
            newHistory.push(`touch: ${fileName}`);
          } else {
            createFile(currentDirId, fileName, '');
            newHistory.push(`File created: ${fileName}`);
          }
        }
        break;
      case 'rm':
        const targetRm = args[1];
        if (!targetRm) {
          newHistory.push('rm: missing operand');
        } else {
          const currentDir = fileSystem[currentDirId];
          const childId = currentDir.children?.find(id => fileSystem[id]?.name === targetRm);
          if (childId) {
            deleteNode(childId);
            newHistory.push(`Removed: ${targetRm}`);
          } else {
            newHistory.push(`rm: ${targetRm}: No such file or directory`);
          }
        }
        break;
      case 'cat':
        const targetCat = args[1];
        if (!targetCat) {
          newHistory.push('cat: missing operand');
        } else {
          const currentDir = fileSystem[currentDirId];
          const childId = currentDir.children?.find(id => fileSystem[id]?.name === targetCat);
          if (childId) {
            const node = fileSystem[childId];
            if (node.type === 'file') {
              newHistory.push(node.content || '(empty)');
            } else {
              newHistory.push(`cat: ${targetCat}: Is a directory`);
            }
          } else {
            newHistory.push(`cat: ${targetCat}: No such file or directory`);
          }
        }
        break;
      case 'ls':
        const dir = fileSystem[currentDirId];
        if (dir && dir.children) {
          const items = dir.children.map(childId => {
            const child = fileSystem[childId];
            return child.type === 'folder' ? child.name + '/' : child.name;
          });
          newHistory.push(items.join('  ') || '(empty)');
        } else {
          newHistory.push('(empty)');
        }
        break;
      case 'pwd':
        newHistory.push(getPathString(currentDirId, true));
        break;
      case 'cd':
        const target = args[1];
        if (!target || target === '~') {
          setCurrentDirId('home');
        } else if (target === '..') {
          const parentId = fileSystem[currentDirId]?.parentId;
          if (parentId) setCurrentDirId(parentId);
        } else if (target === '/') {
          setCurrentDirId('root');
        } else if (target === '.') {
          // do nothing
        } else {
          // Find child directory
          const currentDir = fileSystem[currentDirId];
          const foundId = currentDir.children?.find(id => fileSystem[id]?.name === target);

          if (foundId) {
            const foundNode = fileSystem[foundId];
            if (foundNode.type === 'folder') {
              setCurrentDirId(foundId);
            } else {
              newHistory.push(`cd: not a directory: ${target}`);
            }
          } else {
            newHistory.push(`cd: no such file or directory: ${target}`);
          }
        }
        break;
      case 'mkdir':
        const folderName = args[1];
        if (!folderName) {
          newHistory.push('mkdir: missing operand');
        } else {
          const currentDir = fileSystem[currentDirId];
          const exists = currentDir.children?.some(id => fileSystem[id]?.name === folderName);
          if (exists) {
            newHistory.push(`mkdir: ${folderName}: File exists`);
          } else {
            createFolder(currentDirId, folderName);
            newHistory.push(`Directory created: ${folderName}`);
          }
        }
        break;
      case 'whoami':
        newHistory.push('user');
        break;
      default:
        if (cmd === 'echo') {
          newHistory.push(args.slice(1).join(' '));
        } else {
          newHistory.push(`zsh: command not found: ${cmd}`);
        }
    }

    setHistory(newHistory);
    setInput('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="h-full bg-[#1e1e1e] text-green-400 font-mono text-sm p-4 flex flex-col relative overflow-hidden" onClick={() => document.getElementById('term-input')?.focus()}>
      {matrixMode && <MatrixEffect />}
      <div className="flex-1 overflow-auto relative z-10">
        {history.map((line, i) => (
          <div key={i} className="mb-1 whitespace-pre-wrap text-white/90">{line}</div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleCommand} className="flex mt-2 relative z-10">
        <span className="mr-2 text-blue-400">{displayPath} $</span>
        <input
          id="term-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-white"
          autoFocus
          autoComplete="off"
        />
      </form>
    </div>
  );
};

export default TerminalApp;
import React, { useState, useRef, useEffect } from 'react';
import { useOSStore } from '../../store/osStore';

const TerminalApp: React.FC = () => {
  const { fileSystem, createFolder } = useOSStore();
  const [history, setHistory] = useState<string[]>(['Welcome to Ether Terminal. Type "help" for commands.']);
  const [input, setInput] = useState('');
  const [currentDirId, setCurrentDirId] = useState('home');
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
        newHistory.push('Available commands: help, clear, ls, cd [dir], mkdir [name], pwd, whoami, echo [text]');
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
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
    <div className="h-full bg-[#1e1e1e] text-green-400 font-mono text-sm p-4 flex flex-col" onClick={() => document.getElementById('term-input')?.focus()}>
      <div className="flex-1 overflow-auto">
        {history.map((line, i) => (
          <div key={i} className="mb-1 whitespace-pre-wrap text-white/90">{line}</div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleCommand} className="flex mt-2">
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
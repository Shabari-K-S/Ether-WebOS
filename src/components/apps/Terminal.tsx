import React, { useState, useRef, useEffect } from 'react';
import { useOSStore } from '../../store/osStore';
import { APPS } from '../../constants';
import { Terminal } from 'lucide-react';

const parseArgs = (input: string): string[] => {
  const args: string[] = [];
  let current = '';
  let inDoubleQuote = false;
  let inSingleQuote = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (/\s/.test(char) && !inDoubleQuote && !inSingleQuote) {
      if (current) {
        args.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current) {
    args.push(current);
  }

  return args;
};

interface TerminalLine {
  type: 'command' | 'output';
  content: string;
  path?: string;
}

const TerminalApp: React.FC = () => {
  const { fileSystem, createFolder, createFile, deleteNode, launchApp } = useOSStore();
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', content: 'Welcome to Ether Terminal. Type "help" for commands.' }
  ]);
  const [input, setInput] = useState('');
  const [currentDirId, setCurrentDirId] = useState('home');
  const bottomRef = useRef<HTMLDivElement>(null);

  const getPathString = (id: string, full: boolean = false): string => {
    if (id === 'root') return '/';
    let path: string[] = [];
    let current = fileSystem[id];
    let depth = 0;
    while (current && current.parentId && depth < 50) {
      path.unshift(current.name);
      current = fileSystem[current.parentId];
      depth++;
    }
    const absPath = '/' + path.join('/');
    if (full) return absPath;
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
    const args = parseArgs(rawCmd);
    const cmd = args[0]?.toLowerCase();
    if (!cmd) return;

    const newHistory = [...history, { type: 'command' as const, content: rawCmd, path: displayPath }];

    const addOutput = (content: string) => {
      newHistory.push({ type: 'output', content });
    };

    switch (cmd) {
      case 'help':
        addOutput('Available commands: help, clear, ls, cd, mkdir, pwd, whoami, echo, touch, rm, cat, open, date');
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'date':
        addOutput(new Date().toString());
        break;
      case 'open':
        const appName = args[1]?.toLowerCase();
        const app = Object.values(APPS).find(a => a.name.toLowerCase() === appName || a.id === appName);
        if (app) {
          launchApp(app.id);
          addOutput(`Opening ${app.name}...`);
        } else {
          addOutput(`open: application not found: ${appName}`);
          addOutput(`Available apps: ${Object.values(APPS).map(a => a.id).join(', ')}`);
        }
        break;
      case 'touch':
        const fileName = args[1];
        if (!fileName) {
          addOutput('touch: missing file operand');
        } else {
          const currentDir = fileSystem[currentDirId];
          const exists = currentDir.children?.some(id => fileSystem[id]?.name === fileName);
          if (exists) {
            addOutput(`touch: ${fileName}`);
          } else {
            createFile(currentDirId, fileName, '');
            addOutput(`File created: ${fileName}`);
          }
        }
        break;
      case 'rm':
        const targetRm = args[1];
        if (!targetRm) {
          addOutput('rm: missing operand');
        } else {
          const currentDir = fileSystem[currentDirId];
          const childId = currentDir.children?.find(id => fileSystem[id]?.name === targetRm);
          if (childId) {
            deleteNode(childId);
            addOutput(`Removed: ${targetRm}`);
          } else {
            addOutput(`rm: ${targetRm}: No such file or directory`);
          }
        }
        break;
      case 'cat':
        const targetCat = args[1];
        if (!targetCat) {
          addOutput('cat: missing operand');
        } else {
          const currentDir = fileSystem[currentDirId];
          const childId = currentDir.children?.find(id => fileSystem[id]?.name === targetCat);
          if (childId) {
            const node = fileSystem[childId];
            if (node.type === 'file') {
              addOutput(node.content || '(empty)');
            } else {
              addOutput(`cat: ${targetCat}: Is a directory`);
            }
          } else {
            addOutput(`cat: ${targetCat}: No such file or directory`);
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
          addOutput(items.join('  ') || '(empty)');
        } else {
          addOutput('(empty)');
        }
        break;
      case 'pwd':
        addOutput(getPathString(currentDirId, true));
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
          const currentDir = fileSystem[currentDirId];
          const foundId = currentDir.children?.find(id => fileSystem[id]?.name === target);
          if (foundId) {
            const foundNode = fileSystem[foundId];
            if (foundNode.type === 'folder') {
              setCurrentDirId(foundId);
            } else {
              addOutput(`cd: not a directory: ${target}`);
            }
          } else {
            addOutput(`cd: no such file or directory: ${target}`);
          }
        }
        break;
      case 'mkdir':
        const folderName = args[1];
        if (!folderName) {
          addOutput('mkdir: missing operand');
        } else {
          const currentDir = fileSystem[currentDirId];
          const exists = currentDir.children?.some(id => fileSystem[id]?.name === folderName);
          if (exists) {
            addOutput(`mkdir: ${folderName}: File exists`);
          } else {
            createFolder(currentDirId, folderName);
            addOutput(`Directory created: ${folderName}`);
          }
        }
        break;
      case 'whoami':
        addOutput('user');
        break;
      default:
        if (cmd === 'echo') {
          addOutput(args.slice(1).join(' '));
        } else {
          addOutput(`zsh: command not found: ${cmd}`);
        }
    }

    setHistory(newHistory);
    setInput('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleTerminalClick = () => {
    // Only focus if not selecting text
    if (window.getSelection()?.toString().length === 0) {
      document.getElementById('term-input')?.focus();
    }
  };

  return (
    <div
      className="h-full bg-[#0d0f14] text-[#a9b1d6] font-mono text-sm p-6 flex flex-col relative overflow-hidden"
      onClick={handleTerminalClick}
    >
      <div className="absolute bottom-10 right-10 opacity-[0.03] pointer-events-none transform rotate-12">
        <Terminal size={400} />
      </div>

      <div className="flex-1 overflow-auto relative z-10 scrollbar-hide">
        {history.map((line, i) => (
          <div key={i} className="mb-1.5 leading-relaxed select-text cursor-text">
            {line.type === 'command' ? (
              <div className="flex items-center">
                <span className="text-[#2dd4bf] font-bold mr-3">{line.path}</span>
                <span className="text-[#2dd4bf] font-bold mr-3">)</span>
                <span className="text-white">{line.content}</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{line.content}</div>
            )}
          </div>
        ))}

        <form onSubmit={handleCommand} className="flex mt-2 items-center">
          <span className="mr-3 text-[#2dd4bf] font-bold">{displayPath}</span>
          <span className="mr-3 text-[#2dd4bf] font-bold">{')'}</span>
          <input
            id="term-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:opacity-20"
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
        </form>
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};

export default TerminalApp;
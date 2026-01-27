import { useOSStore } from './store/osStore';
import MenuBar from './components/os/MenuBar';
import Dock from './components/os/Dock';
import Window from './components/os/Window';

function App() {
  const { theme, windows } = useOSStore();

  return (
    <div
      className="h-screen w-screen overflow-hidden relative bg-cover bg-center transition-[background-image] duration-500 ease-in-out"
      style={{ backgroundImage: `url(${theme.wallpaper})` }}
    >
      {/* Overlay for Dark Mode / brightness control */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${theme.isDarkMode ? 'bg-black/40' : 'bg-black/10'}`} />

      {/* OS UI Layer */}
      <MenuBar />

      {/* Desktop Area - Windows container */}
      <div className="absolute inset-0 pointer-events-none">
        {/* All windows are rendered here, pointer-events-auto is needed on the windows themselves */}
        <div className="w-full h-full relative pointer-events-auto">
          {windows.map((windowState) => (
            <Window key={windowState.id} windowState={windowState} />
          ))}
        </div>
      </div>

      <Dock />
    </div>
  );
}

export default App;
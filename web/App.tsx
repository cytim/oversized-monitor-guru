import { useState, useEffect } from 'react';
import ConfigView from './components/ConfigView';
import StreamView from './components/StreamView';
import { InputConfig } from './types';
import './App.css';

const DEFAULT_INPUT_CONFIG: InputConfig = {
  width: Math.floor(window.screen.width / 2),
  height: window.screen.height,
  offsetX: 0,
  offsetY: 0,
  frameRate: 30,
  dpr: Math.round((window.devicePixelRatio || 1.0) * 100) / 100
}

function App() {
  const [currentView, setCurrentView] = useState<'config' | 'stream'>('config');
  const [inputConfig, setInputConfig] = useState<InputConfig>(DEFAULT_INPUT_CONFIG);

  useEffect(() => {
    const savedConfig = localStorage.getItem('inputConfig');
    if (savedConfig) {
      setInputConfig(JSON.parse(savedConfig));
    } else {
      setInputConfig(DEFAULT_INPUT_CONFIG);
      localStorage.setItem('inputConfig', JSON.stringify(DEFAULT_INPUT_CONFIG));
    }
  }, []);

  const handleStartMirroring = (config: InputConfig) => {
    setInputConfig(config);
    localStorage.setItem('inputConfig', JSON.stringify(config));
    setCurrentView('stream');
  };

  const handleStopMirroring = () => {
    setCurrentView('config');
  };

  return (
    <div className="app">
      {currentView === 'config' ? (
        <ConfigView
          inputConfig={inputConfig}
          onStartMirroring={handleStartMirroring}
        />
      ) : (
        <StreamView
            inputConfig={inputConfig}
          onStopMirroring={handleStopMirroring}
        />
      )}
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import PopupView from './components/PopupView';
import StreamView from './components/StreamView';
import { StreamConfig } from './types';
import './App.css';

const DEFAULT_STREAM_CONFIG: StreamConfig = {
  width: Math.floor(window.screen.width / 2),
  height: window.screen.height,
  offset_x: 0,
  offset_y: 0,
  frame_rate: 30,
  dpr: Math.round((window.devicePixelRatio || 1.0) * 100) / 100
}

function App() {
  const [currentView, setCurrentView] = useState<'popup' | 'stream'>('popup');
  const [streamConfig, setStreamConfig] = useState<StreamConfig>(DEFAULT_STREAM_CONFIG);

  useEffect(() => {
    const savedConfig = localStorage.getItem('streamConfig');
    if (savedConfig) {
      setStreamConfig(JSON.parse(savedConfig));
    } else {
      setStreamConfig(DEFAULT_STREAM_CONFIG);
      localStorage.setItem('streamConfig', JSON.stringify(DEFAULT_STREAM_CONFIG));
    }
  }, []);

  const handleStartMirroring = (config: StreamConfig) => {
    setStreamConfig(config);
    localStorage.setItem('streamConfig', JSON.stringify(config));
    setCurrentView('stream');
  };

  const handleStopMirroring = () => {
    setCurrentView('popup');
  };

  return (
    <div className="app">
      {currentView === 'popup' ? (
        <PopupView
          streamConfig={streamConfig}
          onStartMirroring={handleStartMirroring}
        />
      ) : (
        <StreamView
          streamConfig={streamConfig}
          onStopMirroring={handleStopMirroring}
        />
      )}
    </div>
  );
}

export default App;

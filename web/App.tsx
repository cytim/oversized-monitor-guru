import { useState } from 'react';
import ConfigView from './components/ConfigView';
import StreamView from './components/StreamView';
import { InputConfigProvider } from './contexts/InputConfigContext';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'config' | 'stream'>('config');

  const handleStartMirroring = () => {
    setCurrentView('stream');
  };

  const handleStopMirroring = () => {
    setCurrentView('config');
  };

  return (
    <InputConfigProvider>
      <div className="app">
        {currentView === 'config' ? (
          <ConfigView onStartMirroring={handleStartMirroring} />
        ) : (
          <StreamView onStopMirroring={handleStopMirroring} />
        )}
      </div>
    </InputConfigProvider>
  );
}

export default App;

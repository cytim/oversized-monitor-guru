import { useState, useEffect, FormEvent } from 'react';
import { InputConfig } from '../types';
import './ConfigView.css';

interface ConfigViewProps {
  inputConfig: InputConfig;
  onStartMirroring: (config: InputConfig) => void;
}

function ConfigView({ inputConfig, onStartMirroring }: ConfigViewProps) {
  const [config, setConfig] = useState<InputConfig>(inputConfig);
  const [advancedExpanded, setAdvancedExpanded] = useState<boolean>(false);

  useEffect(() => {
    setConfig(inputConfig);
  }, [inputConfig]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateFormData(config)) {
      onStartMirroring(config);
    } else {
      alert('Please enter valid values for all fields.');
    }
  };

  const validateFormData = (data: InputConfig): boolean => {
    return data.width > 0 && data.height > 0 &&
      data.offsetX >= 0 && data.offsetY >= 0 &&
      data.frameRate >= 10 && data.frameRate <= 1000 &&
      data.dpr >= 0.1 && data.dpr <= 4;
  };

  const toggleAdvanced = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setAdvancedExpanded(!advancedExpanded);
  };

  const handleInputChange = (field: keyof InputConfig, value: number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="config-view">
      <h2>Oversized Monitor Guru</h2>

      <form id="inputForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="width">Width (px)</label>
          <input
            type="number"
            id="width"
            value={config.width}
            onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 0)}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="height">Height (px)</label>
          <input
            type="number"
            id="height"
            value={config.height}
            onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="offset-x">Offset from Left (px)</label>
          <input
            type="number"
            id="offset-x"
            value={config.offsetX}
            onChange={(e) => handleInputChange('offsetX', parseInt(e.target.value) || 0)}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="offset-y">Offset from Top (px)</label>
          <input
            type="number"
            id="offset-y"
            value={config.offsetY}
            onChange={(e) => handleInputChange('offsetY', parseInt(e.target.value) || 0)}
            min="0"
            required
          />
        </div>

        <div className={`advanced-config ${advancedExpanded ? 'expanded' : ''}`}>
          <a className="advanced-config-toggle" href="#" onClick={toggleAdvanced}>
            <span className="triangle">▶</span>Advanced Config
          </a>

          <div className="advanced-config-body">
            <div className="form-group">
              <label htmlFor="frame-rate">Frame Rate (fps)</label>
              <input
                type="number"
                id="frame-rate"
                value={config.frameRate}
                onChange={(e) => handleInputChange('frameRate', parseInt(e.target.value) || 0)}
                min="10"
                max="1000"
                step="10"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dpr">Device Pixel Ratio</label>
              <input
                type="number"
                id="dpr"
                value={config.dpr}
                onChange={(e) => handleInputChange('dpr', parseFloat(e.target.value) || 0)}
                min="0.1"
                max="4"
                step="0.1"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="start-btn">
          Start Mirroring
        </button>
      </form>
    </div>
  );
}

export default ConfigView;

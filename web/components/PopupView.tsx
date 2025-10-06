import { useState, useEffect, FormEvent } from 'react';
import { StreamConfig } from '../types';
import './PopupView.css';

interface PopupViewProps {
  streamConfig: StreamConfig;
  onStartMirroring: (config: StreamConfig) => void;
}

function PopupView({ streamConfig, onStartMirroring }: PopupViewProps) {
  const [config, setConfig] = useState<StreamConfig>(streamConfig);
  const [advancedExpanded, setAdvancedExpanded] = useState<boolean>(false);

  useEffect(() => {
    setConfig(streamConfig);
  }, [streamConfig]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateFormData(config)) {
      onStartMirroring(config);
    } else {
      alert('Please enter valid values for all fields.');
    }
  };

  const validateFormData = (data: StreamConfig): boolean => {
    return data.width > 0 && data.height > 0 &&
      data.offset_x >= 0 && data.offset_y >= 0 &&
      data.frame_rate >= 10 && data.frame_rate <= 1000 &&
      data.dpr >= 0.1 && data.dpr <= 4;
  };

  const toggleAdvanced = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setAdvancedExpanded(!advancedExpanded);
  };

  const handleInputChange = (field: keyof StreamConfig, value: number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="popup-view">
      <h2>Oversized Monitor Guru</h2>

      <form id="streamForm" onSubmit={handleSubmit}>
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
            value={config.offset_x}
            onChange={(e) => handleInputChange('offset_x', parseInt(e.target.value) || 0)}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="offset-y">Offset from Top (px)</label>
          <input
            type="number"
            id="offset-y"
            value={config.offset_y}
            onChange={(e) => handleInputChange('offset_y', parseInt(e.target.value) || 0)}
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
                value={config.frame_rate}
                onChange={(e) => handleInputChange('frame_rate', parseInt(e.target.value) || 0)}
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

export default PopupView;

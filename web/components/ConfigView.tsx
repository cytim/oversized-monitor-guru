import { useState, FormEvent, useEffect } from 'react';
import { InputConfig } from '../types';
import { useInputConfig } from '../contexts/InputConfigContext';
import './ConfigView.css';

interface ConfigViewProps {
  onStartMirroring: () => void;
}

function ConfigView({ onStartMirroring }: ConfigViewProps) {
  const { inputConfig, updateInputConfig } = useInputConfig();
  const [config, setConfig] = useState<InputConfig>(inputConfig);
  const [advancedExpanded, setAdvancedExpanded] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<Record<keyof InputConfig, string>>>({});

  useEffect(() => {
    if (!config.syncWindowDimensions) return;

    // Since window position changes don't trigger native events, polling is required to detect updates.
    const intervalId = setInterval(() => {
      const newWidth = window.outerWidth;
      const newHeight = window.outerHeight;
      const newX = window.screenX;
      const newY = window.screenY;

      // Only update state if values changed to avoid unnecessary re-renders
      if (newWidth !== config.width || newHeight !== config.height ||
        newX !== config.offsetX || newY !== config.offsetY) {
        setConfig(prev => ({
          ...prev,
          width: newWidth,
          height: newHeight,
          offsetX: newX,
          offsetY: newY
        }));
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [config.syncWindowDimensions, config.width, config.height, config.offsetX, config.offsetY]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = updateInputConfig(config);
    if (result.valid) {
      setErrors({});
      onStartMirroring();
    } else {
      const errorDict: Partial<Record<keyof InputConfig, string>> = {};
      result.errors.forEach(err => {
        errorDict[err.field] = err.message;
      });
      setErrors(errorDict);
    }
  };

  const toggleAdvanced = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setAdvancedExpanded(!advancedExpanded);
  };

  const handleInputChange = (field: keyof InputConfig, value: number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return (
    <div className="config-view">
      <h2>Oversized Monitor Guru</h2>

      <form id="inputForm" onSubmit={handleSubmit}>
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={config.syncWindowDimensions}
              onChange={(e) => handleInputChange('syncWindowDimensions', e.target.checked)}
            />
            Sync with window's dimensions
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="width">Width (px)</label>
          <input
            type="number"
            id="width"
            value={config.width}
            onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 0)}
            min="1"
            required
            disabled={config.syncWindowDimensions}
          />
          {errors.width && <div className="field-error">{errors.width}</div>}
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
            disabled={config.syncWindowDimensions}
          />
          {errors.height && <div className="field-error">{errors.height}</div>}
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
            disabled={config.syncWindowDimensions}
          />
          {errors.offsetX && <div className="field-error">{errors.offsetX}</div>}
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
            disabled={config.syncWindowDimensions}
          />
          {errors.offsetY && <div className="field-error">{errors.offsetY}</div>}
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
              {errors.frameRate && <div className="field-error">{errors.frameRate}</div>}
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
              {errors.dpr && <div className="field-error">{errors.dpr}</div>}
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

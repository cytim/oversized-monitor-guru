import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InputConfig } from '../types';

const DEFAULT_INPUT_CONFIG: InputConfig = {
  syncWindowDimensions: true,
  width: Math.floor(window.screen.width / 2),
  height: window.screen.height,
  offsetX: 0,
  offsetY: 0,
  frameRate: 30,
  dpr: Math.round((window.devicePixelRatio || 1.0) * 100) / 100
};

export interface ValidationError {
  field: keyof InputConfig;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface InputConfigContextType {
  inputConfig: InputConfig;
  updateInputConfig: (config: InputConfig) => ValidationResult;
}

const InputConfigContext = createContext<InputConfigContextType | undefined>(undefined);

interface InputConfigProviderProps {
  children: ReactNode;
}

export function InputConfigProvider({ children }: InputConfigProviderProps) {
  const [inputConfig, setInputConfig] = useState<InputConfig>(() => {
    const savedConfig = localStorage.getItem('inputConfig');
    return savedConfig ? JSON.parse(savedConfig) : DEFAULT_INPUT_CONFIG;
  });

  const updateInputConfig = (config: InputConfig): ValidationResult => {
    const errors: ValidationError[] = [];

    if (config.width <= 0) {
      errors.push({ field: 'width', message: 'Width must be greater than 0' });
    }

    if (config.height <= 0) {
      errors.push({ field: 'height', message: 'Height must be greater than 0' });
    }

    if (config.offsetX < 0) {
      errors.push({ field: 'offsetX', message: 'Offset X must be 0 or greater' });
    }

    if (config.offsetY < 0) {
      errors.push({ field: 'offsetY', message: 'Offset Y must be 0 or greater' });
    }

    if (config.frameRate < 10 || config.frameRate > 1000) {
      errors.push({ field: 'frameRate', message: 'Frame rate must be between 10 and 1000' });
    }

    if (config.dpr < 0.1 || config.dpr > 4) {
      errors.push({ field: 'dpr', message: 'Device pixel ratio must be between 0.1 and 4' });
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    setInputConfig(config);
    localStorage.setItem('inputConfig', JSON.stringify(config));
    return { valid: true, errors: [] };
  };

  return (
    <InputConfigContext.Provider value={{ inputConfig, updateInputConfig }}>
      {children}
    </InputConfigContext.Provider>
  );
}

export function useInputConfig() {
  const context = useContext(InputConfigContext);
  if (context === undefined) {
    throw new Error('useInputConfig must be used within an InputConfigProvider');
  }
  return context;
}

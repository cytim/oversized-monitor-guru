export interface InputConfig {
  syncWindowDimensions: boolean;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  frameRate: number;
  dpr: number;
}

export interface StreamConfig {
  srcX: number;
  srcY: number;
  srcWidth: number;
  srcHeight: number;
  destWidth: number;
  destHeight: number;
}

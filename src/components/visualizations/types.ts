export interface VisualizationContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  dataArray: Uint8Array;
  bufferLength: number;
  intensity: number;
  baseHue: number;
  centerX: number;
  centerY: number;
  radius: number;
}

export interface Visualization {
  draw: (context: VisualizationContext) => void;
}

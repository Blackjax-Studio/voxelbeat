import { Visualization, VisualizationContext } from './types';

export const NebulaVisualization: Visualization = {
  draw: ({ ctx, dataArray, baseHue, centerX, centerY, radius }: VisualizationContext) => {
    const hueShift = (ctx as any).__hueShift || 0;

    for (let i = 0; i < 6; i++) {
      const value = dataArray[i * 8];
      const hue = (baseHue + i * 45) % 360;
      const r = radius * (1.2 + (value / 255) * 0.8 + Math.sin(hueShift * 0.015 + i * 1.2) * 0.4);
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${0.08 + (value / 255) * 0.35})`;
      ctx.lineWidth = 1.5 + (value / 255) * 3;
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.4)`;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, r, r * (0.5 + i * 0.05), hueShift * 0.008 + i * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      for (let d = 0; d < 3; d++) {
        const dotAngle = hueShift * 0.018 + i + d * 2.1;
        const dx = centerX + Math.cos(dotAngle) * r;
        const dy = centerY + Math.sin(dotAngle) * r * (0.5 + i * 0.05);
        ctx.fillStyle = `hsla(${hue}, 100%, 85%, ${0.4 + (value / 255) * 0.6})`;
        ctx.shadowColor = `hsla(${hue}, 100%, 80%, 0.8)`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(dx, dy, 1.5 + (value / 255) * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;
  }
};

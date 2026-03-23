import { Visualization, VisualizationContext } from './types';

export const CircularVisualization: Visualization = {
  draw: ({ ctx, dataArray, bufferLength, baseHue, centerX, centerY, radius }: VisualizationContext) => {
    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i];
      const angle = (i / bufferLength) * Math.PI * 2 - Math.PI / 2;
      const barHeight = (value / 255) * radius * 1.1;
      const hue = (baseHue + (i / bufferLength) * 120) % 360;
      const x1 = centerX + Math.cos(angle) * (radius + 10);
      const y1 = centerY + Math.sin(angle) * (radius + 10);
      const x2 = centerX + Math.cos(angle) * (radius + 10 + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + 10 + barHeight);
      const intensity = value / 255;
      ctx.strokeStyle = `hsla(${hue}, 100%, ${50 + intensity * 30}%, ${0.4 + intensity * 0.6})`;
      ctx.lineWidth = 2.5 + intensity * 6;
      ctx.lineCap = "round";
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.8)`;
      ctx.shadowBlur = 8 + intensity * 15;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Core ring
    ctx.strokeStyle = `hsla(${baseHue}, 100%, 70%, ${0.15 + 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = `hsla(${baseHue}, 100%, 70%, 0.5)`;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Pulsing core
    const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.5);
    coreGrad.addColorStop(0, `hsla(${(baseHue + 30) % 360}, 100%, 80%, 0.15)`);
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
};

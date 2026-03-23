import { Visualization, VisualizationContext } from './types';

export const BarsVisualization: Visualization = {
  draw: ({ canvas, ctx, dataArray, bufferLength, baseHue }: VisualizationContext) => {
    const barCount = bufferLength / 2;
    const barWidth = (canvas.width / barCount) * 1.5;
    const gap = (canvas.width - barCount * barWidth) / barCount;

    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i];
      const barHeight = (value / 255) * canvas.height * 0.65;
      const hue = (baseHue + (i / barCount) * 180) % 360;
      const x = i * (barWidth + gap);
      const intensity = value / 255;

      ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.6)`;
      ctx.shadowBlur = 12 + intensity * 20;

      const grad = ctx.createLinearGradient(x, canvas.height, x, canvas.height - barHeight);
      grad.addColorStop(0, `hsla(${hue}, 100%, 40%, 0.9)`);
      grad.addColorStop(0.5, `hsla(${(hue + 20) % 360}, 100%, 60%, 0.8)`);
      grad.addColorStop(1, `hsla(${(hue + 40) % 360}, 100%, 80%, 0.1)`);

      ctx.fillStyle = grad;
      const bw = Math.max(barWidth - 1, 1);
      const br = Math.min(bw / 2, 4);
      const bx = x + (barWidth - bw) / 2;
      const by = canvas.height - barHeight;

      ctx.beginPath();
      ctx.moveTo(bx + br, by);
      ctx.lineTo(bx + bw - br, by);
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
      ctx.lineTo(bx + bw, canvas.height);
      ctx.lineTo(bx, canvas.height);
      ctx.lineTo(bx, by + br);
      ctx.quadraticCurveTo(bx, by, bx + br, by);
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
};

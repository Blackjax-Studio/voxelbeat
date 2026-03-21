import { Visualization, VisualizationContext } from './types';

export const WaveformVisualization: Visualization = {
  draw: ({ canvas, ctx, bufferLength, baseHue, intensity }: VisualizationContext) => {
    const timeData = new Uint8Array(bufferLength);
    const analyser = (ctx as any).__analyser;
    if (!analyser) return;

    analyser.getByteTimeDomainData(timeData);
    const sliceWidth = canvas.width / bufferLength;

    for (let layer = 0; layer < 3; layer++) {
      const offset = (layer - 1) * 30;
      const alpha = layer === 1 ? 0.9 : 0.25;
      const hue = (baseHue + layer * 40) % 360;

      ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${alpha})`;
      ctx.lineWidth = layer === 1 ? 3 : 1.5;
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.6)`;
      ctx.shadowBlur = layer === 1 ? 20 : 5;
      ctx.beginPath();

      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = (v * canvas.height / 2) + offset;
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * sliceWidth, y);
      }
      ctx.stroke();

      // Reflection
      ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${alpha * 0.3})`;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = canvas.height - (v * canvas.height / 2) - offset;
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * sliceWidth, y);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }
};

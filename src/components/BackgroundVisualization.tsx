"use client";

import { useRef, useEffect } from "react";
import { VisStyle } from "@/types/visualizer";
import {
    CircularVisualization,
    BarsVisualization,
    WaveformVisualization,
    NebulaVisualization,
    Visualization
} from "./visualizations";

const visualizations: Record<VisStyle, Visualization> = {
    Circular: CircularVisualization,
    Bars: BarsVisualization,
    Waveform: WaveformVisualization,
    Nebula: NebulaVisualization,
};

interface BackgroundVisualizationProps {
    analyser: AnalyserNode | null;
    visStyle: VisStyle;
}

export default function BackgroundVisualization({ analyser, visStyle }: BackgroundVisualizationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const particlesRef = useRef<any[]>([]);
    const hueShiftRef = useRef(0);

    useEffect(() => {
        if (!analyser || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particlesRef.current = Array.from({ length: 200 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2.5 + 0.5,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.4,
                hue: 200 + Math.random() * 160,
                opacity: 0.05 + Math.random() * 0.3,
                pulse: Math.random() * Math.PI * 2,
            }));
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            const centerX = canvas.width / 2;
            const centerY = canvas.height * 0.58;
            const radius = Math.min(canvas.width, canvas.height) * 0.28;

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const intensity = sum / (bufferLength * 255);

            hueShiftRef.current += 0.3 + intensity * 1.5;
            const baseHue = hueShiftRef.current % 360;

            // Deep fade
            ctx.fillStyle = `rgba(0, 0, 0, ${0.15 + intensity * 0.1})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Ambient glow at center
            const ambient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.height * 0.7);
            ambient.addColorStop(0, `hsla(${baseHue}, 80%, 20%, ${0.04 + intensity * 0.08})`);
            ambient.addColorStop(1, 'transparent');
            ctx.fillStyle = ambient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Particles
            for (const p of particlesRef.current) {
                p.x += p.speedX + (intensity * (Math.random() - 0.5) * 2);
                p.y += p.speedY + (intensity * (Math.random() - 0.5) * 2);
                p.pulse += 0.02;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                const pSize = p.size * (1 + intensity * 2 + Math.sin(p.pulse) * 0.3);
                ctx.fillStyle = `hsla(${(p.hue + baseHue * 0.3) % 360}, 90%, 70%, ${p.opacity * (0.5 + intensity)})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, pSize, 0, Math.PI * 2);
                ctx.fill();
            }

            // Store references for visualizations that need them
            (ctx as any).__analyser = analyser;
            (ctx as any).__hueShift = hueShiftRef.current;

            // Draw current visualization
            const currentVis = visualizations[visStyle];
            if (currentVis) {
                currentVis.draw({
                    canvas,
                    ctx,
                    dataArray,
                    bufferLength,
                    intensity,
                    baseHue,
                    centerX,
                    centerY,
                    radius
                });
            }
        };

        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [analyser, visStyle]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
            <canvas ref={canvasRef} className="absolute inset-0" />
            <div 
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at center 58%, transparent 30%, rgba(0,0,0,0.75) 100%)' }} 
            />
        </div>
    );
}

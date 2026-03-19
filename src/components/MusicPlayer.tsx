"use client";

import { useRef, useState, useEffect, useCallback } from "react";

import { VisStyle } from "@/app/page";

interface Track {
  name: string;
  src: string;
}

interface MusicPlayerProps {
  tracks: Track[];
  visStyle: VisStyle;
  setVisStyle: (style: VisStyle) => void;
  hasManuallySelectedVis: boolean;
  setHasManuallySelectedVis: (hasSelected: boolean) => void;
}

export default function MusicPlayer({
  tracks,
  visStyle,
  setVisStyle,
  hasManuallySelectedVis,
  setHasManuallySelectedVis
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<any[]>([]);
  const hueShiftRef = useRef(0);

  const setupAudio = useCallback(() => {
    if (!audioRef.current || audioContext) return;
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = context.createMediaElementSource(audioRef.current);
    const analyserNode = context.createAnalyser();

    analyserNode.fftSize = 512;
    source.connect(analyserNode);
    analyserNode.connect(context.destination);

    setAudioContext(context);
    setAnalyser(analyserNode);
  }, [audioContext]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setupAudio();
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          if (err.name !== 'NotAllowedError') {
            console.error("[DEBUG_LOG] Playback failed:", err);
          }
          setIsPlaying(false);
        });
    }
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
  };

  const prevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIndex);
  };

  useEffect(() => {
    // Attempt auto-play on mount
    const handleFirstInteraction = () => {
      if (!isPlaying) {
        setIsPlaying(true);
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      setupAudio();
      audioRef.current.play()
        .catch(err => {
          // Suppress NotAllowedError (expected on autoplay block)
          if (err.name === 'NotAllowedError') {
             // console.log("[DEBUG_LOG] Autoplay blocked by browser. User interaction required.");
          } else {
             console.error("[DEBUG_LOG] Autoplay/Skip failed:", err);
          }
          setIsPlaying(false);
        });
    }
  }, [currentTrackIndex, isPlaying, setupAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const duration = audio.duration;
        if (duration > 0) {
          setLoadProgress((bufferedEnd / duration) * 100);
        }
      }
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleCanPlay = () => setIsBuffering(false);
    const handleError = (e: any) => {
        console.error("[DEBUG_LOG] Audio element error:", audio.error);
        setIsBuffering(false);
    };

    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    setLoadProgress(0);
    setIsBuffering(false);

    // Randomize visualization on track skip if not manually selected
    if (!hasManuallySelectedVis) {
      const styles: ('Circular' | 'Bars' | 'Waveform' | 'Nebula')[] = ['Circular', 'Bars', 'Waveform', 'Nebula'];
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      setVisStyle(randomStyle);
    }
  }, [currentTrackIndex, hasManuallySelectedVis]);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const resizeCanvas = () => {
      if (containerRef.current) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Initialize persistent particles
        particlesRef.current = Array.from({ length: 150 }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          hue: 250 + Math.random() * 100,
          opacity: 0.1 + Math.random() * 0.5
        }));
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Shift base hue over time
      hueShiftRef.current = (hueShiftRef.current + 0.5) % 360;
      const baseHue = (260 + hueShiftRef.current) % 360;

      // Create trailing effect for background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.2;

      const avg = dataArray.reduce((a, b) => a + b) / bufferLength;
      const intensity = avg / 255;

      // Common: Update and draw persistent particles
      particlesRef.current.forEach(p => {
        const pIntensity = intensity * 2;
        p.x += p.speedX * (1 + pIntensity * 10);
        p.y += p.speedY * (1 + pIntensity * 10);

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const pulseSize = p.size * (1 + pIntensity * 3);
        const pHue = (p.hue + hueShiftRef.current) % 360;
        ctx.fillStyle = `hsla(${pHue}, 100%, 70%, ${p.opacity + pIntensity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        if (intensity > 0.5 && visStyle === 'Circular') {
            ctx.strokeStyle = `hsla(${pHue}, 100%, 70%, ${(intensity - 0.5) * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(centerX, centerY);
            ctx.stroke();
        }
      });

      // Ambient Background Pulse
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width * 0.7);
      bgGradient.addColorStop(0, `hsla(${baseHue}, 80%, 20%, ${0.1 + intensity * 0.3})`);
      bgGradient.addColorStop(0.6, `hsla(${(baseHue + 20) % 360}, 80%, 10%, ${0.05 + intensity * 0.1})`);
      bgGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (visStyle === 'Circular') {
        // Draw bars in a circle
        const barCount = 120;
        for (let i = 0; i < barCount; i++) {
          const angle = (i / barCount) * Math.PI * 2;
          const dataIndex = Math.floor((i / barCount) * (bufferLength / 2));
          const value = dataArray[dataIndex];
          const barHeight = (value / 255) * radius * 2.5;

          const x1 = centerX + Math.cos(angle) * (radius + (intensity * 20));
          const y1 = centerY + Math.sin(angle) * (radius + (intensity * 20));
          const x2 = centerX + Math.cos(angle) * (radius + barHeight + 20);
          const y2 = centerY + Math.sin(angle) * (radius + barHeight + 20);

          const hue = (baseHue + (i / barCount) * 100) % 360;
          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.9)`);
          gradient.addColorStop(0.5, `hsla(${(hue + 40) % 360}, 100%, 60%, 0.4)`);
          gradient.addColorStop(1, `hsla(${(hue + 80) % 360}, 100%, 50%, 0)`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 4 + (intensity * 10);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          const innerBarHeight = (value / 255) * radius * 0.5;
          ctx.strokeStyle = `hsla(${(hue - 60 + 360) % 360}, 100%, 80%, 0.3)`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(centerX + Math.cos(angle) * (radius - 5), centerY + Math.sin(angle) * (radius - 5));
          ctx.lineTo(centerX + Math.cos(angle) * (radius - 5 - innerBarHeight), centerY + Math.sin(angle) * (radius - 5 - innerBarHeight));
          ctx.stroke();
        }

        const coreRadius = radius * (1 + intensity * 0.2);
        const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
        coreGradient.addColorStop(0, `hsla(${(baseHue + 20) % 360}, 100%, 70%, ${0.2 + intensity * 0.5})`);
        coreGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
        ctx.fill();
      } else if (visStyle === 'Bars') {
        const barWidth = (canvas.width / (bufferLength / 2)) * 2;
        let x = 0;
        for (let i = 0; i < bufferLength / 2; i++) {
          const value = dataArray[i];
          const barHeight = (value / 255) * canvas.height * 0.6;
          const hue = (baseHue + (i / bufferLength) * 360) % 360;

          const gradient = ctx.createLinearGradient(x, canvas.height, x, canvas.height - barHeight);
          gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.8)`);
          gradient.addColorStop(1, `hsla(${(hue + 40) % 360}, 100%, 70%, 0)`);

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }
      } else if (visStyle === 'Waveform') {
        const timeData = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(timeData);

        ctx.lineWidth = 3;
        ctx.strokeStyle = `hsla(${baseHue}, 100%, 70%, 0.8)`;
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * canvas.height / 2);

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }

        ctx.stroke();

        // Add a secondary reflected waveform
        ctx.strokeStyle = `hsla(${(baseHue + 180) % 360}, 100%, 70%, 0.3)`;
        ctx.beginPath();
        x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = timeData[i] / 128.0;
            const y = canvas.height - (v * canvas.height / 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
        }
        ctx.stroke();
      } else if (visStyle === 'Nebula') {
          // Nebula uses particles mostly, but lets add some flowy orbits
          ctx.lineWidth = 2;
          for (let i = 0; i < 5; i++) {
              const value = dataArray[i * 10];
              const hue = (baseHue + i * 30) % 360;
              const r = radius * (1.5 + value / 255 + Math.sin(hueShiftRef.current * 0.02 + i) * 0.5);

              ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${0.1 + (value / 255) * 0.4})`;
              ctx.beginPath();
              ctx.ellipse(centerX, centerY, r, r * 0.6, hueShiftRef.current * 0.01 + i, 0, Math.PI * 2);
              ctx.stroke();

              // Small dots on the orbit
              const dotAngle = hueShiftRef.current * 0.02 + i;
              const dx = centerX + Math.cos(dotAngle) * r;
              const dy = centerY + Math.sin(dotAngle) * r * 0.6;
              ctx.fillStyle = `hsla(${hue}, 100%, 80%, ${0.5 + (value / 255) * 0.5})`;
              ctx.beginPath();
              ctx.arc(dx, dy, 2 + (value/255) * 4, 0, Math.PI * 2);
              ctx.fill();
          }
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
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      <div className="relative z-10 w-[95%] max-w-lg p-6 md:p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center gap-6 md:gap-8">
        {/* Profile Head */}
        <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 p-1 animate-pulse">
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                    <span className="text-3xl md:text-4xl font-black text-white italic">NBK</span>
                </div>
            </div>
            <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-500 border-4 border-zinc-900 shadow-lg"></div>
        </div>

        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                NBK Productions
            </h1>
            <div className="flex items-center justify-center gap-2">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">In the Studio</span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                <span className="text-sm font-medium text-zinc-400">@nbk_coolsnip</span>
            </div>
        </div>

        <div className="w-full space-y-6">
            <div className="space-y-1 text-center">
                <p className="text-[10px] md:text-xs font-bold text-purple-400 uppercase tracking-[0.2em]">Now Playing</p>
                <h2 className="text-lg md:text-xl font-medium text-white truncate px-4">{tracks[currentTrackIndex].name}</h2>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-center gap-6 md:gap-8">
                    <div className="w-10"></div>
                    <button onClick={prevTrack} className="text-zinc-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
                    </button>
                    <button
                        onClick={togglePlay}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)] relative"
                    >
                        {isBuffering && (
                            <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                        )}
                        {isPlaying ? (
                            <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        ) : (
                            <svg className="w-8 h-8 md:w-10 md:h-10 translate-l-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        )}
                    </button>
                    <button onClick={nextTrack} className="text-zinc-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                    </button>
                    <div className="w-10"></div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-purple-500 transition-all duration-300 ease-out"
                        style={{ width: `${loadProgress}%` }}
                    />
                </div>
                <div className="flex justify-between">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Loading</span>
                    <span className="text-[10px] text-zinc-500 font-bold">{Math.round(loadProgress)}%</span>
                </div>
            </div>

            <div className="flex justify-center gap-4 pt-4 border-t border-white/5">
                {['Spotify', 'SoundCloud', 'Discord', 'Insta'].map(social => (
                    <span key={social} className="text-[10px] font-bold text-zinc-500 uppercase cursor-pointer hover:text-purple-400 transition-colors">{social}</span>
                ))}
            </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={tracks[currentTrackIndex].src}
        onEnded={nextTrack}
        crossOrigin="anonymous"
      />
    </div>
  );
}

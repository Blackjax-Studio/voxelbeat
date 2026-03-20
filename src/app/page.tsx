"use client";

import { useState } from "react";
import MusicPlayer from "@/components/MusicPlayer";
import Header from "@/components/Header";

export type VisStyle = 'Circular' | 'Bars' | 'Waveform' | 'Nebula';

export default function Home() {
  const tracks = [
    { name: "Coming soon to Video and DVD Demo", src: "/song-1.mp3" },
    { name: "Sunrise Fields Anthem", src: "/Sunrise Fields Anthem.mp3" },
    { name: "Country EDM Instrumental V1", src: "/Country EDM Instrumental V1.mp3" },
    { name: "R&B Beat", src: "/RnB Beat.mp3" },
  ];

  const [visStyle, setVisStyle] = useState<VisStyle>('Circular');
  const [hasManuallySelectedVis, setHasManuallySelectedVis] = useState(false);

  return (
    <main className="h-screen w-full overflow-hidden bg-black flex flex-col">
      <Header 
        visStyle={visStyle} 
        setVisStyle={setVisStyle}
        hasManuallySelectedVis={hasManuallySelectedVis}
        setHasManuallySelectedVis={setHasManuallySelectedVis}
      />
      <div className="flex-1 flex items-center justify-center">
        <MusicPlayer 
          tracks={tracks} 
          visStyle={visStyle}
          setVisStyle={setVisStyle}
          hasManuallySelectedVis={hasManuallySelectedVis}
          setHasManuallySelectedVis={setHasManuallySelectedVis}
        />
      </div>
    </main>
  );
}

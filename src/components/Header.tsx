"use client";

import { useState } from "react";
import MultiSelect from "./MultiSelect";
import { VisStyle } from "@/app/page";

interface HeaderProps {
  visStyle: VisStyle;
  setVisStyle: (style: VisStyle) => void;
  hasManuallySelectedVis: boolean;
  setHasManuallySelectedVis: (hasSelected: boolean) => void;
}

export default function Header({
  visStyle,
  setVisStyle,
  hasManuallySelectedVis,
  setHasManuallySelectedVis
}: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleVisStyle = () => {
    const styles: VisStyle[] = ['Circular', 'Bars', 'Waveform', 'Nebula'];
    const currentIndex = styles.indexOf(visStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    setVisStyle(styles[nextIndex]);
    setHasManuallySelectedVis(true);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-white/5">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white italic">
            IndieGameMusic
          </h1>
        </div>

        {/* Desktop Search & Filter */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search music..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
            />
          </div>

          <MultiSelect
            selected={selectedGenres}
            onChange={setSelectedGenres}
          />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Visualization Toggle (Visible on Mobile Too) */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleVisStyle}
              className={`p-2 transition-colors flex flex-col items-center gap-0.5 min-w-[56px] md:min-w-[64px] rounded-lg hover:bg-white/5 ${hasManuallySelectedVis ? 'text-purple-400' : 'text-zinc-500 hover:text-purple-400'}`}
              title="Change Visualization"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-[8px] font-bold uppercase tracking-tight leading-none">{visStyle}</span>
            </button>
            {hasManuallySelectedVis && (
              <button
                onClick={() => setHasManuallySelectedVis(false)}
                className="hidden md:block text-[7px] font-black text-zinc-600 hover:text-zinc-400 uppercase tracking-tighter transition-colors bg-white/5 px-1 py-0.5 rounded"
                title="Restore Auto-Shuffle"
              >
                Auto
              </button>
            )}
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 cursor-pointer" />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 space-y-4 border-t border-white/10 bg-black/60 backdrop-blur-xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-3">
            <div className="relative w-full">
              <input
                type="text"
                autoFocus
                placeholder="Search music..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <MultiSelect
              selected={selectedGenres}
              onChange={setSelectedGenres}
            />
            {hasManuallySelectedVis && (
              <button
                onClick={() => setHasManuallySelectedVis(false)}
                className="text-[9px] font-black text-zinc-500 hover:text-zinc-400 uppercase tracking-tighter transition-colors bg-white/5 px-2 py-1 rounded-lg flex items-center gap-1"
              >
                <span>Auto-Shuffle: ON</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";

const ALL_GENRES = [
  "Action", "Adventure", "Arcade", "Bullet Hell", "Casual", "Cyberpunk",
  "Dungeon Crawler", "Fighting", "Fantasy", "Horror", "Metroidvania",
  "Open World", "Platformer", "Puzzle", "Racing", "Roguelike", "RPG",
  "Sandbox", "Simulation", "Sports", "Stealth", "Strategy", "Survival",
  "Synthwave", "Visual Novel"
];

interface MultiSelectProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function MultiSelect({ selected, onChange }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGenre = (genre: string) => {
    if (selected.includes(genre)) {
      onChange(selected.filter(g => g !== genre));
    } else {
      onChange([...selected, genre]);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-40 md:w-48 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer transition-all hover:bg-white/15"
      >
        <span className="truncate">
          {selected.length === 0 ? "All Genres" : `${selected.length} Selected`}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-64 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 py-2 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
          <div className="px-2 pb-2 mb-2 border-b border-white/5">
             <button
               onClick={() => onChange([])}
               className="w-full text-left px-3 py-1 text-xs font-bold text-zinc-500 uppercase hover:text-white transition-colors"
             >
               Clear All
             </button>
          </div>
          {ALL_GENRES.map((genre) => (
            <div
              key={genre}
              onClick={() => toggleGenre(genre)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors group"
            >
              <div className={`w-4 h-4 rounded border border-white/20 flex items-center justify-center transition-all ${
                selected.includes(genre) ? "bg-purple-500 border-purple-500" : "group-hover:border-white/40"
              }`}>
                {selected.includes(genre) && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${selected.includes(genre) ? "text-white font-medium" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                {genre}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

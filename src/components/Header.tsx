"use client";

import { useState, useEffect, useRef } from "react";
import AuthButton from "./AuthButton";

interface HeaderProps {
  onAccountClick?: () => void;
  onTagsChange?: (hasTags: boolean) => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
  onOpenSignup?: () => void;
  onSearch?: (searchQuery: string, selectedTags: string[]) => void;
}

export default function Header({ onAccountClick, onTagsChange, onOpenTerms, onOpenPrivacy, onOpenSignup, onSearch }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [pendingTags, setPendingTags] = useState<string[]>([]);
  const isInitialMount = useRef(true);
  const tagDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  const tagCategories = {
    "Genre": [
      "RPG", "FPS", "Horror", "Action", "Adventure", "Platformer", "Simulation", "Strategy", "Racing", "Puzzle", "Fighting", "Roguelike", "Metroidvania", "Visual Novel", "Survival", "Bullet Hell", "Tower Defense", "Stealth", "Music/Rhythm", "Party", "Sandbox", "Open World", "Soulslike"
    ],
    "Style": [
      "Retro", "Chiptune", "8-bit", "16-bit", "Orchestral", "Electronic", "Ambient", "Cinematic", "Lo-fi", "Synthwave", "Industrial", "Experimental", "Minimalist", "Jazz", "Heavy Metal", "Gothic", "Folk", "Classical", "Vaporwave", "Phonk", "Glitch", "Acid", "Trance"
    ],
    "Theme": [
      "Cyberpunk", "Fantasy", "Sci-Fi", "Medieval", "Noir", "Space", "Nature", "Urban", "Western", "Steampunk", "Post-Apocalyptic", "High-Fantasy", "Dark-Fantasy", "Lovecraftian", "Oceanic", "Arctic", "Desert", "Oriental", "Greek Mythology", "Egyptian", "Viking", "Dystopian", "Utopian"
    ],
    "Vibe": [
      "Boss Fight", "Dungeon", "Menu", "Combat", "Exploration", "Chill", "Suspense", "Victory", "Defeat", "Title Theme", "Final Boss", "Town", "Overworld", "Credits", "Level Select", "Shop", "Dialogue", "Cutscene", "Puzzle Solved", "Game Over", "Intense", "Eerie", "Heroic", "Melancholy", "Mysterious"
    ]
  };

  const toggleTag = (tag: string) => {
    const newTags = pendingTags.includes(tag)
      ? pendingTags.filter(t => t !== tag)
      : [...pendingTags, tag];
    setPendingTags(newTags);

    // Debounce the actual tag selection
    if (tagDebounceTimer.current) {
      clearTimeout(tagDebounceTimer.current);
    }

    tagDebounceTimer.current = setTimeout(() => {
      setSelectedTags(newTags);
    }, 800); // 800ms debounce for tags (a bit longer since users might click multiple)
  };

  const clearTags = () => {
    if (tagDebounceTimer.current) {
      clearTimeout(tagDebounceTimer.current);
    }
    setPendingTags([]);
    setSelectedTags([]);
  };

  // Debounced search effect
  useEffect(() => {
    // Skip search on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm, selectedTags);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, selectedTags, onSearch]);

  useEffect(() => {
    if (onTagsChange) {
      onTagsChange(selectedTags.length > 0);
    }
  }, [onTagsChange, selectedTags.length]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-white/5">
      <div className="px-3 xs:px-6 py-3 sm:pb-4">
        {/* Top row - Logo and buttons */}
        <div className="flex items-center justify-between mb-3 sm:mb-2 sm:grid sm:grid-cols-3">
          <div className="flex items-center gap-2 xs:gap-3">
            <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-lg">
              <img src="/lumi-logo-2.png" alt="VoxelBeat Logo - Indie Game Music Platform" title="VoxelBeat Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-0">
              <h1 className="text-lg xs:text-xl sm:text-2xl font-['Anton'] tracking-tight text-white leading-tight">
                VoxelBeat
              </h1>
              <p className="text-[8px] xs:text-[10px] sm:text-xs font-bold text-white/50 tracking-wider uppercase leading-none">
                Indie Game Musicians
              </p>
            </div>
          </div>

          {/* Desktop Search - Centered */}
          <div className="hidden sm:flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Try 'chilly, mysterious lo-fi' or 'epic boss fight'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 xs:gap-4 justify-end">
            <AuthButton
              onAccountClick={onAccountClick}
              onOpenSignup={onOpenSignup}
            />
          </div>
        </div>

        {/* Tags Selection - Dropdown approach */}
        <div className="relative flex items-center gap-2 xs:justify-center">
          <button
            onClick={() => setIsTagsDropdownOpen(!isTagsDropdownOpen)}
            className={`flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-1 xs:py-1.5 rounded-full text-[9px] xs:text-xs font-bold uppercase tracking-wider transition-all border
              ${pendingTags.length > 0
                ? 'bg-white text-black border-white'
                : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white/70 hover:border-white/20'}`}
          >
            <span>Tags {pendingTags.length > 0 && `(${pendingTags.length})`}</span>
            <svg className={`w-3 h-3 transition-transform ${isTagsDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {pendingTags.length > 0 && (
            <button
              onClick={clearTags}
              className="text-[8px] xs:text-[9px] font-black text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors"
            >
              Clear
            </button>
          )}

          {/* Large Dropdown Menu */}
          {isTagsDropdownOpen && (
            <div className="absolute top-full left-0 xs:left-1/2 xs:-translate-x-1/2 mt-2 w-[calc(100vw-1.5rem)] xs:w-[calc(100vw-2rem)] sm:w-[700px] max-h-[75vh] overflow-y-auto z-[60] p-4 xs:p-6 rounded-2xl xs:rounded-3xl animate-fadeIn custom-scrollbar bg-zinc-900"
                 style={{
                   border: '1px solid rgba(255,255,255,0.1)',
                   boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                 }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 xs:gap-6">
                {Object.entries(tagCategories).map(([category, tags]) => (
                  <div key={category} className="flex flex-col gap-2 xs:gap-3">
                    <h3 className="text-[9px] xs:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/5 pb-1">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-1 xs:gap-1.5">
                      {tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md text-[8px] xs:text-[9px] font-bold uppercase tracking-tight transition-all
                            ${pendingTags.includes(tag)
                              ? 'bg-violet-600 text-white'
                              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                            }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search - Bottom on mobile */}
        <div className="sm:hidden mt-2">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Try 'chilly, mysterious lo-fi'..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
            />
          </div>
        </div>
      </div>

    </header>
  );
}

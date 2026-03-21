"use client";

import { useState } from "react";
import AuthButton from "./AuthButton";
import { VisStyle } from "@/app/page";

interface HeaderProps {
  onAccountClick?: () => void;
}

export default function Header({ onAccountClick }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-white/5">
      <div className="px-4 md:px-6 py-3 md:py-4">
        {/* Top row - Logo and buttons */}
        <div className="flex items-center justify-between mb-3 md:mb-0 md:grid md:grid-cols-3">
          <div className="flex flex-col gap-0">
            <h1 className="text-xl md:text-2xl font-['Anton'] tracking-tight text-white leading-tight">
              VoxelBeat
            </h1>
            <p className="text-[10px] md:text-xs font-bold text-white/50 tracking-wider uppercase leading-none">
              Indie Game Musicians
            </p>
          </div>

          {/* Desktop Search - Centered */}
          <div className="hidden md:flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search music..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 justify-end">
            <AuthButton onAccountClick={onAccountClick} />
          </div>
        </div>

        {/* Mobile Search - Second row */}
        <div className="md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search music..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
            />
          </div>
        </div>
      </div>

    </header>
  );
}

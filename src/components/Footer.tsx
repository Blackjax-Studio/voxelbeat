"use client";

interface FooterProps {
  onTermsClick: () => void;
  onPrivacyClick: () => void;
  onContactClick: () => void;
}

export default function Footer({ onTermsClick, onPrivacyClick, onContactClick }: FooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-transparent backdrop-blur-md border-t border-white/5">
      <div className="px-4 py-3 flex items-center justify-center gap-4 md:gap-6 text-xs">
        <span className="text-white/40">© 2026 VoxelBeat</span>
        <span className="text-white/20">•</span>
        <button
          onClick={onTermsClick}
          className="text-white/50 hover:text-white/80 transition-colors"
        >
          Terms
        </button>
        <span className="text-white/20">•</span>
        <button
          onClick={onPrivacyClick}
          className="text-white/50 hover:text-white/80 transition-colors"
        >
          Privacy
        </button>
        <span className="text-white/20">•</span>
        <button
          onClick={onContactClick}
          className="text-white/50 hover:text-white/80 transition-colors"
        >
          Contact
        </button>
      </div>
    </footer>
  );
}

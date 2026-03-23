"use client";

interface FooterProps {
  onTermsClick: () => void;
  onPrivacyClick: () => void;
  onContactClick: () => void;
}

export default function Footer({ onTermsClick, onPrivacyClick, onContactClick }: FooterProps) {
  return (
    <footer className="w-full mt-auto py-8 border-t border-white/5 bg-transparent">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white/60 font-black tracking-widest uppercase">Blackjax, LLC</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-white/20">© 2026 VoxelBeat</span>
          <div className="flex items-center gap-4">
            <button
              onClick={onTermsClick}
              className="text-white/40 hover:text-white transition-colors"
            >
              Terms
            </button>
            <button
              onClick={onPrivacyClick}
              className="text-white/40 hover:text-white transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={onContactClick}
              className="text-white/40 hover:text-white transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

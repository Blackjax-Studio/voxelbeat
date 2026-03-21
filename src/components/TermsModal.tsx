"use client";

import { useEffect } from "react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06) inset',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110"
        >
          <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-6 py-8">
          <h1 className="text-3xl font-['Anton'] text-white mb-6">Terms of Service</h1>

          <div className="space-y-6 text-white/80 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using VoxelBeat, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Use License</h2>
              <p>Permission is granted to temporarily download one copy of the materials on VoxelBeat for personal, non-commercial transitory viewing only.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. User Content</h2>
              <p>Users retain all rights to the music they upload. By uploading content, you grant VoxelBeat a license to host, display, and distribute your content on the platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Prohibited Activities</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Uploading copyrighted material without permission</li>
                <li>Harassment or abuse of other users</li>
                <li>Attempting to compromise the security of the platform</li>
                <li>Using automated tools to scrape or download content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Account Termination</h2>
              <p>We reserve the right to terminate or suspend accounts that violate these terms without prior notice.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Disclaimer</h2>
              <p>The service is provided "as is" without any warranties, expressed or implied. VoxelBeat does not guarantee the accuracy or completeness of any content on the platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Users will be notified of significant changes.</p>
            </section>

            <p className="text-white/50 text-xs pt-6 border-t border-white/10">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

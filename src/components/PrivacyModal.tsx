"use client";

import { useEffect } from "react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
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
          <h1 className="text-3xl font-['Anton'] text-white mb-6">Privacy Policy</h1>

          <div className="space-y-6 text-white/80 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
              <p className="mb-2">We collect information that you provide directly to us:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information (email, profile details)</li>
                <li>Music files and associated metadata</li>
                <li>Usage data and analytics</li>
                <li>Communications with us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
              <p className="mb-2">Your information is used to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and improve our services</li>
                <li>Communicate with you about your account</li>
                <li>Personalize your experience</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Information Sharing</h2>
              <p>We do not sell your personal information. We may share information with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Service providers who assist in platform operations</li>
                <li>Law enforcement when required by law</li>
                <li>Other users (only publicly shared content)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Data Security</h2>
              <p>We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Your Rights</h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies to improve your experience, analyze usage, and deliver personalized content.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Children's Privacy</h2>
              <p>Our service is not intended for users under 13 years of age. We do not knowingly collect information from children.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Changes to Privacy Policy</h2>
              <p>We may update this policy periodically. Significant changes will be communicated via email or platform notification.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">9. Contact Us</h2>
              <p>For privacy-related questions or concerns, please contact us through the Contact page.</p>
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

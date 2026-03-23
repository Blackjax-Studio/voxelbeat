"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function MessageBanner() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const [isVisible, setIsVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isVisible || !message) return null;

  return (
    <div className="fixed top-24 left-1/2 z-[150] animate-slideDown">
      <div className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm uppercase tracking-widest flex items-center gap-3 border border-white/20">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
        {message}
      </div>
    </div>
  );
}

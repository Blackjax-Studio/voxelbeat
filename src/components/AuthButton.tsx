'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthButtonProps {
  onAccountClick?: () => void;
  onOpenSignup?: () => void;
  onFavoritesClick?: () => void;
  isViewingFavorites?: boolean;
  isLoadingFavorites?: boolean;
}

export default function AuthButton({ onAccountClick, onOpenSignup, onFavoritesClick, isViewingFavorites, isLoadingFavorites }: AuthButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (isLoading) {
    return (
      <div className="px-4 py-2 rounded-lg bg-white/10 text-white/50 cursor-not-allowed">
        Loading...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 xs:gap-3">
        <button
          onClick={onFavoritesClick}
          disabled={isLoadingFavorites}
          className={`relative p-2 rounded-full transition-all border shadow-lg group
            ${isViewingFavorites 
              ? 'bg-red-500/20 text-red-500 border-red-500/30' 
              : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'}
            ${isLoadingFavorites ? 'opacity-50 cursor-wait' : ''}`}
          title={isViewingFavorites ? "Stop viewing favorites" : "View favorites"}
        >
          {isLoadingFavorites ? (
            <div className="w-4 h-4 xs:w-5 xs:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg 
              className={`w-4 h-4 xs:w-5 xs:h-5 transition-transform group-hover:scale-110 ${isViewingFavorites ? 'animate-pulse' : ''}`} 
              fill={isViewingFavorites ? "currentColor" : "none"} 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>

        <button
          onClick={onAccountClick}
          className="px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs xs:text-sm font-medium transition-colors border border-white/5"
        >
          Account
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onOpenSignup}
        className="text-xs font-medium text-white/40 hover:text-white/80 transition-colors"
      >
        Signup
      </button>
      <button
        onClick={onOpenSignup}
        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
      >
        Post your Music
      </button>
    </div>
  );
}

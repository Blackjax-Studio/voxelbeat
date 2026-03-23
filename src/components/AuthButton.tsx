'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthButtonProps {
  onAccountClick?: () => void;
  onOpenSignup?: () => void;
}

export default function AuthButton({ onAccountClick, onOpenSignup }: AuthButtonProps) {
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
      <button
        onClick={onAccountClick}
        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
      >
        Account
      </button>
    );
  }

  return (
    <button
      onClick={onOpenSignup}
      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
    >
      Post your Music
    </button>
  );
}

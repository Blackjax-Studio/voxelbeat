'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

interface AuthButtonProps {
  onAccountClick?: () => void;
}

export default function AuthButton({ onAccountClick }: AuthButtonProps) {
  const { user, isLoading } = useUser();

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
    <Link
      href="/auth/login"
      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
    >
      Post your Music
    </Link>
  );
}

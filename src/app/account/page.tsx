import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account | VoxelBeat',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-['Anton']">Account</h1>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Back to Player
          </Link>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-['Anton'] mb-4">Profile</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-white/60">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-white/60">Name</label>
                <p className="text-lg">{user.user_metadata?.full_name || user.user_metadata?.name || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Music Uploads Section */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-['Anton'] mb-4">Your Music</h2>
            <p className="text-white/60">No tracks uploaded yet.</p>
            <button className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
              Upload Track
            </button>
          </div>

          {/* Settings Section */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-['Anton'] mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60">Artist Name</label>
                <input
                  type="text"
                  placeholder="Enter your artist name"
                  className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-white/60">Bio</label>
                <textarea
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
              <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors">
                Save Changes
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="pt-4">
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-block px-6 py-2 bg-red-600/90 hover:bg-red-600 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

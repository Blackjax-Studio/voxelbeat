"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import MusicPlayer from "@/components/MusicPlayer";
import BackgroundVisualization from "@/components/BackgroundVisualization";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileModal from "@/components/ProfileModal";
import AccountModal from "@/components/AccountModal";
import LoginModal from "@/components/LoginModal";
import SignupModal from "@/components/SignupModal";
import TermsModal from "@/components/TermsModal";
import PrivacyModal from "@/components/PrivacyModal";
import ContactModal from "@/components/ContactModal";
import FavoritesPromptModal from "@/components/FavoritesPromptModal";
import { VisStyle } from "@/types/visualizer";
import { slugify } from "@/utils/slugify";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface HomeClientProps {
  initialArtists: any[];
}

export default function HomeClient({ initialArtists }: HomeClientProps) {
  const router = useRouter();
  const [artists, setArtists] = useState<any[]>(initialArtists);
  const [isLoading, setIsLoading] = useState(false);
  const [currentArtistIndex, setCurrentArtistIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const featureCardRef = useRef<HTMLDivElement>(null);

  const features = [
    { text: "Semantic Discovery", subtext: "Find music by feel — describe your scene and our vectorized search does the rest" },
    { text: "Vibe Matching", subtext: "Search for 'chilly, mysterious, and lo-fi' to find the exact atmosphere for your level" },
    { text: "Built for Games", subtext: "Genre and mood categories designed for game audio, not pop charts" },
    { text: "Composer Profiles", subtext: "Every artist gets a searchable, shareable portfolio page" },
    { text: "Direct Connect", subtext: "Reach the developers who need your sound, no middleman" },
    { text: "Developer-First", subtext: "Find the right track for your scene in seconds, not hours" },
  ];

  const handleSearch = useCallback(async (searchQuery: string, selectedTags: string[]) => {
    try {
      setIsSearching(true);
      setIsLoading(true);

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery, selectedTags }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Search results:', data);

        const transformedArtists = data.map((user: any) => ({
          name: user.studio_name || 'Unknown Artist',
          avatarUrl: user.avatar_display_url || user.avatar_url || '',
          profile: {
            studioName: user.studio_name || '',
            avatarUrl: user.avatar_display_url || user.avatar_url || '',
            bio: user.bio || '',
            spotifyLink: user.spotify_link || '',
            soundcloudLink: user.soundcloud_link || '',
            discordUsername: user.discord_username || '',
            instagramLink: user.instagram_link || '',
            contact_email: user.contact_email || '',
            phone_number: user.phone_number || '',
            itch_io_link: user.itch_io_link || '',
            website_link: user.website_link || '',
            tracks: user.tracks.map((track: any) => ({
              id: track.id,
              name: track.title,
              src: track.url,
              description: track.description || '',
              tags: track.tags || [],
            }))
              .filter((track: any) => track.src)
          },
          tracks: user.tracks.map((track: any) => ({
            id: track.id,
            name: track.title,
            src: track.url,
            description: track.description || '',
            tags: track.tags || [],
          }))
            .filter((track: any) => track.src)
        }));

        setArtists(transformedArtists);
        setCurrentArtistIndex(0);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, []);

  const [ptClass, setPtClass] = useState("pt-32 xs:pt-36 sm:pt-40 md:pt-32");
  const [displayFeatureIndex, setDisplayFeatureIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentArtist = artists[currentArtistIndex];
  const tracks = currentArtist?.tracks || [];

  const [visStyle, setVisStyle] = useState<VisStyle>('Circular');
  
  useEffect(() => {
    const styles: VisStyle[] = ['Circular', 'Bars', 'Waveform', 'Nebula'];
    setVisStyle(styles[Math.floor(Math.random() * styles.length)]);
  }, []);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isViewingFavorites, setIsViewingFavorites] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isFavoritesPromptOpen, setIsFavoritesPromptOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  // Fetch favorites from backend
  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        try {
          setIsLoadingFavorites(true);
          const response = await fetch('/api/user/favorites');
          if (response.ok) {
            const data = await response.json();
            setFavorites(data.favorites || []);
          }
        } catch (error) {
          console.error('Error fetching favorites:', error);
        } finally {
          setIsLoadingFavorites(false);
        }
      };
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const handleToggleFavorite = async (track: any) => {
    if (!user) {
      setIsFavoritesPromptOpen(true);
      return;
    }

    const isFavorited = favorites.some(f => f.id === track.id);
    const action = isFavorited ? 'remove' : 'add';

    // Optimistic update
    setFavorites(prev => {
      if (isFavorited) {
        return prev.filter(f => f.id !== track.id);
      }
      return [...prev, { ...track, artistName: track.artistName || currentArtist?.name }];
    });

    try {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to update favorites on backend');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update on error
      const refreshedFavorites = await fetch('/api/user/favorites').then(res => res.json());
      setFavorites(refreshedFavorites.favorites || []);
    }
  };

  const handleNextArtist = () => {
    setCurrentArtistIndex((prev) => (prev + 1) % artists.length);
  };

  const handlePrevArtist = () => {
    setCurrentArtistIndex((prev) => (prev - 1 + artists.length) % artists.length);
  };

  // Rotating features effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setDisplayFeatureIndex((prev) => (prev + 1) % features.length);
        setIsTransitioning(false);
      }, 500); // Half of the transition time
    }, 6000);
    return () => clearInterval(interval);
  }, [features.length]);

  // Beat detection for feature card
  useEffect(() => {
    if (!analyser) {
      if (featureCardRef.current) {
        featureCardRef.current.style.transform = 'scale(1)';
      }
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrameId: number;

    const updateBeat = () => {
      analyser.getByteFrequencyData(dataArray);
      const lowFreqs = dataArray.slice(0, 10);
      const average = lowFreqs.reduce((a, b) => a + b, 0) / lowFreqs.length;
      const scale = 1 + (average / 255) * 0.05;

      if (featureCardRef.current) {
        // Apply scale but preserve opacity from transition
        const currentOpacity = isTransitioning ? '0' : '1';
        featureCardRef.current.style.transform = `scale(${scale})`;
      }

      animationFrameId = requestAnimationFrame(updateBeat);
    };

    updateBeat();
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (featureCardRef.current) {
        featureCardRef.current.style.transform = 'scale(1)';
      }
    };
  }, [analyser, isTransitioning]);

  const handleViewProfile = () => {
    if (currentArtist?.name) {
      const slug = slugify(currentArtist.name);
      // Next.js routing is more reliable with standard links or router.push to the exact path
      router.push(`/composers/${slug}`);
    } else {
      setIsProfileOpen(true);
    }
  };

  return (
    <main className="h-screen w-full overflow-hidden bg-black flex flex-col">
      <BackgroundVisualization analyser={analyser} visStyle={visStyle} />
      <Header
        onAccountClick={() => setIsAccountOpen(true)}
        onFavoritesClick={() => {
          if (!user) {
            setIsFavoritesPromptOpen(true);
          } else if (isLoadingFavorites) {
            // Do nothing while loading
          } else {
            setIsViewingFavorites(!isViewingFavorites);
          }
        }}
        isViewingFavorites={isViewingFavorites}
        isLoadingFavorites={isLoadingFavorites}
        onTagsChange={(hasTags) => {
          // We always have a relatively tall header now because of the mobile search
          // and we want to ensure the features are not cut off.
          // Increasing padding values further for mobile, but keeping desktop (sm) tighter.
          if (hasTags) {
            setPtClass("pt-48 xs:pt-52 sm:pt-40");
          } else {
            setPtClass("pt-40 xs:pt-44 sm:pt-32");
          }
        }}
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenSignup={() => setIsSignupOpen(true)}
        onSearch={handleSearch}
      />
      <div className={`flex-1 relative ${ptClass} overflow-y-auto overflow-x-hidden`}>
        <div className="min-h-full flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-start pb-16 xs:pb-24">
            <div className="w-full sm:max-w-md md:max-w-none md:w-fit mx-auto flex flex-col items-center justify-center gap-2 xs:gap-4 md:gap-8 px-3 xs:px-4 z-10">
          {/* Rotating Features */}
          <div className="w-full md:w-[460px] text-center shrink-0 mb-1 xs:mb-2 sm:mb-4">
            <div
              ref={featureCardRef}
              className={`w-full py-1 xs:py-2 transition-all duration-500 ease-in-out ${isTransitioning ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}
            >
              <h2 className="text-xl xs:text-2xl sm:text-4xl font-['Anton'] text-white/90 mb-1 xs:mb-2 tracking-tight drop-shadow-lg uppercase">
                {features[displayFeatureIndex].text}
              </h2>
              <p className="text-white/70 text-[10px] xs:text-xs sm:text-base font-medium mx-auto max-w-[280px] xs:max-w-[320px] sm:max-w-none min-h-[2.5em] xs:min-h-[2.4em] sm:min-h-[2.4em] flex items-center justify-center">
                {features[displayFeatureIndex].subtext}
              </p>
            </div>

            {/* Hidden SEO content for search engines */}
            <div className="sr-only">
              <h1>VoxelBeat | Discover Indie Game Music & Connect with Composers</h1>
              <p>VoxelBeat is the premier platform for indie game developers to discover talented musicians and composers. Find the perfect original soundtrack for your RPG, platformer, or horror game with our advanced semantic search. Connect directly with artists and explore unique game music vibes.</p>
              
              <h2>Platform Features</h2>
              {features.map((feature, index) => (
                <div key={index}>
                  <h3>{feature.text}</h3>
                  <p>{feature.subtext}</p>
                </div>
              ))}
              
              <h2>Featured Indie Game Composers</h2>
              {artists.map((artist, index) => (
                <div key={index}>
                  <h3>{artist.name}</h3>
                  <p><strong>Composer Bio:</strong> {artist.profile?.bio}</p>
                  <ul>
                    {artist.tracks.map((track: any, tIndex: number) => (
                      <li key={tIndex}>
                        <strong>Track: {track.name}</strong>: {track.description}
                      </li>
                    ))}
                  </ul>
                  {artist.profile?.websiteLink && <a href={artist.profile.websiteLink}>{artist.name} Official Website</a>}
                </div>
              ))}
              {/* Semantic fallback for global sections */}
              <nav>
                <a href="#terms">Terms of Service</a>
                <a href="#privacy">Privacy Policy</a>
                <a href="#contact">Contact</a>
              </nav>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin h-12 w-12 border-4 border-violet-500 border-t-transparent rounded-full mb-4" />
              <p className="text-white/60 text-sm">Loading artists...</p>
            </div>
          ) : artists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-white/60 text-lg mb-4">No artists with tracks yet</p>
              <p className="text-white/40 text-sm">Be the first to upload music!</p>
            </div>
          ) : (
            <div className={`relative w-full xl:w-auto xl:max-w-[880px] lg:max-w-md md:max-w-md mx-auto flex items-center justify-center shrink-0 scale-100 xs:scale-105 sm:scale-110`}>
              {artists.length > 1 && (
                <div className="group/tooltip relative">
                  <button
                    onClick={handlePrevArtist}
                    className="absolute left-1 xs:left-2 md:left-4 lg:-left-16 xl:-left-20 top-10 xs:top-12 md:top-1/2 md:-translate-y-1/2 z-20 w-8 h-8 xs:w-10 xs:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/40 hover:text-white hover:bg-black/40 hover:scale-110 transition-all shadow-xl"
                  >
                    <svg className="w-5 h-5 xs:w-6 xs:h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-1 xs:left-2 md:left-4 lg:-left-16 xl:-left-20 top-10 xs:top-12 md:top-[calc(50%-40px)] md:-translate-y-full z-30 px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap mb-2">
                    Previous Artist
                  </div>
                </div>
              ) || null}

              <MusicPlayer
                tracks={isViewingFavorites ? favorites : tracks}
                artistName={isViewingFavorites ? 'Your Favorites' : (currentArtist?.name || 'Unknown Artist')}
                avatarUrl={isViewingFavorites ? undefined : currentArtist?.avatarUrl}
                visStyle={visStyle}
                setVisStyle={setVisStyle}
                onViewProfile={handleViewProfile}
                setAnalyser={setAnalyser}
                onNextArtist={isViewingFavorites ? () => {} : handleNextArtist}
                onPrevArtist={isViewingFavorites ? () => {} : handlePrevArtist}
                onToggleFavorite={handleToggleFavorite}
                isFavorited={(trackId) => favorites.some(f => f.id === trackId)}
                artistKey={isViewingFavorites ? 'favorites' : currentArtistIndex}
                isFavoritesMode={isViewingFavorites}
              />

              {artists.length > 1 && (
                <div className="group/tooltip relative">
                  <button
                    onClick={handleNextArtist}
                    className="absolute right-1 xs:right-2 md:right-4 lg:-right-16 xl:-right-20 top-10 xs:top-12 md:top-1/2 md:-translate-y-1/2 z-20 w-8 h-8 xs:w-10 xs:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/40 hover:text-white hover:bg-black/40 hover:scale-110 transition-all shadow-xl"
                  >
                    <svg className="w-5 h-5 xs:w-6 xs:h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="absolute right-1 xs:right-2 md:right-4 lg:-right-16 xl:-right-20 top-10 xs:top-12 md:top-[calc(50%-40px)] md:-translate-y-full z-30 px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap mb-2">
                    Next Artist
                  </div>
                </div>
              ) || null}
            </div>
          )}
          
          {/* View Favorites Button - Below Player */}
          <div className="mt-8 xs:mt-12 mb-4 z-10 flex justify-center">
            <button
              onClick={() => {
                if (!user) {
                  setIsFavoritesPromptOpen(true);
                } else if (isLoadingFavorites) {
                  // Do nothing while loading
                } else {
                  setIsViewingFavorites(!isViewingFavorites);
                }
              }}
              disabled={isLoadingFavorites}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all border shadow-lg group
                ${isViewingFavorites 
                  ? 'bg-red-500/20 text-red-500 border-red-500/30' 
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'}
                ${isLoadingFavorites ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isLoadingFavorites ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg 
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${isViewingFavorites ? 'animate-pulse' : ''}`} 
                  fill={isViewingFavorites ? "currentColor" : "none"} 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
              <span>
                {isLoadingFavorites 
                  ? "Loading..." 
                  : (isViewingFavorites ? "Viewing Favorites" : "View Favorites")}
              </span>
              {favorites.length > 0 && !isViewingFavorites && !isLoadingFavorites && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] text-white/40 group-hover:bg-white/20 group-hover:text-white/60 transition-colors">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>
        </div>
        </div>
        <Footer
          onTermsClick={() => setIsTermsOpen(true)}
          onPrivacyClick={() => setIsPrivacyOpen(true)}
          onContactClick={() => setIsContactOpen(true)}
        />
      </div>
    </div>

      {currentArtist && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          profile={currentArtist.profile}
        />
      )}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
        onOpenTerms={() => {
          setIsSignupOpen(false);
          setIsTermsOpen(true);
        }}
        onOpenPrivacy={() => {
          setIsSignupOpen(false);
          setIsPrivacyOpen(true);
        }}
      />
      <FavoritesPromptModal
        isOpen={isFavoritesPromptOpen}
        onClose={() => setIsFavoritesPromptOpen(false)}
        onSignup={() => setIsSignupOpen(true)}
        onLogin={() => setIsLoginOpen(true)}
      />
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </main>
  );
}

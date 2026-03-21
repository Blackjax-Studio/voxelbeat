"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MusicPlayer from "@/components/MusicPlayer";
import BackgroundVisualization from "@/components/BackgroundVisualization";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileModal from "@/components/ProfileModal";
import AccountModal from "@/components/AccountModal";
import TermsModal from "@/components/TermsModal";
import PrivacyModal from "@/components/PrivacyModal";
import ContactModal from "@/components/ContactModal";

export type VisStyle = 'Circular' | 'Bars' | 'Waveform' | 'Nebula';

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

export default function Home() {
    const [artists, setArtists] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentArtistIndex, setCurrentArtistIndex] = useState(0);

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const response = await fetch('/api/users/with-tracks');
                console.log('API Response status:', response.status);
                if (response.ok) {
                    const data = await response.json();
                    console.log('API Response data:', data);
                    // Transform the data to match the expected format
                    const transformedArtists = data.map((user: any) => ({
                        name: user.studio_name || 'Unknown Artist',
                        avatarUrl: user.avatar_url || '',
                        profile: {
                            studioName: user.studio_name || '',
                            avatarUrl: user.avatar_url || '',
                            bio: user.bio || '',
                            spotifyLink: user.spotify_link || '',
                            soundcloudLink: user.soundcloud_link || '',
                            discordUsername: user.discord_username || '',
                            instagramLink: user.instagram_link || '',
                            contactEmail: user.contact_email || '',
                            phoneNumber: user.phone_number || '',
                            itchIoLink: user.itch_io_link || '',
                            websiteLink: user.website_link || '',
                        },
                        tracks: user.tracks.map((track: any) => ({
                            name: track.title,
                            src: track.url, // Presigned URL from API
                            description: track.description || '',
                        }))
                            .filter((track: any) => track.src) // Filter out tracks without URLs
                    }));
                    console.log('Transformed artists:', transformedArtists);
                    setArtists(transformedArtists);
                }
            } catch (error) {
                console.error('Error fetching artists:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArtists();
    }, []);
    const [ptClass, setPtClass] = useState("pt-36 xs:pt-40 sm:pt-44");
    const currentArtist = artists[currentArtistIndex];
    const tracks = currentArtist?.tracks || [];

    const [visStyle, setVisStyle] = useState<VisStyle>('Circular');
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const featureCardRef = useRef<HTMLDivElement>(null);

    const features = [
        // Discovery
        { text: "Discovery", subtext: "Vectorized search — find music by feel, not just tags" },
        { text: "Genre Tagging", subtext: "Built for games specifically, not generic music categories" },

        // For Musicians
        { text: "Free to List", subtext: "No algorithm burying you — every track is searchable" },
        { text: "Built for Games", subtext: "Not adapted from general music platforms like Spotify" },
        { text: "Direct Path", subtext: "Connect directly to developers who need your work" },

        // For Developers
        { text: "Find Your Vibe", subtext: "Music that fits your game, not just a genre bucket" },
        { text: "No Middleman", subtext: "Contact musicians directly — no licensing maze" },
        { text: "Indie Context", subtext: "Curated for game development, not stock music" },

        // Platform
        { text: "Built-in Visualizer", subtext: "Hear it in context, not just a 30-second snippet" },
        { text: "Lightweight", subtext: "No account required to browse and explore" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [features.length]);


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

            // Focus on low frequencies for beat detection (roughly 0-100Hz)
            const lowFreqs = dataArray.slice(0, 10);
            const average = lowFreqs.reduce((a, b) => a + b, 0) / lowFreqs.length;

            // Map average (0-255) to a scale factor (1.0 - 1.05)
            const scale = 1 + (average / 255) * 0.05;

            if (featureCardRef.current) {
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
    }, [analyser]);

    const nextArtist = () => {
        setCurrentArtistIndex((i) => (i + 1) % artists.length);
    };

    const prevArtist = () => {
        setCurrentArtistIndex((i) => (i - 1 + artists.length) % artists.length);
    };

    return (
        <main className="h-screen w-full overflow-hidden bg-black flex flex-col">
            <Suspense fallback={null}>
                <MessageBanner />
            </Suspense>
            <BackgroundVisualization analyser={analyser} visStyle={visStyle} />
            <Header
                onAccountClick={() => setIsAccountOpen(true)}
                onTagsChange={(hasTags) => {
                    if (hasTags) {
                        setPtClass("pt-40 xs:pt-44 sm:pt-48");
                    } else {
                        setPtClass("pt-36 xs:pt-40 sm:pt-44");
                    }
                }}
            />
            <div className={`flex-1 flex flex-col items-center justify-start relative ${ptClass} pb-16 xs:pb-24 overflow-y-auto`}>
                <div className="w-full sm:max-w-md md:max-w-none md:w-fit mx-auto flex flex-col items-center justify-center gap-2 xs:gap-4 md:gap-8 px-3 xs:px-4 z-10">
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
                        <div className="relative w-full md:w-[460px] flex items-center justify-center shrink-0 scale-100 xs:scale-105 sm:scale-110">
                            {/* Artist Navigation - Left Chevron */}
                            {artists.length > 1 && (
                                <button
                                    onClick={prevArtist}
                                    className="absolute left-1 xs:left-2 md:-left-16 top-10 xs:top-12 md:top-1/2 md:-translate-y-1/2 z-20 w-8 h-8 xs:w-10 xs:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/40 hover:text-white hover:bg-black/40 hover:scale-110 transition-all group"
                                    title="Previous Artist"
                                >
                                    <svg className="w-5 h-5 xs:w-6 xs:h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}

                            <MusicPlayer
                                tracks={tracks}
                                artistName={currentArtist.name}
                                avatarUrl={currentArtist.avatarUrl}
                                visStyle={visStyle}
                                setVisStyle={setVisStyle}
                                onViewProfile={() => setIsProfileOpen(true)}
                                setAnalyser={setAnalyser}
                                onNextArtist={nextArtist}
                                onPrevArtist={prevArtist}
                            />

                            {/* Artist Navigation - Right Chevron */}
                            {artists.length > 1 && (
                                <button
                                    onClick={nextArtist}
                                    className="absolute right-1 xs:right-2 md:-right-16 top-10 xs:top-12 md:top-1/2 md:-translate-y-1/2 z-20 w-8 h-8 xs:w-10 xs:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/40 hover:text-white hover:bg-black/40 hover:scale-110 transition-all group"
                                    title="Next Artist"
                                >
                                    <svg className="w-5 h-5 xs:w-6 xs:h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Rotating Features - Now closer to the player */}
                    <div className="w-full md:w-[460px] text-center shrink-0 mt-1 xs:mt-2 sm:mt-4">
                        <div
                            key={currentFeatureIndex}
                            ref={featureCardRef}
                            className="animate-fadeIn w-full py-1 xs:py-2 transition-transform duration-75 ease-out"
                            style={{
                                animationDuration: '0.5s'
                            }}
                        >
                            <h2 className="text-xl xs:text-2xl sm:text-4xl font-['Anton'] text-white/90 mb-1 xs:mb-2 tracking-tight drop-shadow-lg uppercase">
                                {features[currentFeatureIndex].text}
                            </h2>
                            <p className="text-white/70 text-[10px] xs:text-xs sm:text-base font-medium mx-auto max-w-[240px] xs:max-w-[280px] sm:max-w-[420px]">
                                {features[currentFeatureIndex].subtext}
                            </p>
                        </div>
                    </div>
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
            <Footer
                onTermsClick={() => setIsTermsOpen(true)}
                onPrivacyClick={() => setIsPrivacyOpen(true)}
                onContactClick={() => setIsContactOpen(true)}
            />
        </main>
    );
}

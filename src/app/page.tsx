"use client";

import { useState, useEffect } from "react";
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

export default function Home() {
    const baseTracks = [
        {
            name: "500",
            src: "/pepes/500.mp3",
            description: "High energy electronic track"
        },
        {
            name: "DateFinal",
            src: "/pepes/DateFinal.mp3",
            description: "A mellow melodic journey"
        },
        {
            name: "ancient4",
            src: "/pepes/ancient4.mp3",
            description: "Mysterious rhythms and tribal beats"
        },
        {
            name: "beacher",
            src: "/pepes/beacher.mp3",
            description: "Summer vibes and beachy melodies"
        },
        {
            name: "froznew1",
            src: "/pepes/froznew1.mp3",
            description: "Cool electronic sounds with a crisp finish"
        },
    ];

    const tracks = baseTracks;

    const [visStyle, setVisStyle] = useState<VisStyle>('Circular');
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [beatScale, setBeatScale] = useState(1);

    const features = [
        { icon: "🔍", text: "Deep Vectorized Search", subtext: "Find the perfect track instantly" },
        { icon: "💎", text: "100% Free Forever", subtext: "No hidden fees, no catch" },
        { icon: "🚀", text: "Get Discovered", subtext: "Connect with producers and artists" },
        { icon: "🎨", text: "Visual Audio Experience", subtext: "Stunning real-time visualizations" },
        { icon: "⚡", text: "Lightning Fast", subtext: "Instant playback, zero buffering" },
        { icon: "🌐", text: "Global Community", subtext: "Share your sound with the world" },
        { icon: "🎯", text: "Smart Recommendations", subtext: "AI-powered track suggestions" },
        { icon: "📱", text: "Works Everywhere", subtext: "Seamless on any device" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [features.length]);

    useEffect(() => {
        if (!analyser) {
            setBeatScale(1);
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
            setBeatScale(scale);

            animationFrameId = requestAnimationFrame(updateBeat);
        };

        updateBeat();
        return () => cancelAnimationFrame(animationFrameId);
    }, [analyser]);

    // Stub profile data for testing layout
    const stubProfile = {
        studioName: "ElpepesUno",
        bio: "Creating unique beats and melodies that blend electronic and acoustic elements. Specializing in EDM, R&B, and experimental sounds. Based in the digital realm, producing music for the future.",
        spotifyLink: "https://spotify.com",
        soundcloudLink: "https://soundcloud.com",
        discordUsername: "elpepes#1234",
        discordServerLink: "https://discord.gg/elpepes",
        instagramLink: "https://instagram.com/elpepes",
        contactEmail: "contact@elpepes.com",
        phoneNumber: "+1 (555) 123-4567",
        itchIoLink: "https://itch.io/elpepes",
        websiteLink: "https://elpepes.com",
    };

    return (
        <main className="h-screen w-full overflow-hidden bg-black flex flex-col">
            <BackgroundVisualization analyser={analyser} visStyle={visStyle} />
            <Header onAccountClick={() => setIsAccountOpen(true)} />
            <div className="flex-1 flex flex-col items-center justify-start sm:justify-center relative pt-28 pb-24 overflow-y-auto">
                <div className="w-full lg:w-fit mx-auto flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 px-4 z-10">
                    {/* Rotating Features - Positioned next to player on large screens */}
                    <div className="w-full lg:w-[380px] text-center shrink-0">
                        <div
                            key={currentFeatureIndex}
                            className="animate-fadeIn w-full py-4 md:py-10 px-6 md:px-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center justify-center min-h-[140px] md:min-h-[300px] transition-transform duration-75 ease-out"
                            style={{
                                animationDuration: '0.5s',
                                transform: `scale(${beatScale})`
                            }}
                        >
                            <div className="text-3xl md:text-5xl mb-3 md:mb-4 drop-shadow-lg">
                                {features[currentFeatureIndex].icon}
                            </div>
                            <h2 className="text-2xl md:text-4xl font-['Anton'] text-white mb-1 md:mb-2 tracking-tight drop-shadow-lg uppercase">
                                {features[currentFeatureIndex].text}
                            </h2>
                            <p className="text-white/60 text-xs md:text-base font-medium max-w-[200px] md:max-w-[250px]">
                                {features[currentFeatureIndex].subtext}
                            </p>
                        </div>
                    </div>

                    <div className="w-full lg:w-[460px] flex justify-center shrink-0">
                        <MusicPlayer
                            tracks={tracks}
                            visStyle={visStyle}
                            setVisStyle={setVisStyle}
                            onViewProfile={() => setIsProfileOpen(true)}
                            setAnalyser={setAnalyser}
                        />
                    </div>
                </div>
            </div>
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                profile={stubProfile}
            />
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

"use client";

import { useEffect, useState } from "react";
import { TAG_CATEGORIES } from "@/constants/tags";

interface Track {
  id: string;
  title: string;
  description: string | null;
  tags: string | null;
}

interface EditTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  track: Track | null;
}

export default function EditTrackModal({ isOpen, onClose, onSuccess, track }: EditTrackModalProps) {
  const [trackName, setTrackName] = useState("");
  const [trackDescription, setTrackDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');


  useEffect(() => {
    if (track) {
      setTrackName(track.title || "");
      setTrackDescription(track.description || "");
      setSelectedTags(track.tags ? track.tags.split(',').filter(t => t.trim() !== "") : []);
    }
  }, [track]);

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

  if (!isOpen || !track) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!trackName) return;

    setIsUpdating(true);
    setUpdateStatus('idle');

    try {
      const body = {
        title: trackName,
        description: trackDescription,
        tags: selectedTags.join(','),
      };

      const response = await fetch(`/api/tracks/${track.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to update track record');
      }

      setUpdateStatus('success');

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        onClose();
        setUpdateStatus('idle');
      }, 1500);

    } catch (error) {
      console.error('Error updating track:', error);
      setUpdateStatus('error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn" />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-lg max-h-[90vh] rounded-3xl animate-slideUp flex flex-col bg-zinc-900 isolation-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06) inset',
          transform: 'translateZ(0)',
          WebkitBackdropFilter: 'blur(32px)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110"
          aria-label="Close"
        >
          <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative flex-shrink-0 px-6 pt-8 pb-6 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 overflow-hidden rounded-t-3xl">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px)`
            }}
          />
          <div className="relative flex items-center gap-3">
            <span className="text-3xl">✏️</span>
            <h1 className="text-2xl font-['Anton'] text-white">Edit Track</h1>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide block mb-2">Track Name</label>
            <input
              type="text"
              placeholder="Enter track name"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/60 uppercase tracking-wide block">
                Description <span className="text-white/40">(Optional)</span>
              </label>
              
              <div className="bg-violet-400/20 border border-violet-400/30 rounded-xl p-3 flex gap-3 items-start animate-fadeIn shadow-[0_0_20px_rgba(167,139,250,0.1)]">
                <div className="bg-violet-400/30 p-1.5 rounded-lg shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-violet-200 uppercase tracking-wider">Semantic Search Power</p>
                  <p className="text-[11px] leading-relaxed text-white/80">
                    Our AI-driven <span className="text-white/100 font-medium">Vectorized Search</span> scans your description to help developers find <span className="text-violet-300 font-bold uppercase">YOU</span> and your unique sound.
                    <span className="block mt-1 text-violet-300">Mention moods, instruments, and intended scenes!</span>
                  </p>
                </div>
              </div>
            </div>

            <textarea
              placeholder="e.g., A haunting, atmospheric orchestral piece featuring a solo cello. Perfect for desolate snowy landscapes or moments of tragic realization."
              value={trackDescription}
              onChange={(e) => setTrackDescription(e.target.value)}
              rows={4}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none transition-all"
            />
            <div className="flex justify-between items-center px-1">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Characters</p>
              <p className={`text-xs font-mono ${trackDescription.length > 450 ? 'text-orange-400' : 'text-white/40'}`}>
                {trackDescription.length} <span className="text-[10px] opacity-50">/ 500</span>
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/60 uppercase tracking-wide block">
                Track Tags <span className="text-white/40">({selectedTags.length} selected)</span>
              </label>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-[10px] text-white/30 hover:text-white/60 uppercase tracking-wider transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-4 bg-white/5 rounded-xl p-4 border border-white/10">
              {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)] scale-105'
                            : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-900 border-t border-white/10">
          <button
            onClick={handleSubmit}
            disabled={!trackName || isUpdating}
            className={`w-full py-4 rounded-xl font-['Anton'] text-xl tracking-wider uppercase transition-all flex items-center justify-center gap-3 ${
              updateStatus === 'success' 
                ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                : updateStatus === 'error'
                ? 'bg-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.3)]'
                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_10px_30px_rgba(124,58,237,0.3)] hover:translate-y-[-2px] disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none'
            }`}
          >
            {isUpdating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : updateStatus === 'success' ? (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Track Updated!
              </>
            ) : updateStatus === 'error' ? (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Failed to Update
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

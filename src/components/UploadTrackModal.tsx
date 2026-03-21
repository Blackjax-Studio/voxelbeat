"use client";

import { useEffect, useState } from "react";

interface UploadTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadTrackModal({ isOpen, onClose }: UploadTrackModalProps) {
  const [trackFile, setTrackFile] = useState<File | null>(null);
  const [trackName, setTrackName] = useState("");
  const [trackDescription, setTrackDescription] = useState("");

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTrackFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    // TODO: Implement track upload
    console.log({ trackFile, trackName, trackDescription });
    alert('Track upload will be implemented soon');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-3xl animate-slideUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06) inset',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110"
          aria-label="Close"
        >
          <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="relative px-6 pt-8 pb-6 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px)`
            }}
          />
          <div className="relative flex items-center gap-3">
            <span className="text-3xl">🎵</span>
            <h1 className="text-2xl font-['Anton'] text-white">Upload Track</h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-5">
          {/* File Upload */}
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide block mb-2">Audio File</label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 hover:border-violet-500/50 transition-colors">
              {trackFile ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-600/40 to-fuchsia-600/40 flex items-center justify-center">
                    <span className="text-2xl">🎵</span>
                  </div>
                  <p className="text-white font-medium text-sm mb-1">{trackFile.name}</p>
                  <p className="text-white/50 text-xs mb-3">
                    {(trackFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <label className="cursor-pointer inline-block px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-white text-xs font-medium transition-colors">
                    Change File
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer block text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-white/70 text-sm mb-1">Click to upload or drag and drop</p>
                  <p className="text-white/40 text-xs">MP3, WAV, FLAC (max 100MB)</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Track Name */}
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

          {/* Track Description */}
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide block mb-2">
              Description <span className="text-white/40">(Optional)</span>
            </label>
            <textarea
              placeholder="Tell listeners about your track..."
              value={trackDescription}
              onChange={(e) => setTrackDescription(e.target.value)}
              rows={4}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
            <p className="text-white/40 text-xs mt-1.5">{trackDescription.length} / 500 characters</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-white font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!trackFile || !trackName}
              className={`flex-1 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                trackFile && trackName
                  ? 'bg-violet-600 hover:bg-violet-700 text-white'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              Upload Track
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

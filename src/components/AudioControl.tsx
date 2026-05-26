'use client';

import { useEffect, useRef, useState } from 'react';
import { getAudio } from '@/lib/audio';

export function AudioControl() {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [sliderOpen, setSliderOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with persisted state on mount (client only)
  useEffect(() => {
    const audio = getAudio();
    setMuted(audio.isMuted());
    setVolume(audio.getVolume());
  }, []);

  const toggleMute = () => {
    const audio = getAudio();
    const next = !muted;
    audio.setMuted(next);
    setMuted(next);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    getAudio().setVolume(v);
  };

  const openSlider = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSliderOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setSliderOpen(false), 700);
  };

  return (
    <div
      style={{
        position: 'fixed',
        // In RTL, left = visual right corner
        top: '1rem',
        left: '1rem',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
        gap: '0.5rem',
      }}
      onMouseEnter={openSlider}
      onMouseLeave={scheduleClose}
    >
      {/* Volume slider — visible on hover */}
      {sliderOpen && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'var(--bg-elev-2)',
            border: '1px solid var(--border-subtle)',
            padding: '0.6rem 0.5rem',
          }}
        >
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={handleVolume}
            disabled={muted}
            style={{
              WebkitAppearance: 'slider-vertical',
              writingMode: 'vertical-lr',
              direction: 'rtl',
              width: 28,
              height: 72,
              cursor: muted ? 'not-allowed' : 'pointer',
              opacity: muted ? 0.4 : 1,
              accentColor: 'var(--gold)',
            }}
            aria-label="עוצמת שמע"
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-xs)',
              color: 'var(--text-muted)',
            }}
          >
            {Math.round(volume * 100)}
          </span>
        </div>
      )}

      {/* Mute toggle button */}
      <button
        onClick={toggleMute}
        title={muted ? 'בטל השתקה' : 'השתק'}
        aria-label={muted ? 'בטל השתקה' : 'השתק שמע'}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'var(--bg-elev)',
          border: '1px solid var(--border-subtle)',
          color: muted ? 'var(--text-faint)' : 'var(--text-secondary)',
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.15s, color 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.borderColor = 'var(--gold)';
          b.style.color = 'var(--gold)';
        }}
        onMouseLeave={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.borderColor = 'var(--border-subtle)';
          b.style.color = muted ? 'var(--text-faint)' : 'var(--text-secondary)';
        }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}

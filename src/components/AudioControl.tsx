'use client';

import { useEffect, useRef, useState } from 'react';
import { getAudio } from '@/lib/audio';

interface AudioControlProps {
  /**
   * 'inline' (default) — renders in normal flow, fits next to other buttons.
   * 'floating' — fixed-position bottom-right corner for screens without a chrome.
   */
  mode?: 'inline' | 'floating';
}

export function AudioControl({ mode = 'inline' }: AudioControlProps) {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [sliderOpen, setSliderOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const wrapperStyle: React.CSSProperties =
    mode === 'floating'
      ? {
          position: 'fixed',
          // Visual bottom-right of viewport — avoids the top bar and chat input.
          insetBlockEnd: 'var(--space-4)',
          insetInlineEnd: 'var(--space-4)',
          zIndex: 'var(--z-overlay)' as unknown as number,
          display: 'inline-flex',
          alignItems: 'center',
        }
      : {
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
        };

  return (
    <div
      style={wrapperStyle}
      onMouseEnter={openSlider}
      onMouseLeave={scheduleClose}
    >
      {/* Volume popover — opens BELOW the button so it never overlaps other chrome */}
      {sliderOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--space-2))',
            insetInlineEnd: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-1)',
            background: 'var(--color-surface-3)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-2)',
            boxShadow: 'var(--shadow-card)',
            zIndex: 'var(--z-overlay)' as unknown as number,
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
              width: 24,
              height: 72,
              cursor: muted ? 'not-allowed' : 'pointer',
              opacity: muted ? 0.4 : 1,
              accentColor: 'var(--color-gold-primary)',
            }}
            aria-label="עוצמת שמע"
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-caption-size)',
              color: 'var(--color-text-muted)',
            }}
          >
            {Math.round(volume * 100)}
          </span>
        </div>
      )}

      {/* Mute toggle button — same 40×40 round look, but no fixed position */}
      <button
        onClick={toggleMute}
        title={muted ? 'בטל השתקה' : 'השתק'}
        aria-label={muted ? 'בטל השתקה' : 'השתק שמע'}
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border-subtle)',
          color: muted ? 'var(--color-text-faint)' : 'var(--color-text-secondary)',
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition:
            'border-color var(--motion-base) var(--motion-ease), color var(--motion-base) var(--motion-ease)',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.borderColor = 'var(--color-gold-primary)';
          b.style.color = 'var(--color-gold-primary)';
        }}
        onMouseLeave={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.borderColor = 'var(--color-border-subtle)';
          b.style.color = muted
            ? 'var(--color-text-faint)'
            : 'var(--color-text-secondary)';
        }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}

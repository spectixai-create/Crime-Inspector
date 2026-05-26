import { Howl } from 'howler';
import type { EmotionalState } from './types';

type SfxKey = 'send' | 'receive' | 'evidence' | 'state' | 'stamp' | 'star';

const SFX_FILES: Record<SfxKey, string> = {
  send:     '/assets/audio/sfx-message-send.mp3',
  receive:  '/assets/audio/sfx-message-receive.mp3',
  evidence: '/assets/audio/sfx-evidence-thud.mp3',
  state:    '/assets/audio/sfx-state-change.mp3',
  stamp:    '/assets/audio/sfx-stamp.mp3',
  star:     '/assets/audio/sfx-star-award.mp3',
};

const TENSION_TARGETS: Record<EmotionalState, number> = {
  neutral:   0,
  defensive: 0,
  nervous:   0.3,
  angry:     0.5,
  exhausted: 0.6,
  broken:    0.7,
};

function makeSafeHowl(config: ConstructorParameters<typeof Howl>[0]): Howl | null {
  try {
    const h = new Howl({
      ...config,
      onloaderror: (_id, err) => {
        console.warn(`[Audio] Failed to load ${(config.src as string[])[0]}:`, err);
      },
    });
    return h;
  } catch (e) {
    console.warn('[Audio] Failed to instantiate Howl:', e);
    return null;
  }
}

class AudioEngine {
  private ambient: Howl | null = null;
  private tension: Howl | null = null;
  private sfx: Map<SfxKey, Howl> = new Map();
  private oneshots: Map<string, Howl> = new Map();
  private muted: boolean = false;
  private masterVolume: number = 0.6;
  private tensionTarget: number = 0;
  private ready: boolean = false;

  constructor() {
    if (typeof window === 'undefined') return;

    // Restore persisted prefs
    const stored = localStorage.getItem('audio-muted');
    this.muted = stored === 'true';
    const vol = localStorage.getItem('audio-volume');
    if (vol) this.masterVolume = parseFloat(vol);

    this.ambient = makeSafeHowl({
      src: ['/assets/audio/ambient-base.mp3'],
      loop: true,
      volume: 0,
      html5: true,
    });

    this.tension = makeSafeHowl({
      src: ['/assets/audio/tension-layer.mp3'],
      loop: true,
      volume: 0,
      html5: true,
    });

    Object.entries(SFX_FILES).forEach(([key, src]) => {
      const h = makeSafeHowl({ src: [src], volume: this.masterVolume });
      if (h) this.sfx.set(key as SfxKey, h);
    });

    const oneshotDefs: [string, string, number][] = [
      ['crisis',         '/assets/audio/crisis-sting.mp3',   this.masterVolume * 0.9],
      ['verdict-correct','/assets/audio/verdict-correct.mp3', this.masterVolume],
      ['verdict-wrong',  '/assets/audio/verdict-wrong.mp3',   this.masterVolume],
    ];
    oneshotDefs.forEach(([key, src, vol]) => {
      const h = makeSafeHowl({ src: [src], volume: vol });
      if (h) this.oneshots.set(key, h);
    });

    this.ready = true;
  }

  /** Plays just the ambient base loop. Safe to call repeatedly — idempotent. */
  startAmbient() {
    if (!this.ready || this.muted) return;
    if (this.ambient && !this.ambient.playing()) {
      this.ambient.volume(this.masterVolume * 0.4); // softer for menus
      try { this.ambient.play(); } catch (e) { console.warn('[Audio] ambient play failed:', e); }
    }
  }

  /** Interrogation room: ambient (louder) + tension layer ready for state shifts. */
  startInterrogationAudio() {
    if (!this.ready || this.muted) return;
    if (this.ambient && !this.ambient.playing()) {
      this.ambient.volume(this.masterVolume * 0.5);
      try { this.ambient.play(); } catch (e) { console.warn('[Audio] ambient play failed:', e); }
    } else if (this.ambient) {
      // Ambient already running from menus — bump it up
      this.ambient.volume(this.masterVolume * 0.5);
    }
    if (this.tension && !this.tension.playing()) {
      this.tension.volume(0); // silent until suspect state changes
      try { this.tension.play(); } catch (e) { console.warn('[Audio] tension play failed:', e); }
    }
  }

  stopAllMusic() {
    if (this.ambient) {
      this.ambient.fade(this.ambient.volume(), 0, 800);
      setTimeout(() => this.ambient?.stop(), 1000);
    }
    if (this.tension) {
      this.tension.fade(this.tension.volume(), 0, 800);
      setTimeout(() => this.tension?.stop(), 1000);
    }
  }

  setSuspectState(state: EmotionalState) {
    this.tensionTarget = TENSION_TARGETS[state] * this.masterVolume;
    if (this.tension && !this.muted) {
      this.tension.fade(this.tension.volume(), this.tensionTarget, 3000);
    }
    if (state === 'broken') {
      this.oneshot('crisis');
    }
  }

  sfx_play(key: SfxKey) {
    if (!this.ready || this.muted) return;
    const s = this.sfx.get(key);
    if (s) s.play();
  }

  oneshot(key: string) {
    if (!this.ready || this.muted) return;
    const s = this.oneshots.get(key);
    if (s) s.play();
  }

  setMuted(value: boolean) {
    this.muted = value;
    localStorage.setItem('audio-muted', String(value));
    if (value) {
      this.ambient?.fade(this.ambient.volume(), 0, 300);
      this.tension?.fade(this.tension.volume(), 0, 300);
    } else {
      if (this.ambient?.playing()) {
        this.ambient.fade(0, this.masterVolume * 0.5, 800);
      }
      if (this.tension?.playing()) {
        this.tension.fade(0, this.tensionTarget, 800);
      }
    }
  }

  setVolume(value: number) {
    this.masterVolume = Math.max(0, Math.min(1, value));
    localStorage.setItem('audio-volume', String(this.masterVolume));
    if (!this.muted) {
      this.ambient?.volume(this.masterVolume * 0.5);
      this.tension?.volume(this.tensionTarget);
      this.sfx.forEach((s) => s.volume(this.masterVolume));
      this.oneshots.forEach((s) => s.volume(this.masterVolume));
    }
  }

  isMuted() { return this.muted; }
  getVolume() { return this.masterVolume; }
}

// Singleton — only created on client after first access
let _engine: AudioEngine | null = null;

export function getAudio(): AudioEngine {
  if (!_engine && typeof window !== 'undefined') {
    _engine = new AudioEngine();
    // Debug handle (dev only)
    if (process.env.NODE_ENV === 'development') {
      (window as unknown as { __audio: AudioEngine }).__audio = _engine;
    }
  }
  return _engine as AudioEngine;
}

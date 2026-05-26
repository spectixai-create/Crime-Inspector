'use client';

import { useEffect } from 'react';
import { useGame } from '@/lib/gameState';
import { CASES, CASE_ORDER } from '@/data/cases';
import { AtmosphericBackground } from './AtmosphericBackground';
import { AudioControl } from './AudioControl';
import { getAudio } from '@/lib/audio';
import { Badge, Button, Card } from './ui';

const CASE_BG_URLS = [
  '/assets/backgrounds/case-001-bg.png',
  '/assets/backgrounds/case-002-bg.png',
  '/assets/backgrounds/case-003-bg.png',
];

function StarBar({ stars }: { stars: number }) {
  return (
    <span
      aria-label={`${stars} מתוך 5 כוכבים`}
      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            color: i < stars ? 'var(--color-gold-primary)' : 'var(--color-text-faint)',
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

type Status = 'available' | 'solved' | 'locked';

export function CaseSelector() {
  const startCase = useGame((s) => s.startCase);
  const completed = useGame((s) => s.completedCases);

  useEffect(() => {
    CASE_BG_URLS.forEach((url) => {
      const img = new Image();
      img.src = url;
    });

    const audio = getAudio();
    audio?.startAmbient();

    let started = false;
    const trigger = () => {
      if (started) return;
      started = true;
      audio?.startAmbient();
      document.removeEventListener('pointerdown', trigger);
      document.removeEventListener('keydown', trigger);
    };
    document.addEventListener('pointerdown', trigger);
    document.addEventListener('keydown', trigger);

    return () => {
      document.removeEventListener('pointerdown', trigger);
      document.removeEventListener('keydown', trigger);
    };
  }, []);

  const handleReset = () => {
    const ok = window.confirm(
      'לאתחל את האפליקציה?\n\nכל ההתקדמות, ההגדרות והמצב המקומי יימחקו. הדף ייטען מחדש.'
    );
    if (!ok) return;
    try { getAudio()?.stopAllMusic(); } catch {}
    try { localStorage.clear(); sessionStorage.clear(); } catch {}
    window.location.href = window.location.pathname + '?_=' + Date.now();
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AtmosphericBackground imageUrl="/assets/backgrounds/case-selector-bg.png" />

      <header
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-5) var(--pad-desktop)',
        }}
      >
        <AudioControl />
        <Button
          variant="ghost"
          size="md"
          onClick={handleReset}
          title="מוחק את המצב המקומי וטוען את הדף מחדש"
          aria-label="אתחל את האפליקציה"
          style={{ borderStyle: 'dashed' }}
        >
          ↻ אתחול
        </Button>
      </header>

      <div
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 920,
          margin: '0 auto',
          padding: 'var(--space-6) var(--pad-desktop) var(--space-12)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-caption-size)',
              letterSpacing: '0.3em',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            CRIME INSPECTOR
          </p>
          <h1
            className="t-display"
            style={{ margin: 'var(--space-2) 0 var(--space-3)' }}
          >
            חוקר פלילי
          </h1>
          <p
            className="t-h3"
            style={{
              color: 'var(--color-text-secondary)',
              maxWidth: 600,
              margin: '0 auto',
              fontWeight: 'var(--weight-regular)' as unknown as number,
            }}
          >
            תיק אחד, חשוד אחד, עשרים שאלות. החלטה אחת.
          </p>
          <div
            style={{ width: 60, height: 1, background: 'var(--color-gold-dim)', margin: 'var(--space-6) auto 0' }}
            aria-hidden
          />
        </div>

        {/* Case list */}
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-6)' }}>
          {CASE_ORDER.map((id, idx) => {
            const c = CASES[id];
            const stars = completed[id] ?? 0;
            const requiredId = c.lockRequiresCase;
            const requiredSolved = requiredId ? (completed[requiredId] ?? 0) >= 3 : true;
            const locked = !!requiredId && !requiredSolved;
            const solved = stars > 0;
            const status: Status = locked ? 'locked' : solved ? 'solved' : 'available';
            const caseNum = c.id.replace('case-', '');
            const lockedMsg = locked && requiredId
              ? `פתרו את "${CASES[requiredId]?.title ?? requiredId}" כדי לפתוח תיק זה`
              : '';

            return (
              <li
                key={id}
                className="animate-stagger"
                style={{ animationDelay: `${idx * 80}ms`, listStyle: 'none' }}
              >
                <Card
                  surface={locked ? 'surface-2' : 'paper'}
                  padding="none"
                  emphasized={solved}
                  style={{
                    minHeight: 220,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-8)',
                    color: locked ? 'var(--color-text-muted)' : 'var(--color-paper-ink)',
                    boxShadow: locked ? 'none' : 'var(--shadow-panel)',
                    border: locked ? '1px dashed var(--color-border-subtle)' : '1px solid transparent',
                    filter: locked ? 'grayscale(0.6)' : 'none',
                  }}
                >
                  {/* Top row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-body-sm-size)',
                        letterSpacing: '0.1em',
                        color: locked ? 'var(--color-text-muted)' : 'var(--color-paper-ink-secondary)',
                      }}
                    >
                      תיק {caseNum}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      {solved && <StarBar stars={stars} />}
                      {status === 'available' && <Badge variant="neutral">פתוח</Badge>}
                      {status === 'solved' && <Badge variant="success">הושלם</Badge>}
                      {status === 'locked' && <Badge variant="locked" leading={<span aria-hidden>🔒</span>}>נעול</Badge>}
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className="t-h1"
                    style={{
                      margin: 'var(--space-2) 0 var(--space-1)',
                      color: locked ? 'var(--color-text-muted)' : 'var(--color-paper-ink)',
                    }}
                  >
                    {c.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 'var(--text-body-size)',
                      lineHeight: 'var(--text-body-line)',
                      color: locked
                        ? 'var(--color-text-muted)'
                        : 'rgba(7, 9, 13, 0.75)',
                      margin: 0,
                      maxWidth: '60ch',
                    }}
                  >
                    {c.shortDescription ?? c.brief.slice(0, 120)}
                  </p>

                  {/* Detail row */}
                  <div
                    style={{
                      marginTop: 'auto',
                      display: 'flex',
                      gap: 'var(--space-6)',
                      flexWrap: 'wrap',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-caption-size)',
                      color: locked ? 'var(--color-text-muted)' : 'var(--color-paper-ink-muted)',
                      padding: 'var(--space-4) 0',
                      borderTop: locked
                        ? '1px solid var(--color-border-subtle)'
                        : '1px solid rgba(7, 9, 13, 0.1)',
                      borderBottom: locked
                        ? '1px solid var(--color-border-subtle)'
                        : '1px solid rgba(7, 9, 13, 0.1)',
                    }}
                  >
                    <span>📍 {c.crime.location.split(',')[0]}</span>
                    <span>⏱ {c.estimatedTime ?? '10-15 דקות'}</span>
                    <span>⚙ {c.difficulty ?? 'בינוני'}</span>
                  </div>

                  {/* Action row */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 'var(--space-3)' }}>
                    {locked ? (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-body-sm-size)',
                          color: 'var(--color-text-muted)',
                          fontStyle: 'italic',
                        }}
                      >
                        🔒 {lockedMsg}
                      </span>
                    ) : (
                      <Button variant="primary" onClick={() => startCase(id)}>
                        {solved ? 'שחק שוב ←' : 'פתח תיק ←'}
                      </Button>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>

        <p
          style={{
            marginTop: 'var(--space-10)',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-caption-size)',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.05em',
          }}
        >
          v0.6 — {CASE_ORDER.length} תיקים זמינים
        </p>
      </div>
    </main>
  );
}

'use client';

import { useEffect } from 'react';
import { useGame } from '@/lib/gameState';
import { getCase } from '@/data/cases';
import { AtmosphericBackground } from './AtmosphericBackground';
import { getAudio } from '@/lib/audio';
import { Button, Card } from './ui';

const BG_MAP: Record<string, string> = {
  'case-001': '/assets/backgrounds/case-001-bg.png',
  'case-002': '/assets/backgrounds/case-002-bg.png',
  'case-003': '/assets/backgrounds/case-003-bg.png',
};

export function CaseBrief() {
  const enterInterrogation = useGame((s) => s.enterInterrogation);
  const reset = useGame((s) => s.reset);
  const session = useGame((s) => s.session);
  const c = getCase(session?.caseId);
  const caseNum = c.id.replace('case-', '');

  useEffect(() => {
    getAudio()?.startAmbient();
  }, []);

  const details = [
    { label: 'חשוד מרכזי', value: `${c.suspect.name} · ${c.suspect.occupation}` },
    { label: 'מיקום', value: c.crime.location },
    { label: 'זמן אירוע', value: c.crime.timestamp },
    { label: 'ראיות זמינות', value: `${c.evidence.length} פריטים` },
    { label: 'משך משוער', value: c.estimatedTime ?? '10–15 דקות' },
    { label: 'רמת קושי', value: c.difficulty ?? 'בינוני' },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'transparent',
        padding: 'var(--space-10) var(--pad-desktop)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <AtmosphericBackground
        imageUrl={BG_MAP[c.id] ?? '/assets/backgrounds/case-selector-bg.png'}
        intensity="normal"
      />
      <div
        className="case-brief-grid animate-fadeIn"
        style={{
          width: '100%',
          maxWidth: 1080,
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 'var(--space-10)',
          alignItems: 'start',
        }}
      >
        {/* Start column — summary + details + actions */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <div>
            <p className="section-header" style={{ marginBottom: 'var(--space-3)' }}>תקציר התיק</p>
            <p
              className="t-body-lg"
              style={{
                fontFamily: 'var(--font-title)',
                margin: 0,
                textAlign: 'start',
              }}
            >
              {c.brief}
            </p>
          </div>

          <div className="case-brief-details">
            <p className="section-header" style={{ marginBottom: 'var(--space-3)' }}>פרטי תיק</p>
            <Card surface="surface-2" padding="md">
              <dl
                style={{
                  margin: 0,
                  padding: 0,
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  rowGap: 0,
                  columnGap: 'var(--space-5)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'var(--text-body-size)',
                  lineHeight: 'var(--text-body-line)',
                }}
              >
                {details.map(({ label, value }, i) => {
                  const isLast = i === details.length - 1;
                  return (
                    <div key={label} style={{ display: 'contents' }}>
                      <dt
                        style={{
                          color: 'var(--color-text-secondary)',
                          fontWeight: 'var(--weight-semibold)',
                          padding: 'var(--space-3) 0',
                          borderBottom: isLast ? 'none' : '1px solid var(--color-border-subtle)',
                          minWidth: '8rem',
                        }}
                      >
                        {label}
                      </dt>
                      <dd
                        style={{
                          margin: 0,
                          color: 'var(--color-text-primary)',
                          padding: 'var(--space-3) 0',
                          borderBottom: isLast ? 'none' : '1px solid var(--color-border-subtle)',
                        }}
                      >
                        {value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </Card>
          </div>

          {/* Actions */}
          <div
            className="case-brief-actions"
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                getAudio().startInterrogationAudio();
                enterInterrogation();
              }}
            >
              היכנס לחדר החקירות ←
            </Button>
            <Button variant="ghost" onClick={reset}>
              ← חזרה לבחירת תיק
            </Button>
          </div>
        </section>

        {/* End column — paper file */}
        <aside className="case-brief-dossier">
          <Card
            surface="paper"
            padding="lg"
            style={{
              transform: 'rotate(-1deg)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-panel)',
            }}
          >
            {/* Confidential stamp */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: 'var(--space-4)',
                left: 'var(--space-4)',
                border: '2px solid var(--color-stamp-red)',
                color: 'var(--color-stamp-red)',
                fontSize: 'var(--text-caption-size)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 'var(--weight-bold)',
                letterSpacing: '0.2em',
                padding: '2px var(--space-3)',
                transform: 'rotate(12deg)',
                opacity: 0.85,
                textTransform: 'uppercase',
              }}
            >
              סודי
            </div>

            <p
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: 'var(--text-caption-size)',
                letterSpacing: '0.08em',
                color: 'var(--color-paper-ink-secondary)',
                marginBottom: 'var(--space-5)',
                fontWeight: 'var(--weight-medium)',
              }}
            >
              משטרת ישראל ⋅ אגף חקירות
            </p>

            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-h1-size)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-paper-ink)',
                letterSpacing: '0.08em',
                margin: 0,
              }}
            >
              תיק {caseNum}
            </p>

            <h2
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: 'var(--text-h2-size)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--color-paper-ink)',
                marginTop: 'var(--space-1)',
                marginBottom: 0,
                lineHeight: 'var(--text-h2-line)',
              }}
            >
              {c.title}
            </h2>

            <div
              style={{
                borderTop: '1px solid var(--color-paper-rule)',
                margin: 'var(--space-6) 0',
                opacity: 0.3,
              }}
              aria-hidden
            />

            {[
              { label: 'פשע', value: c.crime.type },
              { label: 'מיקום', value: c.crime.location },
              { label: 'זמן', value: c.crime.timestamp },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '4rem 1fr',
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-2)',
                  fontSize: 'var(--text-caption-size)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-paper-ink-muted)',
                    letterSpacing: '0.05em',
                    paddingTop: '2px',
                    fontWeight: 'var(--weight-bold)',
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    color: 'var(--color-paper-ink-strong)',
                    lineHeight: 1.4,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </Card>
        </aside>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .case-brief-grid {
            grid-template-columns: 1fr !important;
            gap: var(--space-8) !important;
          }
        }
      `}</style>
    </main>
  );
}

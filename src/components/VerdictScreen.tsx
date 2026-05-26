'use client';

import { useState } from 'react';
import { useGame } from '@/lib/gameState';
import { getCase } from '@/data/cases';
import { getAudio } from '@/lib/audio';
import { Badge, Button, Card } from './ui';

const MIN_JUSTIFICATION = 80;

export function VerdictScreen() {
  const session = useGame((s) => s.session)!;
  const c = getCase(session.caseId);
  const submitVerdict = useGame((s) => s.submitVerdict);
  const isLoading = useGame((s) => s.isLoading);

  const [decision, setDecision] = useState<'release' | 'charge' | null>(null);
  const [justification, setJustification] = useState('');
  const [cited, setCited] = useState<string[]>([]);
  const caseNum = c.id.replace('case-', '');

  const justOk = justification.trim().length >= MIN_JUSTIFICATION;
  const evidenceOk = decision === 'charge' ? cited.length >= 1 : true;
  const canSubmit = decision !== null && justOk && evidenceOk && !isLoading;

  const toggleCite = (id: string) => {
    setCited((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  // Inline-styled choice "card" function — semantics of a button, look of a Card
  const renderChoiceCard = (kind: 'release' | 'charge') => {
    const selected = decision === kind;
    const isCharge = kind === 'charge';
    const accent = isCharge ? 'var(--color-danger)' : 'var(--color-success)';
    const accentBg = isCharge ? 'var(--color-danger-muted)' : 'rgba(95, 138, 107, 0.12)';

    return (
      <button
        type="button"
        onClick={() => { if (!isLoading) setDecision(kind); }}
        disabled={isLoading}
        aria-pressed={selected}
        style={{
          background: selected ? accentBg : 'var(--color-surface-2)',
          color: 'var(--color-text-primary)',
          border: `1px solid ${selected ? accent : 'var(--color-border-subtle)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          textAlign: 'start',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          transition: 'border-color var(--motion-base) var(--motion-ease), background var(--motion-base) var(--motion-ease)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-h3-size)',
            color: selected ? accent : 'var(--color-text-faint)',
          }}
        >
          {isCharge ? '✕' : '⊘'}
        </span>
        <h3
          className="t-h2"
          style={{ margin: 0 }}
        >
          {isCharge ? 'הגש כתב אישום' : 'שחרר את החשוד'}
        </h3>
        <p className="t-body-sm" style={{ margin: 0 }}>
          {isCharge
            ? `${c.suspect.name} יואשם ב${c.crime.type}. ההחלטה תועבר ליועצת המשפטית.`
            : 'לא הצלחת להוכיח אשמה. החשוד יוצא חופשי.'}
        </p>
      </button>
    );
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-main)',
        padding: 'var(--space-10) var(--pad-desktop)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div className="animate-fadeIn" style={{ width: '100%', maxWidth: 760 }}>
        <p className="section-header" style={{ marginBottom: 'var(--space-2)' }}>
          תיק {caseNum} — {c.title}
        </p>

        <h1 className="t-display" style={{ margin: 0 }}>ההכרעה</h1>

        <p
          className="t-h3"
          style={{
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--space-3)',
            fontWeight: 'var(--weight-regular)' as unknown as number,
          }}
        >
          אין חזרה. החלטה זו תסגור את התיק.
        </p>

        {/* Choice cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-5)',
            marginTop: 'var(--space-8)',
          }}
        >
          {renderChoiceCard('release')}
          {renderChoiceCard('charge')}
        </div>

        {/* Form */}
        {decision && (
          <div className="animate-fadeIn" style={{ marginTop: 'var(--space-8)' }}>
            {/* Justification */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <p className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
                נימוק — מינ׳ {MIN_JUSTIFICATION} תווים ({justification.trim().length}/{MIN_JUSTIFICATION})
              </p>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                aria-label="נימוק להחלטה"
                placeholder={
                  decision === 'charge'
                    ? 'נמק על סמך אילו ראיות אתה מגיש כתב אישום…'
                    : 'נמק מדוע אין מספיק ראיות לכתב אישום…'
                }
                style={{
                  width: '100%',
                  height: 280,
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'var(--text-body-size)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  resize: 'vertical',
                  lineHeight: 'var(--text-body-line)',
                  transition: 'border-color var(--motion-base) var(--motion-ease)',
                }}
                onFocus={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--color-gold-primary)'; }}
                onBlur={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--color-border-strong)'; }}
              />
            </div>

            {/* Evidence checklist */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <p className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
                ראיות תומכות
                {decision === 'charge' && (
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 'var(--weight-regular)' as unknown as number,
                      fontSize: 'var(--text-caption-size)',
                      color: 'var(--color-text-muted)',
                      marginInlineStart: 'var(--space-2)',
                      textTransform: 'none',
                      letterSpacing: 0,
                    }}
                  >
                    (לפחות אחת חובה לכתב אישום)
                  </span>
                )}
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  overflowX: 'auto',
                  paddingBottom: 'var(--space-2)',
                }}
              >
                {c.evidence.map((ev) => {
                  const isCited = cited.includes(ev.id);
                  return (
                    <button
                      key={ev.id}
                      onClick={() => toggleCite(ev.id)}
                      aria-pressed={isCited}
                      aria-label={`${isCited ? 'בטל ציטוט' : 'צטט'} ראיה: ${ev.label}`}
                      style={{
                        flexShrink: 0,
                        width: 140,
                        background: isCited ? 'var(--color-gold-glow)' : 'var(--color-surface-2)',
                        border: `1px solid ${isCited ? 'var(--color-gold-primary)' : 'var(--color-border-subtle)'}`,
                        borderRadius: 'var(--radius-sm)',
                        padding: 'var(--space-2)',
                        cursor: 'pointer',
                        textAlign: 'start',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)',
                        transition: 'all var(--motion-base) var(--motion-ease)',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ev.imageAsset}
                        alt={ev.label}
                        style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }}
                      />
                      <p
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: 'var(--text-caption-size)',
                          color: isCited ? 'var(--color-gold-primary)' : 'var(--color-text-secondary)',
                          margin: 0,
                          lineHeight: 1.3,
                        }}
                      >
                        {ev.label}
                      </p>
                      <Badge variant={isCited ? 'gold' : 'neutral'}>
                        {isCited ? '✓ צוטטה' : 'לסימון'}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <Button
              variant={decision === 'charge' ? 'danger' : 'primary'}
              size="lg"
              width="full"
              loading={isLoading}
              disabled={!canSubmit}
              onClick={() => {
                getAudio().sfx_play('stamp');
                submitVerdict(decision, justification.trim(), cited);
              }}
            >
              {isLoading
                ? 'שולח...'
                : `הגש הכרעה סופית — ${decision === 'charge' ? 'כתב אישום' : 'שחרור'} →`}
            </Button>

            {/* Validation hints */}
            <div style={{ marginTop: 'var(--space-3)', textAlign: 'center' }}>
              {!justOk && (
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'var(--text-caption-size)',
                    color: 'var(--color-text-muted)',
                    margin: 0,
                  }}
                >
                  נמק לפחות {MIN_JUSTIFICATION} תווים.
                </p>
              )}
              {decision === 'charge' && !evidenceOk && (
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'var(--text-caption-size)',
                    color: 'var(--color-text-muted)',
                    marginTop: 'var(--space-1)',
                    margin: 0,
                  }}
                >
                  ציין לפחות ראיה אחת לתמיכה בכתב האישום.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useGame, MAX_MESSAGES } from '@/lib/gameState';
import { getCase } from '@/data/cases';
import type { Evidence, EmotionalState } from '@/lib/types';
import { MessageBubble, TypingBubble } from './MessageBubble';
import { EvidenceDrawer } from './EvidenceDrawer';
import { EvidenceLightbox } from './EvidenceLightbox';
import { AssistantPanel } from './AssistantPanel';
import { TopBar, TopBarCaseIdentity, TopBarMessagesCounter } from './TopBar';
import { AudioControl } from './AudioControl';
import { Badge, Button, InputGroup, SystemMessage } from './ui';
import { getAudio } from '@/lib/audio';

type StateBadgeVariant = 'neutral' | 'gold' | 'danger';

const STATE_META: Record<
  EmotionalState,
  { label: string; variant: StateBadgeVariant; pulse: boolean }
> = {
  neutral:   { label: 'רגוע',   variant: 'neutral', pulse: false },
  defensive: { label: 'מתגונן', variant: 'neutral', pulse: false },
  nervous:   { label: 'לחוץ',   variant: 'gold',    pulse: true },
  angry:     { label: 'כועס',   variant: 'gold',    pulse: true },
  exhausted: { label: 'מותש',   variant: 'danger',  pulse: false },
  broken:    { label: 'נשבר',   variant: 'danger',  pulse: true },
};

const SUGGESTION_CHIPS = [
  'איפה היית בלילה?',
  'ספר לי על הקשר שלך לקורבן.',
];

export function InterrogationRoom() {
  const session = useGame((s) => s.session)!;
  const c = getCase(session.caseId);
  const caseNum = c.id.replace('case-', '');
  const isLoading = useGame((s) => s.isLoading);
  const sendMessage = useGame((s) => s.sendMessage);
  const openDrawer = useGame((s) => s.openDrawer);
  const goToVerdict = useGame((s) => s.goToVerdict);
  const stageEvidence = useGame((s) => s.stageEvidence);
  const reset = useGame((s) => s.reset);
  const openLightbox = useGame((s) => s.openLightbox);

  const text = useGame((s) => s.inputDraft);
  const setText = useGame((s) => s.setInputDraft);
  const openAssistant = useGame((s) => s.openAssistant);
  const assistantLoading = useGame((s) => s.assistantLoading);
  const assistantUsageCount = session.assistantUsageCount ?? 0;

  const isDev = process.env.NODE_ENV === 'development';

  const [tooltipShown, setTooltipShown] = useState(false);
  const [evidenceFlash, setEvidenceFlash] = useState(false);
  const [pillFlash, setPillFlash] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const prevSuspectState = useRef(session.suspectState);
  const prevMsgCount = useRef(session.messages.length);
  const prevStaged = useRef(session.stagedEvidence);
  const prevPresentedLen = useRef(session.evidencePresented.length);

  // ── Audio (idempotent) ───────────────────────────────────────
  useEffect(() => {
    getAudio().startInterrogationAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (session.suspectState !== prevSuspectState.current) {
      const audio = getAudio();
      audio.setSuspectState(session.suspectState);
      audio.sfx_play('state');
      setPillFlash(true);
      const t = setTimeout(() => setPillFlash(false), 700);
      prevSuspectState.current = session.suspectState;
      return () => clearTimeout(t);
    }
  }, [session.suspectState]);

  useEffect(() => {
    const count = session.messages.length;
    if (count > prevMsgCount.current) {
      const last = session.messages[count - 1];
      if (last?.role === 'suspect') getAudio().sfx_play('receive');
    }
    prevMsgCount.current = count;
  }, [session.messages.length]); // eslint-disable-line

  useEffect(() => {
    if (session.stagedEvidence && session.stagedEvidence !== prevStaged.current) {
      getAudio().sfx_play('evidence');
    }
    prevStaged.current = session.stagedEvidence;
  }, [session.stagedEvidence]);

  useEffect(() => {
    const newLen = session.evidencePresented.length;
    if (newLen > prevPresentedLen.current) {
      setEvidenceFlash(true);
      const t = setTimeout(() => setEvidenceFlash(false), 500);
      prevPresentedLen.current = newLen;
      return () => clearTimeout(t);
    }
    prevPresentedLen.current = newLen;
  }, [session.evidencePresented.length]);

  // Ctrl+E opens evidence; E alone if not in input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          openDrawer();
          return;
        }
        const tag = (document.activeElement as HTMLElement)?.tagName;
        if (tag === 'TEXTAREA' || tag === 'INPUT') return;
        openDrawer();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openDrawer]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [session.messages.length, isLoading]);

  const stagedEvidence: Evidence | null = session.stagedEvidence
    ? c.evidence.find((e) => e.id === session.stagedEvidence) ?? null
    : null;

  const lastPresentedId = session.evidencePresented[session.evidencePresented.length - 1];
  const lastPresented: Evidence | null = lastPresentedId
    ? c.evidence.find((e) => e.id === lastPresentedId) ?? null
    : null;

  const detectiveMessageCount = session.messages.filter((m) => m.role === 'detective').length;
  const verdictUnlocked = detectiveMessageCount >= 3;
  const canSend = !isLoading && text.trim().length > 0 && session.messagesRemaining > 0;

  const submit = () => {
    if (!canSend) return;
    const t = text.trim();
    setText('');
    getAudio().sfx_play('send');
    sendMessage(t);
  };

  const handleVerdictClick = () => {
    if (!verdictUnlocked) {
      setTooltipShown(true);
      setTimeout(() => setTooltipShown(false), 2500);
      return;
    }
    goToVerdict();
  };

  const handleDevReset = () => {
    if (window.confirm('לאפס את החקירה? כל ההתקדמות תאבד.')) {
      reset();
      window.location.reload();
    }
  };

  const stateMeta = STATE_META[session.suspectState];
  const portraitSrc = `/assets/${c.id}/${c.suspect.portraitBase}-${session.suspectState}.png`;
  const suspectGender = c.suspect.gender;
  const inputPlaceholder = isLoading
    ? `${suspectGender === 'female' ? 'החשודה' : 'החשוד'} ${suspectGender === 'female' ? 'חושבת' : 'חושב'}…`
    : session.messagesRemaining <= 0
    ? 'לא נותרו שאלות. הגש החלטה.'
    : `כתוב שאלה ל${suspectGender === 'female' ? 'חשודה' : 'חשוד'}…`;

  // Consecutive-message grouping: hide label when speaker matches previous.
  const grouped = useMemo(() => {
    return session.messages.map((m, i) => {
      const prev = session.messages[i - 1];
      const hideLabel = prev?.role === m.role;
      return { m, hideLabel, i };
    });
  }, [session.messages]);

  return (
    <main
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-main)',
        overflow: 'hidden',
      }}
    >
      <TopBar
        start={<TopBarCaseIdentity caseNum={caseNum} title={c.title} />}
        center={<TopBarMessagesCounter remaining={session.messagesRemaining} total={MAX_MESSAGES} />}
        end={
          <>
            <AudioControl />
            <Button
              variant="secondary"
              onClick={openDrawer}
              aria-label="פתח את תיק הראיות"
              title="תיק ראיות (Ctrl+E)"
              leadingIcon={<span aria-hidden>⊟</span>}
              trailingIcon={
                <span
                  style={{
                    background: 'var(--color-gold-glow)',
                    color: 'var(--color-gold-primary)',
                    padding: '2px var(--space-2)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-caption-size)',
                  }}
                >
                  {session.evidencePresented.length}/{c.evidence.length}
                </span>
              }
            >
              תיק ראיות
            </Button>

            {isDev && session.messages.length > 0 && (
              <Button
                variant="ghost"
                size="md"
                onClick={handleDevReset}
                style={{ borderStyle: 'dashed' }}
                title="dev: אפס חקירה"
              >
                אפס
              </Button>
            )}

            <div style={{ position: 'relative' }}>
              <Button
                variant="danger"
                size="md"
                onClick={handleVerdictClick}
                disabled={!verdictUnlocked}
                title={verdictUnlocked ? 'הגש החלטה סופית' : 'חקור את החשוד לפחות 3 פעמים'}
              >
                הגש החלטה
              </Button>
              {tooltipShown && (
                <div
                  role="tooltip"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + var(--space-2))',
                    insetInlineStart: 0,
                    background: 'var(--color-surface-3)',
                    border: '1px solid var(--color-border-strong)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'var(--text-body-sm-size)',
                    padding: 'var(--space-2) var(--space-3)',
                    whiteSpace: 'nowrap',
                    zIndex: 'var(--z-overlay)' as unknown as number,
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  חקור את החשוד לפחות 3 פעמים
                </div>
              )}
            </div>
          </>
        }
      />

      {/* ── MAIN — 60/40 split ──────────────────────────────── */}
      <div className="ir-main" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Suspect column — RTL right = first in DOM (40%) */}
        <aside
          className="ir-suspect"
          style={{
            width: '40%',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--color-bg-main)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={session.suspectState}
            src={portraitSrc}
            alt={`${c.suspect.name} — ${stateMeta.label}`}
            className="animate-fadeIn"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
            }}
          />
          <div className={`stress-frame stress-${session.suspectState} ${evidenceFlash ? 'evidence-flash' : ''}`} />

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 240,
              background: 'linear-gradient(to top, var(--color-bg-main) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <p
              className="t-h1"
              style={{ margin: 0, lineHeight: 1.1 }}
            >
              {c.suspect.name}
            </p>
            <Badge
              variant={stateMeta.variant}
              leading={<span className={stateMeta.pulse ? 'animate-pulse-dot' : ''} aria-hidden style={{
                width: 8, height: 8, borderRadius: 'var(--radius-pill)', background: 'currentColor', display: 'inline-block',
              }} />}
              aria-live="polite"
              className={pillFlash ? 'flash' : undefined}
            >
              מצב: {stateMeta.label}
            </Badge>
          </div>
        </aside>

        {/* Chat column — LEFT in RTL (60%, min 560px) */}
        <section
          className="ir-chat"
          style={{
            flex: 1,
            minWidth: 560,
            display: 'flex',
            flexDirection: 'column',
            borderInlineStart: '1px solid var(--color-border-subtle)',
            overflow: 'hidden',
          }}
        >
          {/* Latest-evidence sticky strip — clickable to re-inspect */}
          {lastPresented && (
            <button
              onClick={() => openLightbox(lastPresented.id)}
              className="latest-evidence-strip"
              title="פתח את הראיה לבדיקה"
            >
              <span aria-hidden>⊢</span>
              <span>ראיה אחרונה שהוצגה: {lastPresented.label}</span>
              <span style={{ marginInlineStart: 'auto', opacity: 0.7 }} aria-hidden>🔍</span>
            </button>
          )}

          {/* Scrollable messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 'var(--space-6) var(--space-8)',
            }}
          >
            <div
              style={{
                maxWidth: 760,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
              }}
            >
              {session.messages.length === 0 && !isLoading && (
                <div style={{ padding: 'var(--space-3) 0 var(--space-6)' }}>
                  <SystemMessage>
                    {c.suspect.name} {suspectGender === 'female' ? 'יושבת' : 'יושב'} מולך.{' '}
                    {suspectGender === 'female' ? 'היא' : 'הוא'} נראה רגוע, אבל נמנע מקשר עין.
                  </SystemMessage>

                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 'var(--text-body-sm-size)',
                      color: 'var(--color-text-muted)',
                      margin: 'var(--space-4) 0 var(--space-2)',
                      letterSpacing: '0.04em',
                      textAlign: 'center',
                    }}
                  >
                    שאלות פתיחה מוצעות:
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-2)',
                      maxWidth: 480,
                      margin: '0 auto',
                    }}
                  >
                    {SUGGESTION_CHIPS.map((chip) => (
                      <Button
                        key={chip}
                        variant="secondary"
                        size="md"
                        width="full"
                        onClick={() => setText(chip)}
                        style={{ justifyContent: 'flex-start' }}
                      >
                        {chip}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {grouped.map(({ m, hideLabel, i }) => {
                const ev = m.evidencePresented
                  ? c.evidence.find((e) => e.id === m.evidencePresented)
                  : undefined;
                return (
                  <MessageBubble
                    key={`${m.timestamp}-${i}`}
                    message={m}
                    evidence={ev}
                    suspectName={c.suspect.name}
                    suspectGender={suspectGender}
                    hideLabel={hideLabel}
                  />
                );
              })}
              {isLoading && <TypingBubble suspectName={c.suspect.name} suspectGender={suspectGender} />}

              {session.messagesRemaining <= 0 && (
                <SystemMessage icon="⚐">
                  השאלות נגמרו. הגיע הזמן להגיש החלטה.
                </SystemMessage>
              )}
            </div>
          </div>

          {/* ── Input area ────────────────────────────────── */}
          <div
            style={{
              flexShrink: 0,
              background: 'var(--color-bg-main)',
              borderTop: '1px solid var(--color-border-subtle)',
              padding: 'var(--space-5) var(--space-8)',
            }}
          >
            <div
              style={{
                maxWidth: 760,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              {stagedEvidence && (
                <div
                  style={{
                    background: 'var(--color-gold-glow)',
                    border: '1px solid var(--color-gold-dim)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--space-3)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 'var(--text-body-sm-size)',
                      color: 'var(--color-gold-primary)',
                    }}
                  >
                    ⊢ יוצג בשאלה הבאה: <strong>{stagedEvidence.label}</strong>
                  </span>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => stageEvidence(null)}
                    aria-label="הסר ראיה מסומנת"
                    style={{ minHeight: 32, padding: '0 var(--space-3)' }}
                  >
                    ✕
                  </Button>
                </div>
              )}

              <InputGroup
                value={text}
                onChange={setText}
                onSubmit={submit}
                placeholder={inputPlaceholder}
                ariaLabel="כתוב שאלה לחשוד"
                disabled={session.messagesRemaining <= 0}
                loading={isLoading}
                leadingSlot={
                  session.messages.length > 0 && session.messagesRemaining > 0 ? (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={openAssistant}
                      disabled={assistantLoading || isLoading}
                      aria-label="פתח את עוזר החקירה"
                      leadingIcon={<span aria-hidden>💡</span>}
                      trailingIcon={
                        assistantUsageCount > 0 ? (
                          <span className="assistant-usage-badge">×{assistantUsageCount}</span>
                        ) : null
                      }
                    >
                      {assistantLoading ? 'חושב…' : 'עוזר חקירה'}
                    </Button>
                  ) : null
                }
              />
            </div>
          </div>
        </section>
      </div>

      <EvidenceDrawer />
      <EvidenceLightbox />
      <AssistantPanel />

      <style>{`
        @media (max-width: 1024px) {
          .ir-main { flex-direction: column !important; }
          .ir-suspect { width: 100% !important; height: 240px; }
          .ir-chat { min-width: 0 !important; border-inline-start: none !important; border-top: 1px solid var(--color-border-subtle); }
        }
      `}</style>
    </main>
  );
}

'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Button } from './Button';

export interface InputGroupProps {
  /** Controlled value. */
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  helperText?: string;
  /** Hidden but accessible label for screen readers. */
  ariaLabel: string;
  disabled?: boolean;
  /** While true: textarea is locked and the send button shows a spinner. */
  loading?: boolean;
  maxLength?: number;
  /** Optional element rendered before the textarea (e.g. assistant button). */
  leadingSlot?: React.ReactNode;
  /** Submit button label. Defaults to "שלח". */
  submitLabel?: string;
  /** id for the textarea (for label-for associations). */
  id?: string;
}

export interface InputGroupHandle {
  focus: () => void;
}

/**
 * Textarea + send-button as a single bordered, focus-ringed unit.
 *
 * - Default height: --input-height (68px)
 * - Auto-grows up to --input-max-height (140px) then scrolls internally
 * - Enter sends, Shift+Enter inserts newline
 */
export const InputGroup = forwardRef<InputGroupHandle, InputGroupProps>(function InputGroup(
  {
    value,
    onChange,
    onSubmit,
    placeholder,
    helperText = 'Enter לשליחה · Shift+Enter לשורה חדשה',
    ariaLabel,
    disabled = false,
    loading = false,
    maxLength = 500,
    leadingSlot,
    submitLabel = 'שלח',
    id = 'input-group-textarea',
  },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  useImperativeHandle(ref, () => ({ focus: () => textareaRef.current?.focus() }), []);

  // Auto-grow up to max
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const max = 140;
    const next = Math.min(el.scrollHeight, max);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !loading && value.trim().length > 0) onSubmit();
    }
  };

  const canSubmit = !disabled && !loading && value.trim().length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: leadingSlot ? 'auto 1fr auto' : '1fr auto',
          alignItems: 'stretch',
          gap: 'var(--space-3)',
          border: `1px solid ${focused ? 'var(--color-gold-primary)' : 'var(--color-border-strong)'}`,
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface-2)',
          padding: 'var(--space-2)',
          transition: 'border-color var(--motion-base) var(--motion-ease)',
        }}
      >
        {leadingSlot && <div style={{ alignSelf: 'flex-end' }}>{leadingSlot}</div>}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor={id} className="sr-only">{ariaLabel}</label>
          <textarea
            id={id}
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled || loading}
            placeholder={placeholder}
            aria-label={ariaLabel}
            maxLength={maxLength}
            rows={2}
            style={{
              width: '100%',
              minHeight: 'var(--input-height)',
              maxHeight: 'var(--input-max-height)',
              resize: 'none',
              background: 'transparent',
              border: 'none',
              borderRadius: 0,
              padding: 'var(--space-3) var(--space-4)',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-body-size)',
              lineHeight: 'var(--text-body-line)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ alignSelf: 'flex-end' }}>
          <Button
            size="lg"
            variant="primary"
            onClick={onSubmit}
            disabled={!canSubmit}
            loading={loading}
            aria-label="שלח את ההודעה"
          >
            {submitLabel}
          </Button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-caption-size)',
          color: 'var(--color-text-muted)',
        }}
      >
        <span>{helperText}</span>
        <span aria-live="polite">{value.length}/{maxLength}</span>
      </div>
    </div>
  );
});

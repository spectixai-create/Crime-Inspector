import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameSession,
  Message,
  EmotionalState,
  EvaluateResponse,
  AssistantSuggestion,
} from './types';
import { CASES } from '@/data/cases';

const MAX_MESSAGES = 20;

interface GameStore {
  session: GameSession | null;
  isLoading: boolean;
  drawerOpen: boolean;
  lightboxEvidenceId: string | null;
  completedCases: Record<string, number>; // caseId -> stars (best result)
  // Investigation Assistant
  assistantOpen: boolean;
  assistantLoading: boolean;
  assistantError: string | null;
  assistantSuggestions: AssistantSuggestion[];
  inputDraft: string; // controlled textarea binding (so the assistant can write into it)
  startCase: (caseId: string) => void;
  enterInterrogation: () => void;
  sendMessage: (text: string) => Promise<void>;
  stageEvidence: (id: string | null) => void;
  markEvidenceViewed: (id: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openLightbox: (id: string) => void;
  closeLightbox: () => void;
  goToVerdict: () => void;
  submitVerdict: (
    decision: 'release' | 'charge',
    justification: string,
    evidenceCited: string[]
  ) => Promise<void>;
  openAssistant: () => Promise<void>;
  closeAssistant: () => void;
  fillFromSuggestion: (text: string) => void;
  setInputDraft: (text: string) => void;
  reset: () => void;
}

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      session: null,
      isLoading: false,
      drawerOpen: false,
      lightboxEvidenceId: null,
      completedCases: {},
      assistantOpen: false,
      assistantLoading: false,
      assistantError: null,
      assistantSuggestions: [],
      inputDraft: '',

      startCase: (caseId) => {
        // Guard: ensure case exists
        if (!CASES[caseId]) {
          console.warn(`Unknown caseId: ${caseId}, falling back to case-001`);
          caseId = 'case-001';
        }
        set({
          drawerOpen: false,
          lightboxEvidenceId: null,
          assistantOpen: false,
          assistantLoading: false,
          assistantError: null,
          assistantSuggestions: [],
          inputDraft: '',
          session: {
            caseId,
            startedAt: Date.now(),
            messages: [],
            evidencePresented: [],
            evidenceViewed: [],
            suspectState: 'neutral',
            messagesRemaining: MAX_MESSAGES,
            status: 'briefing',
            stagedEvidence: null,
            secretRevealed: false,
            assistantUsageCount: 0,
          },
        });
      },

      enterInterrogation: () => {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, status: 'interrogating' } });
      },

      goToVerdict: () => {
        const s = get().session;
        if (!s) return;
        set({ drawerOpen: false, session: { ...s, status: 'verdict' } });
      },

      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),

      openLightbox: (id) => {
        const s = get().session;
        if (s && !s.evidenceViewed.includes(id)) {
          set({
            lightboxEvidenceId: id,
            session: { ...s, evidenceViewed: [...s.evidenceViewed, id] },
          });
        } else {
          set({ lightboxEvidenceId: id });
        }
      },
      closeLightbox: () => set({ lightboxEvidenceId: null }),

      sendMessage: async (text) => {
        const s = get().session;
        if (!s || s.status !== 'interrogating' || s.messagesRemaining <= 0) return;

        const staged = s.stagedEvidence;

        const detectiveMessage: Message = {
          role: 'detective',
          content: text,
          evidencePresented: staged ?? undefined,
          timestamp: Date.now(),
        };

        const updatedMessages = [...s.messages, detectiveMessage];
        const updatedEvidencePresented = staged
          ? [...s.evidencePresented, staged]
          : s.evidencePresented;

        set({
          isLoading: true,
          inputDraft: '',
          session: {
            ...s,
            messages: updatedMessages,
            evidencePresented: updatedEvidencePresented,
            stagedEvidence: null,
            messagesRemaining: s.messagesRemaining - 1,
          },
        });

        try {
          const res = await fetch('/api/interrogate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              caseId: s.caseId,
              messages: s.messages, // history before this new message
              newMessage: text,
              evidencePresented: staged,
            }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${res.status}`);
          }

          const data = await res.json();

          const suspectMessage: Message = {
            role: 'suspect',
            content: data.reply,
            timestamp: Date.now(),
          };

          const cur = get().session!;
          set({
            isLoading: false,
            session: {
              ...cur,
              messages: [...cur.messages, suspectMessage],
              suspectState: (data.newState as EmotionalState) || cur.suspectState,
              secretRevealed:
                cur.secretRevealed === true || data.secretRevealed === true,
            },
          });
        } catch (err) {
          console.error('sendMessage failed', err);
          const cur = get().session;
          if (!cur) {
            set({ isLoading: false });
            return;
          }
          const errDetail = (err as Error).message ?? String(err);
          const suspectMessage: Message = {
            role: 'suspect',
            content:
              process.env.NODE_ENV === 'development'
                ? `[שגיאת API: ${errDetail}]`
                : '[החשוד נועץ בך מבט שותק. (שגיאת רשת או API — נסה שוב.)]',
            timestamp: Date.now(),
          };
          set({
            isLoading: false,
            session: {
              ...cur,
              messages: [...cur.messages, suspectMessage],
            },
          });
        }
      },

      stageEvidence: (id) => {
        const s = get().session;
        if (!s) return;
        if (id && s.evidencePresented.includes(id)) return;
        set({ session: { ...s, stagedEvidence: id } });
      },

      markEvidenceViewed: (id) => {
        const s = get().session;
        if (!s || s.evidenceViewed.includes(id)) return;
        set({ session: { ...s, evidenceViewed: [...s.evidenceViewed, id] } });
      },

      submitVerdict: async (decision, justification, evidenceCited) => {
        const s = get().session;
        if (!s) return;

        const withVerdict: GameSession = {
          ...s,
          status: 'verdict',
          verdict: { decision, justification, evidenceCited },
        };
        set({ isLoading: true, session: withVerdict });

        try {
          const res = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session: withVerdict }),
          });
          const result: EvaluateResponse = await res.json();

          // Update completedCases if the verdict is correct (and best-so-far)
          const completed = { ...get().completedCases };
          if (result.correct) {
            const prev = completed[withVerdict.caseId] ?? 0;
            if (result.stars > prev) {
              completed[withVerdict.caseId] = result.stars;
            }
          }

          set({
            isLoading: false,
            completedCases: completed,
            session: { ...withVerdict, status: 'completed', result },
          });
        } catch (err) {
          console.error('submitVerdict failed', err);
          set({ isLoading: false });
        }
      },

      openAssistant: async () => {
        const s = get().session;
        if (!s) return;
        set({
          assistantOpen: true,
          assistantLoading: true,
          assistantError: null,
          assistantSuggestions: [],
        });
        try {
          const res = await fetch('/api/assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              caseId: s.caseId,
              messages: s.messages,
              evidencePresented: s.evidencePresented,
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${res.status}`);
          }
          const data = await res.json();
          if (!Array.isArray(data.suggestions) || data.suggestions.length !== 4) {
            throw new Error('Bad suggestions payload');
          }
          // Only increment usage on SUCCESS
          const cur = get().session!;
          set({
            assistantLoading: false,
            assistantError: null,
            assistantSuggestions: data.suggestions,
            session: {
              ...cur,
              assistantUsageCount: (cur.assistantUsageCount ?? 0) + 1,
            },
          });
        } catch (err) {
          console.error('openAssistant failed', err);
          set({
            assistantLoading: false,
            assistantSuggestions: [],
            assistantError: (err as Error).message || 'העוזר אינו זמין כעת',
          });
        }
      },

      closeAssistant: () =>
        set({
          assistantOpen: false,
          assistantSuggestions: [],
          assistantError: null,
        }),

      fillFromSuggestion: (text) =>
        set({
          inputDraft: text,
          assistantOpen: false,
          assistantSuggestions: [],
          assistantError: null,
        }),

      setInputDraft: (text) => set({ inputDraft: text }),

      reset: () =>
        set({
          session: null,
          drawerOpen: false,
          isLoading: false,
          lightboxEvidenceId: null,
          assistantOpen: false,
          assistantLoading: false,
          assistantError: null,
          assistantSuggestions: [],
          inputDraft: '',
          // completedCases intentionally preserved
        }),
    }),
    {
      name: 'crime-inspector-session',
      partialize: (s) => ({
        session: s.session,
        completedCases: s.completedCases,
      }),
    }
  )
);

export { MAX_MESSAGES };

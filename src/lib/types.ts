export type EmotionalState =
  | 'neutral'
  | 'defensive'
  | 'nervous'
  | 'angry'
  | 'exhausted'
  | 'broken';

export type EvidenceType =
  | 'physical'
  | 'document'
  | 'video'
  | 'testimony'
  | 'financial';

export type EvidenceWeight = 'circumstantial' | 'strong' | 'conclusive';

export interface Evidence {
  id: string;
  type: EvidenceType;
  label: string;
  description: string; // Shown in drawer
  detail: string;      // Sent to LLM when presented
  imageAsset: string;
  weight: EvidenceWeight;
}

export interface CaseData {
  id: string;
  title: string;
  brief: string;
  shortDescription: string;
  difficulty: string;
  estimatedTime: string;
  lockRequiresCase?: string;
  crime: {
    type: string;
    summary: string;
    location: string;
    timestamp: string;
  };
  suspect: {
    name: string;
    age: number;
    occupation: string;
    portraitBase: string;
    gender?: 'male' | 'female';
  };
  groundTruth: {
    isGuilty: boolean;
    actualSequence: string;
    coverStory: string;
    sideSecret?: string;
    personality?: string; // NEW — overrides the generic personality block in the suspect prompt
    breakingPoints: string[];
  };
  evidence: Evidence[];
  contradictionTriggers: {
    statementPattern: string;
    refutedBy: string[];
  }[];
  conclusiveEvidenceIds: string[];
}

export interface Message {
  role: 'detective' | 'suspect';
  content: string;
  evidencePresented?: string;
  timestamp: number;
}

export type SessionStatus =
  | 'idle'
  | 'briefing'
  | 'interrogating'
  | 'verdict'
  | 'completed';

export interface GameSession {
  caseId: string;
  startedAt: number;
  messages: Message[];
  evidencePresented: string[];
  evidenceViewed: string[];
  suspectState: EmotionalState;
  messagesRemaining: number;
  status: SessionStatus;
  stagedEvidence: string | null;
  verdict?: {
    decision: 'release' | 'charge';
    justification: string;
    evidenceCited: string[];
  };
  result?: EvaluateResponse;
  secretRevealed?: boolean; // tracks whether the side secret was uncovered (innocent cases)
  assistantUsageCount: number; // how many times the investigation assistant was successfully invoked
}

export interface AssistantSuggestion {
  text: string;
  type: 'question' | 'direction';
}

export interface AssistantRequest {
  caseId: string;
  messages: Message[];
  evidencePresented: string[];
}

export interface AssistantResponse {
  suggestions: AssistantSuggestion[]; // exactly 4 items
}

export interface InterrogateRequest {
  caseId: string;
  messages: Message[];
  newMessage: string;
  evidencePresented?: string | null;
}

export interface InterrogateResponse {
  reply: string;
  newState: EmotionalState;
  confessed: boolean;
  secretRevealed: boolean; // innocent suspects may reveal a side secret under pressure
}

export interface EvaluateRequest {
  session: GameSession;
}

export interface EvaluateResponse {
  correct: boolean;
  stars: 0 | 1 | 2 | 3 | 4 | 5;
  summary: string;
  truthReveal: string;
  breakdown: {
    verdictCorrect: boolean;
    evidenceQuality: 'insufficient' | 'partial' | 'sufficient' | 'conclusive';
    contradictionsCaught: number;
    confessionExtracted: boolean;
  };
}

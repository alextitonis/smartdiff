// Core types for the application

export type FocusArea = 'bugs' | 'security' | 'performance' | 'style' | 'suggestions' | 'explanations';

export type OutputType = 'terminal' | 'markdown';

export type ProviderName = 'openai' | 'anthropic' | 'openrouter' | 'ollama';

export interface Config {
  provider: ProviderName;
  model: string;
  focus: FocusArea[];
  output: OutputType;
  ignore?: string[];
  providers: {
    openai?: {
      apiKey: string;
    };
    anthropic?: {
      apiKey: string;
    };
    openrouter?: {
      apiKey: string;
    };
    ollama?: {
      baseUrl?: string;
    };
  };
}

export interface ReviewOptions {
  focus?: string;
  output?: OutputType;
  file?: string;
  diff?: string;
  provider?: ProviderName;
  model?: string;
  failOn?: string;
}

export interface Issue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: FocusArea;
  file: string;
  line?: number;
  description: string;
  suggestion?: string;
}

export interface ReviewResult {
  summary: string;
  issues: Issue[];
  suggestions: string[];
}

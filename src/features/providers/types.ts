export type ProviderId = 'openai' | 'anthropic' | 'gemini';

export interface ProviderExtractionInput {
  apiKey: string;
  model: string;
  documentText: string;
  jsonSchema: Record<string, unknown>;
}

export interface ProviderExtractionResult {
  data: Record<string, unknown>;
  rawText: string;
}

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export interface AIProvider {
  id: ProviderId;
  extract(input: ProviderExtractionInput): Promise<ProviderExtractionResult>;
}

export const DEFAULT_MODELS: Record<ProviderId, string> = {
  openai: 'gpt-5.6-luna',
  anthropic: 'claude-sonnet-5',
  gemini: 'gemini-3.8-flash',
};

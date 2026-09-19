export type ProviderId = 'openai' | 'anthropic' | 'gemini' | 'qwen';
export type QwenRegion = 'cn-beijing' | 'ap-southeast-1' | 'cn-hongkong';
export type ProviderVerification = 'verified' | 'experimental';

export interface ProviderMetadata {
  label: string;
  verification: ProviderVerification;
  verifiedRegions?: QwenRegion[];
}

export const PROVIDER_METADATA: Record<ProviderId, ProviderMetadata> = {
  openai: { label: 'OpenAI', verification: 'experimental' },
  anthropic: { label: 'Anthropic', verification: 'experimental' },
  gemini: { label: 'Gemini', verification: 'experimental' },
  qwen: { label: 'Qwen (Alibaba Cloud)', verification: 'experimental', verifiedRegions: ['cn-beijing'] },
};

export function getProviderVerification(id: ProviderId, region?: QwenRegion): ProviderVerification {
  const metadata = PROVIDER_METADATA[id];
  if (id === 'qwen' && region && metadata.verifiedRegions?.includes(region)) return 'verified';
  return metadata.verification;
}

export const QWEN_REGIONS: Record<QwenRegion, { label: string; endpoint: string; dataLocation: string }> = {
  'cn-beijing': {
    label: 'China (Beijing)',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    dataLocation: 'Chinese mainland',
  },
  'ap-southeast-1': {
    label: 'Singapore',
    endpoint: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
    dataLocation: 'International',
  },
  'cn-hongkong': {
    label: 'China (Hong Kong)',
    endpoint: 'https://cn-hongkong.dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    dataLocation: 'Hong Kong',
  },
};

export interface ProviderExtractionInput {
  apiKey: string;
  model: string;
  documentText: string;
  jsonSchema: Record<string, unknown>;
  region?: QwenRegion;
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
  qwen: 'qwen3.8-max',
};

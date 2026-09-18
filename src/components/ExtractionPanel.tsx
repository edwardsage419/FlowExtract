import type { ProviderId } from '../features/providers/types';

interface ExtractionPanelProps {
  provider: ProviderId;
  model: string;
  apiKey: string;
  busy: boolean;
  disabled: boolean;
  onProviderChange: (provider: ProviderId) => void;
  onModelChange: (model: string) => void;
  onApiKeyChange: (key: string) => void;
  onExtract: () => void;
}

export function ExtractionPanel(props: ExtractionPanelProps) {
  return (
    <section className="panel extraction-panel">
      <span className="step">3. AI Extraction</span>
      <h2>Use your own provider key</h2>
      <div className="provider-grid">
        <label className="field">Provider
          <select value={props.provider} onChange={(e) => props.onProviderChange(e.target.value as ProviderId)}>
            <option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="gemini">Gemini</option><option value="qwen">Qwen (Alibaba Cloud)</option>
          </select>
        </label>
        <label className="field">Model<input value={props.model} onChange={(e) => props.onModelChange(e.target.value)} /></label>
      </div>
      <label className="field">API key<input type="password" autoComplete="off" spellCheck={false} value={props.apiKey} onChange={(e) => props.onApiKeyChange(e.target.value)} placeholder="Stored in memory only" /></label>
      <p className="privacy-note">The key is kept only in this page session. It is never saved to IndexedDB or project backups.</p>
      <p className="security-note">Browser BYOK exposes the entered key to this page runtime. For testing, use a dedicated provider key with a low quota or spend limit.</p>
      <button className="button primary full" type="button" disabled={props.disabled || props.busy} onClick={props.onExtract}>{props.busy ? 'Extracting…' : 'Extract structured data'}</button>
    </section>
  );
}

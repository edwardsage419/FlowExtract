import { useState } from 'react';
import { MANUAL_AI_SERVICES } from '../features/extraction/manual';
import type { ExtractionMode, ManualAIService } from '../features/extraction/types';
import { getProviderVerification, PROVIDER_METADATA, QWEN_REGIONS, type ProviderId, type QwenRegion } from '../features/providers/types';

interface ExtractionPanelProps {
  mode: ExtractionMode;
  manualService: ManualAIService;
  manualPrompt: string;
  manualResponse: string;
  manualDisabled: boolean;
  provider: ProviderId;
  model: string;
  apiKey: string;
  qwenRegion: QwenRegion;
  busy: boolean;
  apiDisabled: boolean;
  onModeChange: (mode: ExtractionMode) => void;
  onManualServiceChange: (service: ManualAIService) => void;
  onManualResponseChange: (response: string) => void;
  onManualImport: () => void;
  onProviderChange: (provider: ProviderId) => void;
  onModelChange: (model: string) => void;
  onApiKeyChange: (key: string) => void;
  onQwenRegionChange: (region: QwenRegion) => void;
  onExtract: () => void;
}

export function ExtractionPanel(props: ExtractionPanelProps) {
  const [copyStatus, setCopyStatus] = useState('');
  const verification = getProviderVerification(props.provider, props.provider === 'qwen' ? props.qwenRegion : undefined);
  const region = props.provider === 'qwen' ? QWEN_REGIONS[props.qwenRegion] : null;
  const manualService = MANUAL_AI_SERVICES[props.manualService];

  async function copyPrompt() {
    if (!props.manualPrompt) return;
    try {
      await navigator.clipboard.writeText(props.manualPrompt);
      setCopyStatus('Prompt copied.');
    } catch {
      setCopyStatus('Copy failed. Select the prompt and copy it manually.');
    }
  }

  return (
    <section className="panel extraction-panel">
      <span className="step">3. AI Extraction</span>
      <h2>Choose how to run AI</h2>

      <div className="extraction-mode-switch" role="group" aria-label="Extraction method">
        <button className={'mode-card' + (props.mode === 'manual' ? ' active' : '')} type="button" aria-pressed={props.mode === 'manual'} onClick={() => props.onModeChange('manual')}>
          <strong>AI Chat</strong>
          <span>Manual copy and paste. No API key required.</span>
        </button>
        <button className={'mode-card' + (props.mode === 'api' ? ' active' : '')} type="button" aria-pressed={props.mode === 'api'} onClick={() => props.onModeChange('api')}>
          <strong>API</strong>
          <span>Automatic extraction with your own provider key.</span>
        </button>
      </div>

      {props.mode === 'manual' && (
        <div className="manual-extraction">
          <label className="field">AI chat service
            <select aria-label="AI chat service" value={props.manualService} onChange={(e) => props.onManualServiceChange(e.target.value as ManualAIService)}>
              {Object.entries(MANUAL_AI_SERVICES).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}
            </select>
          </label>
          <p className="privacy-note">Use a free or existing AI chat plan where available. FlowExtract does not sign in to, automate, or read your AI chat account.</p>
          <p className="security-note">The generated prompt contains parsed document text. When you paste it into an AI service, that content is handled under that service's privacy and data retention policies.</p>

          <label className="field">Generated extraction prompt
            <textarea className="prompt-box" aria-label="Generated extraction prompt" readOnly rows={8} value={props.manualPrompt} placeholder="Upload a document and keep a valid schema to generate the prompt." />
          </label>
          <div className="manual-actions">
            <button className="button secondary" type="button" disabled={!props.manualPrompt} onClick={() => void copyPrompt()}>Copy prompt</button>
            {manualService.url && <a className="button secondary button-link" href={manualService.url} target="_blank" rel="noreferrer">Open {manualService.label}</a>}
            {copyStatus && <span className="status-line muted" role="status">{copyStatus}</span>}
          </div>

          <label className="field">AI chat response
            <textarea className="response-box" aria-label="AI chat response" rows={8} value={props.manualResponse} onChange={(e) => props.onManualResponseChange(e.target.value)} placeholder="Paste the JSON response from your AI chat here." />
          </label>
          <p className="privacy-note">The pasted raw response stays in page memory while you edit it. After import, FlowExtract persists the parsed prediction, validation result, and manual service provenance.</p>
          <button className="button primary full" type="button" disabled={props.manualDisabled || !props.manualResponse.trim()} onClick={props.onManualImport}>Import & validate</button>
        </div>
      )}

      {props.mode === 'api' && (
        <div className="api-extraction">
          <div className="provider-grid">
            <label className="field">Provider
              <select value={props.provider} onChange={(e) => props.onProviderChange(e.target.value as ProviderId)}>
                {Object.entries(PROVIDER_METADATA).map(([id, item]) => <option key={id} value={id}>{item.label} - {id === 'qwen' ? 'Verified in Beijing' : 'Experimental'}</option>)}
              </select>
            </label>
            <label className="field">Model<input value={props.model} onChange={(e) => props.onModelChange(e.target.value)} /></label>
          </div>
          {props.provider === 'qwen' && (
            <>
              <label className="field">Qwen region
                <select value={props.qwenRegion} onChange={(e) => props.onQwenRegionChange(e.target.value as QwenRegion)}>
                  {Object.entries(QWEN_REGIONS).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}
                </select>
              </label>
              <p className="security-note">Document text will be sent only to the selected Qwen region ({region?.dataLocation}). FlowExtract never automatically falls back to another region.</p>
            </>
          )}
          <p className="privacy-note">Provider status: {verification === 'verified' ? 'live verified for the selected region' : 'experimental / contract-tested until a live smoke test passes for the selected region'}.</p>
          <label className="field">API key<input type="password" autoComplete="off" spellCheck={false} value={props.apiKey} onChange={(e) => props.onApiKeyChange(e.target.value)} placeholder="Stored in memory only" /></label>
          <p className="privacy-note">The key is kept only in this page session. It is never saved to IndexedDB or project backups.</p>
          <p className="security-note">Browser BYOK exposes the entered key to this page runtime. For testing, use a dedicated provider key with a low quota or spend limit.</p>
          <button className="button primary full" type="button" disabled={props.apiDisabled || props.busy} onClick={props.onExtract}>{props.busy ? 'Extracting...' : 'Extract structured data'}</button>
        </div>
      )}
    </section>
  );
}

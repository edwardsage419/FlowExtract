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
  onManualImport: (response?: string) => void;
  onProviderChange: (provider: ProviderId) => void;
  onModelChange: (model: string) => void;
  onApiKeyChange: (key: string) => void;
  onQwenRegionChange: (region: QwenRegion) => void;
  onExtract: () => void;
}

export function ExtractionPanel(props: ExtractionPanelProps) {
  const [assistStatus, setAssistStatus] = useState('');
  const verification = getProviderVerification(props.provider, props.provider === 'qwen' ? props.qwenRegion : undefined);
  const region = props.provider === 'qwen' ? QWEN_REGIONS[props.qwenRegion] : null;
  const manualService = MANUAL_AI_SERVICES[props.manualService];

  async function copyPromptAndOpen() {
    if (!props.manualPrompt) return;

    let writePromise: Promise<void> | undefined;
    try {
      writePromise = navigator.clipboard?.writeText(props.manualPrompt);
    } catch {
      writePromise = undefined;
    }

    if (manualService.url) {
      window.open(manualService.url, '_blank', 'noopener,noreferrer');
    }

    try {
      if (!writePromise) throw new Error('Clipboard write is unavailable.');
      await writePromise;
      setAssistStatus(manualService.url
        ? `Prompt copied. Paste it into ${manualService.label} and send it.`
        : 'Prompt copied.');
    } catch {
      setAssistStatus(manualService.url
        ? `${manualService.label} opened, but clipboard copy was blocked. Copy the prompt manually.`
        : 'Clipboard copy was blocked. Copy the prompt manually.');
    }
  }

  async function pasteFromClipboardAndValidate() {
    try {
      if (!navigator.clipboard?.readText) throw new Error('Clipboard read is unavailable.');
      const response = await navigator.clipboard.readText();
      if (!response.trim()) {
        setAssistStatus('Clipboard is empty. Copy the AI response first.');
        return;
      }
      props.onManualResponseChange(response);
      props.onManualImport(response);
      setAssistStatus('Clipboard response imported. Review the validation results.');
    } catch {
      setAssistStatus('Clipboard read was blocked. Paste the AI response into the box manually.');
    }
  }

  return (
    <section className="panel extraction-panel">
      <span className="step">3. AI Extraction</span>
      <h2>Choose how to run AI</h2>

      <div className="extraction-mode-switch" role="group" aria-label="Extraction method">
        <button className={'mode-card' + (props.mode === 'manual' ? ' active' : '')} type="button" aria-pressed={props.mode === 'manual'} onClick={() => props.onModeChange('manual')}>
          <strong>AI Chat</strong>
          <span>Use your existing AI chat. No API key required.</span>
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

          <p className="privacy-note">Assisted AI Chat only uses clipboard actions that you start. FlowExtract does not sign in to, automate, scrape, or read your AI chat account.</p>
          <p className="security-note">The generated prompt contains parsed document text. Once you paste it into an AI service, that service's privacy and data retention policies apply.</p>

          <label className="field">Generated extraction prompt
            <textarea className="prompt-box" aria-label="Generated extraction prompt" readOnly rows={8} value={props.manualPrompt} placeholder="Upload a document and keep a valid schema to generate the prompt." />
          </label>

          <div className="assisted-steps" aria-label="Assisted AI Chat steps">
            <span><strong>1.</strong> Copy the prompt and open your AI chat.</span>
            <span><strong>2.</strong> Paste, send, then copy the AI response.</span>
            <span><strong>3.</strong> Return here and import from the clipboard.</span>
          </div>

          <div className="manual-actions">
            <button className="button secondary" type="button" disabled={!props.manualPrompt} onClick={() => void copyPromptAndOpen()}>
              {manualService.url ? `Copy prompt & open ${manualService.label}` : 'Copy prompt'}
            </button>
          </div>

          <label className="field">AI chat response
            <textarea className="response-box" aria-label="AI chat response" rows={8} value={props.manualResponse} onChange={(e) => props.onManualResponseChange(e.target.value)} placeholder="The response appears here after clipboard import, or paste it manually." />
          </label>
          <p className="privacy-note">Clipboard content is read only when you click the import button. The raw response stays in page memory while editing and is not saved in the project record.</p>

          <button className="button primary full" type="button" disabled={props.manualDisabled} onClick={() => void pasteFromClipboardAndValidate()}>Paste from clipboard & validate</button>
          <button className="button secondary full" type="button" disabled={props.manualDisabled || !props.manualResponse.trim()} onClick={() => props.onManualImport()}>Import current response & validate</button>

          {assistStatus && <p className="status-line muted" role="status">{assistStatus}</p>}
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

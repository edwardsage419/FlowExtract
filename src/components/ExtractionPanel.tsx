import { getProviderVerification, PROVIDER_METADATA, QWEN_REGIONS, type ProviderId, type QwenRegion } from '../features/providers/types';

interface ExtractionPanelProps {
  provider: ProviderId;
  model: string;
  apiKey: string;
  qwenRegion: QwenRegion;
  busy: boolean;
  disabled: boolean;
  onProviderChange: (provider: ProviderId) => void;
  onModelChange: (model: string) => void;
  onApiKeyChange: (key: string) => void;
  onQwenRegionChange: (region: QwenRegion) => void;
  onExtract: () => void;
}

export function ExtractionPanel(props: ExtractionPanelProps) {
  const verification = getProviderVerification(props.provider, props.provider === 'qwen' ? props.qwenRegion : undefined);
  const region = props.provider === 'qwen' ? QWEN_REGIONS[props.qwenRegion] : null;
  return (
    <section className="panel extraction-panel">
      <span className="step">3. AI Extraction</span>
      <h2>Use your own provider key</h2>
      <div className="provider-grid">
        <label className="field">Provider
          <select value={props.provider} onChange={(e) => props.onProviderChange(e.target.value as ProviderId)}>
            {Object.entries(PROVIDER_METADATA).map(([id, item]) => (
              <option key={id} value={id}>{item.label} — {id === 'qwen' ? 'Verified in Beijing' : 'Experimental'}</option>
            ))}
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
      <button className="button primary full" type="button" disabled={props.disabled || props.busy} onClick={props.onExtract}>{props.busy ? 'Extracting…' : 'Extract structured data'}</button>
    </section>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { DocumentPanel } from './components/DocumentPanel';
import { ExtractionPanel } from './components/ExtractionPanel';
import { ReviewPanel } from './components/ReviewPanel';
import { SchemaBuilder } from './components/SchemaBuilder';
import { parseDocument } from './features/documents/parseDocument';
import { computeMetrics } from './features/evals/metrics';
import { toCsv, toJson, toXlsx } from './features/export/exporters';
import { runExtraction } from './features/extraction/extract';
import { buildManualExtractionPrompt, importManualExtraction } from './features/extraction/manual';
import type { ExtractionMode, ManualAIService } from './features/extraction/types';
import { exportProjectBackup, importProjectBackup } from './features/persistence/backup';
import { listProjects, loadProject, saveProject } from './features/persistence/projectStore';
import type { ProjectRecord } from './features/project/types';
import { createProvider } from './features/providers/providers';
import { DEFAULT_MODELS, type ProviderId, type QwenRegion } from './features/providers/types';
import { applyCorrection } from './features/review/review';
import type { FieldDefinition } from './features/schema/types';
import './styles.css';

function now() { return new Date().toISOString(); }
function field(name: string, key: string, type: FieldDefinition['type'], required = false): FieldDefinition {
  return { id: crypto.randomUUID(), name, key, type, required, description: '', rules: {} };
}
function newProject(): ProjectRecord {
  const timestamp = now();
  return {
    id: crypto.randomUUID(), name: 'Untitled project', updatedAt: timestamp,
    schema: { id: crypto.randomUUID(), name: 'Invoice fields', updatedAt: timestamp, fields: [field('Customer Name', 'customer_name', 'string'), field('Invoice Number', 'invoice_number', 'string', true), field('Date', 'date', 'date'), field('Amount', 'amount', 'number', true)] },
  };
}
function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
function downloadText(filename: string, text: string, mime: string) { downloadBlob(filename, new Blob([text], { type: mime })); }

export default function App() {
  const [project, setProject] = useState<ProjectRecord>(() => newProject());
  const [extractionMode, setExtractionMode] = useState<ExtractionMode>('manual');
  const [manualService, setManualService] = useState<ManualAIService>('chatgpt');
  const [manualResponse, setManualResponse] = useState('');
  const [provider, setProvider] = useState<ProviderId>('openai');
  const [model, setModel] = useState(DEFAULT_MODELS.openai);
  const [apiKey, setApiKey] = useState('');
  const [qwenRegion, setQwenRegion] = useState<QwenRegion>('cn-beijing');
  const [ocrLanguage, setOcrLanguage] = useState('eng');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<'document' | 'extract' | null>(null);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [recent, setRecent] = useState<ProjectRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const restoreRef = useRef<HTMLInputElement>(null);

  const metrics = useMemo(() => project.extraction ? computeMetrics(project.extraction.fields) : null, [project.extraction]);
  const manualPrompt = useMemo(() => {
    if (!project.document) return '';
    try {
      return buildManualExtractionPrompt(project.document, project.schema);
    } catch {
      return '';
    }
  }, [project.document, project.schema]);

  function restoreExtractionUi(source?: ProjectRecord) {
    const extraction = source?.extraction;
    setApiKey('');
    setManualResponse('');
    if (!extraction) {
      setExtractionMode('manual');
      setManualService('chatgpt');
      return;
    }
    if (extraction.extractionMode === 'manual') {
      setExtractionMode('manual');
      setManualService(extraction.manualService ?? 'other');
      return;
    }
    setExtractionMode('api');
    if (extraction.provider) {
      setProvider(extraction.provider);
      setModel(extraction.model || DEFAULT_MODELS[extraction.provider]);
      if (extraction.provider === 'qwen' && extraction.providerRegion) setQwenRegion(extraction.providerRegion);
    }
  }

  useEffect(() => {
    let cancelled = false;
    listProjects()
      .then((projects) => {
        if (cancelled) return;
        setRecent(projects);
        const latest = projects[0];
        if (latest) {
          setProject(latest);
          setPreviewUrl(null);
          restoreExtractionUi(latest);
        }
        setHydrated(true);
      })
      .catch(() => { if (!cancelled) setHydrated(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      saveProject(project).then(() => listProjects().then(setRecent)).catch(() => undefined);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [project, hydrated]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const touch = (next: ProjectRecord): ProjectRecord => ({ ...next, updatedAt: now() });
  const updateSchema = (updater: (schema: ProjectRecord['schema']) => ProjectRecord['schema']) => {
    setManualResponse('');
    setProject((current) => touch({ ...current, schema: { ...updater(current.schema), updatedAt: now() }, extraction: undefined }));
  };

  async function handleFile(file: File) {
    setBusy('document'); setProgress('Reading document locally…'); setError('');
    try {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      const documentRecord = await parseDocument(file, { ocrLanguage, onProgress: setProgress });
      setProject((current) => touch({ ...current, document: documentRecord, extraction: undefined }));
      setManualResponse('');
      setProgress(documentRecord.ocrUsed ? 'Local OCR complete.' : 'PDF text extraction complete.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to read document.'); setProgress('');
    } finally { setBusy(null); }
  }

  async function handleExtract() {
    if (!project.document) return;
    setBusy('extract'); setError('');
    try {
      const extraction = await runExtraction({ document: project.document, schema: project.schema, provider: createProvider(provider), apiKey, model, providerRegion: provider === 'qwen' ? qwenRegion : undefined });
      setProject((current) => touch({ ...current, extraction }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Extraction failed.'); }
    finally { setBusy(null); }
  }

  function handleManualImport() {
    if (!project.document) return;
    setError('');
    try {
      const extraction = importManualExtraction({
        document: project.document,
        schema: project.schema,
        service: manualService,
        rawResponse: manualResponse,
      });
      setProject((current) => touch({ ...current, extraction }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to import AI chat response.');
    }
  }

  function correct(key: string, value: string) {
    if (!project.extraction) return;
    const fields = applyCorrection(project.schema, project.extraction.fields, key, value);
    setProject((current) => touch({ ...current, extraction: current.extraction ? { ...current.extraction, fields } : undefined }));
  }

  async function exportData(kind: 'json' | 'csv' | 'xlsx') {
    if (!project.extraction) return;
    setError('');
    try {
      if (kind === 'json') downloadText('flowextract.json', toJson(project.extraction.fields), 'application/json');
      if (kind === 'csv') downloadText('flowextract.csv', toCsv(project.extraction.fields), 'text/csv;charset=utf-8');
      if (kind === 'xlsx') downloadBlob('flowextract.xlsx', new Blob([await toXlsx(project.extraction.fields)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Unable to export ${kind.toUpperCase()}.`);
    }
  }

  function exportBackup() { downloadText(`${project.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'flowextract'}-backup.json`, exportProjectBackup(project), 'application/json'); }
  async function restoreBackup(file: File) {
    try {
      const restored = importProjectBackup(await file.text());
      setProject(restored);
      setPreviewUrl(null);
      restoreExtractionUi(restored);
      setError('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to restore backup.'); }
  }
  async function openRecent(id: string) {
    const stored = await loadProject(id);
    if (stored) {
      setProject(stored);
      setPreviewUrl(null);
      restoreExtractionUi(stored);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><div className="brand-row"><span className="brand-mark">FX</span><h1>FlowExtract</h1><span className="version">v0.1.0</span></div><p>Local first AI assisted document extraction, validation and human review.</p></div>
        <div className="top-actions">
          <select aria-label="Recent projects" value={project.id} onChange={(e) => openRecent(e.target.value)}>
            <option value={project.id}>{project.name}</option>
            {recent.filter((item) => item.id !== project.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button className="button ghost" onClick={() => { setProject(newProject()); setPreviewUrl(null); restoreExtractionUi(); }}>New</button>
          <button className="button ghost" onClick={exportBackup}>Backup</button>
          <button className="button ghost" onClick={() => restoreRef.current?.click()}>Restore</button>
          <input ref={restoreRef} className="hidden" type="file" accept="application/json,.json" onChange={(e) => { const file = e.target.files?.[0]; if (file) void restoreBackup(file); e.target.value = ''; }} />
        </div>
      </header>

      <div className="project-strip">
        <label>Project <input value={project.name} onChange={(e) => setProject((current) => touch({ ...current, name: e.target.value }))} /></label>
        <span className="local-indicator">Local only</span>
      </div>
      {error && <div className="error-banner" role="alert">{error}</div>}

      <div className="workspace-grid">
        <div className="workspace-column left-column">
          <DocumentPanel document={project.document} previewUrl={previewUrl} ocrLanguage={ocrLanguage} busy={busy === 'document'} progress={progress} onOcrLanguageChange={setOcrLanguage} onFile={handleFile} />
        </div>
        <div className="workspace-column middle-column">
          <SchemaBuilder schema={project.schema} onNameChange={(name) => updateSchema((schema) => ({ ...schema, name }))} onAddField={() => updateSchema((schema) => ({ ...schema, fields: [...schema.fields, field('New Field', `field_${schema.fields.length + 1}`, 'string')] }))} onRemoveField={(id) => updateSchema((schema) => ({ ...schema, fields: schema.fields.filter((item) => item.id !== id) }))} onFieldChange={(id, patch) => updateSchema((schema) => ({ ...schema, fields: schema.fields.map((item) => item.id === id ? { ...item, ...patch } : item) }))} />
          <ExtractionPanel
            mode={extractionMode}
            manualService={manualService}
            manualPrompt={manualPrompt}
            manualResponse={manualResponse}
            manualDisabled={!project.document || !manualPrompt || project.schema.fields.length === 0}
            provider={provider}
            model={model}
            apiKey={apiKey}
            qwenRegion={qwenRegion}
            busy={busy === 'extract'}
            apiDisabled={!project.document || !apiKey.trim() || project.schema.fields.length === 0}
            onModeChange={setExtractionMode}
            onManualServiceChange={setManualService}
            onManualResponseChange={setManualResponse}
            onManualImport={handleManualImport}
            onProviderChange={(next) => { setProvider(next); setModel(DEFAULT_MODELS[next]); }}
            onModelChange={setModel}
            onApiKeyChange={setApiKey}
            onQwenRegionChange={setQwenRegion}
            onExtract={handleExtract}
          />
        </div>
        <div className="workspace-column right-column">
          <ReviewPanel extraction={project.extraction} schema={project.schema} metrics={metrics} onCorrect={correct} onExport={exportData} />
        </div>
      </div>
      <footer>
        <span>Documents are parsed locally. AI Chat mode lets you copy the prompt yourself; API mode sends document text directly to the provider you choose with your own key.</span>
        <a href="https://github.com/edwardsage419/FlowExtract/issues/new/choose" target="_blank" rel="noreferrer">Feedback</a>
      </footer>
    </main>
  );
}

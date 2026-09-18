import type { ChangeEvent } from 'react';
import type { DocumentRecord } from '../features/documents/types';

interface DocumentPanelProps {
  document?: DocumentRecord;
  previewUrl: string | null;
  ocrLanguage: string;
  busy: boolean;
  progress: string;
  onOcrLanguageChange: (value: string) => void;
  onFile: (file: File) => void;
}

export function DocumentPanel(props: DocumentPanelProps) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) props.onFile(file);
    event.target.value = '';
  };

  return (
    <section className="panel document-panel">
      <div className="panel-title-row">
        <div>
          <span className="step">1. Document</span>
          <h2>Upload and read locally</h2>
        </div>
        {props.document && <span className="badge">{props.document.ocrUsed ? 'OCR used' : 'Text PDF'}</span>}
      </div>

      <div className="upload-row">
        <label className="button secondary file-button">
          {props.busy ? 'Reading…' : 'Choose PDF or image'}
          <input disabled={props.busy} type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={onChange} />
        </label>
        <label className="compact-field">
          OCR language
          <select value={props.ocrLanguage} onChange={(event) => props.onOcrLanguageChange(event.target.value)}>
            <option value="eng">English</option>
            <option value="chi_sim">简体中文</option>
            <option value="eng+chi_sim">English + 中文</option>
          </select>
        </label>
      </div>
      {props.progress && <p className="muted status-line">{props.progress}</p>}

      {!props.document && <div className="empty-state">PDF, PNG, JPG, JPEG. Files are parsed in your browser.</div>}
      {props.document && (
        <>
          <div className="document-meta">
            <strong>{props.document.name}</strong>
            <span>{Math.max(1, props.document.pages.length)} page{props.document.pages.length === 1 ? '' : 's'}</span>
            <span>{Math.round(props.document.size / 1024)} KB</span>
          </div>
          {props.previewUrl && props.document.sourceKind === 'image' && <img className="source-preview" src={props.previewUrl} alt="Uploaded source" />}
          {props.previewUrl && props.document.sourceKind === 'pdf' && <iframe className="source-frame" src={props.previewUrl} title="Uploaded PDF preview" />}
          <details open className="text-preview">
            <summary>Extracted source text</summary>
            <pre>{props.document.text || 'No text detected.'}</pre>
          </details>
        </>
      )}
    </section>
  );
}

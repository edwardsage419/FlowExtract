import type { EvalMetrics } from '../features/evals/metrics';
import type { ExtractionRecord } from '../features/project/types';
import type { SchemaDefinition } from '../features/schema/types';

interface ReviewPanelProps {
  extraction?: ExtractionRecord;
  schema: SchemaDefinition;
  metrics: EvalMetrics | null;
  onCorrect: (key: string, value: string) => void;
  onExport: (kind: 'json' | 'csv' | 'xlsx') => void;
}

function valueText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return typeof value === 'string' ? value : String(value);
}

export function ReviewPanel(props: ReviewPanelProps) {
  return (
    <section className="panel review-panel">
      <div className="panel-title-row">
        <div><span className="step">4. Review</span><h2>Fix only questionable fields</h2></div>
        {props.metrics && <span className="badge">{props.metrics.validationFailureCount} issue{props.metrics.validationFailureCount === 1 ? '' : 's'}</span>}
      </div>

      {!props.extraction && <div className="empty-state">Run extraction to review predictions and validation results.</div>}
      {props.extraction && (
        <>
          <div className="metrics-row">
            <span><strong>{props.metrics?.validFieldCount ?? 0}</strong> valid</span>
            <span><strong>{props.metrics?.humanCorrectionCount ?? 0}</strong> corrected</span>
            <span><strong>{props.metrics?.validationFailureCount ?? 0}</strong> failed</span>
          </div>
          {props.extraction.globalIssues.length > 0 && (
            <div className="global-issues" role="alert">
              <strong>Output structure issues</strong>
              <ul>{props.extraction.globalIssues.map((item, index) => <li key={`${item.code}-${index}`}>{item.message}</li>)}</ul>
            </div>
          )}
          <div className="review-list">
            {props.schema.fields.map((definition) => {
              const field = props.extraction?.fields[definition.key];
              if (!field) return null;
              return (
                <div className={`review-card status-${field.status}`} key={definition.key}>
                  <div className="review-card-head"><div><strong>{definition.name}</strong><code>{definition.key}</code></div><span className="status-pill">{field.status}</span></div>
                  <label className="field">Final value<input value={valueText(field.finalValue)} onChange={(e) => props.onCorrect(definition.key, e.target.value)} /></label>
                  <div className="prediction">AI prediction: <code>{valueText(field.prediction) || 'null'}</code></div>
                  {field.validationIssues.length > 0 && <ul className="issues">{field.validationIssues.map((item) => <li key={item.code}>{item.message}</li>)}</ul>}
                </div>
              );
            })}
          </div>
          <div className="export-row">
            <span className="step">5. Export</span>
            <button className="button secondary" onClick={() => props.onExport('json')}>JSON</button>
            <button className="button secondary" onClick={() => props.onExport('csv')}>CSV</button>
            <button className="button secondary" onClick={() => props.onExport('xlsx')}>XLSX</button>
          </div>
        </>
      )}
    </section>
  );
}

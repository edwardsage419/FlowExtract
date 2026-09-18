import type { FieldDefinition, FieldType, SchemaDefinition } from '../features/schema/types';

interface SchemaBuilderProps {
  schema: SchemaDefinition;
  onNameChange: (name: string) => void;
  onAddField: () => void;
  onRemoveField: (id: string) => void;
  onFieldChange: (id: string, patch: Partial<FieldDefinition>) => void;
}

function optionalNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function SchemaBuilder(props: SchemaBuilderProps) {
  return (
    <section className="panel schema-panel">
      <div className="panel-title-row">
        <div>
          <span className="step">2. Schema</span>
          <h2>Define fields to extract</h2>
        </div>
        <button className="button secondary" type="button" onClick={props.onAddField}>Add field</button>
      </div>

      <label className="field">
        Schema name
        <input value={props.schema.name} onChange={(event) => props.onNameChange(event.target.value)} />
      </label>

      <div className="schema-list">
        {props.schema.fields.map((field) => (
          <div className="schema-card" key={field.id}>
            <div className="schema-card-grid">
              <label className="field">Label<input value={field.name} onChange={(e) => props.onFieldChange(field.id, { name: e.target.value })} /></label>
              <label className="field">Key<input value={field.key} onChange={(e) => props.onFieldChange(field.id, { key: e.target.value.replace(/\s+/g, '_') })} /></label>
              <label className="field">Type
                <select value={field.type} onChange={(e) => props.onFieldChange(field.id, { type: e.target.value as FieldType })}>
                  <option value="string">String</option><option value="number">Number</option><option value="date">Date</option><option value="boolean">Boolean</option>
                </select>
              </label>
              <label className="check-field"><input type="checkbox" checked={field.required} onChange={(e) => props.onFieldChange(field.id, { required: e.target.checked })} />Required</label>
            </div>
            <label className="field">Description<input value={field.description} onChange={(e) => props.onFieldChange(field.id, { description: e.target.value })} placeholder="What this field means" /></label>
            <div className="rules-row">
              {field.type === 'string' && <label className="field">Pattern<input value={field.rules.pattern ?? ''} onChange={(e) => props.onFieldChange(field.id, { rules: { ...field.rules, pattern: e.target.value || undefined } })} placeholder="Optional regex" /></label>}
              {field.type === 'number' && <>
                <label className="field">Min<input type="number" value={field.rules.min ?? ''} onChange={(e) => props.onFieldChange(field.id, { rules: { ...field.rules, min: optionalNumber(e.target.value) } })} /></label>
                <label className="field">Max<input type="number" value={field.rules.max ?? ''} onChange={(e) => props.onFieldChange(field.id, { rules: { ...field.rules, max: optionalNumber(e.target.value) } })} /></label>
              </>}
              <button className="text-button danger" type="button" onClick={() => props.onRemoveField(field.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

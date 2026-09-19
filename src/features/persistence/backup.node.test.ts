import assert from 'node:assert/strict';
import test from 'node:test';
import { exportProjectBackup, importProjectBackup } from './backup.ts';
import type { ProjectRecord } from '../project/types.ts';

const project: ProjectRecord = {
  id: 'p1',
  name: 'Invoices',
  updatedAt: '2026-09-18T00:00:00.000Z',
  schema: { id: 's1', name: 'Invoice', updatedAt: '2026-09-18T00:00:00.000Z', fields: [] },
};

test('backup round trips project data with a version envelope', () => {
  const text = exportProjectBackup(project);
  const raw = JSON.parse(text);
  assert.equal(raw.version, 1);
  assert.deepEqual(importProjectBackup(text), project);
});

test('backup import rejects malformed and secret bearing payloads', () => {
  assert.throws(() => importProjectBackup('{"version":2,"project":{}}'), /version/i);
  assert.throws(() => importProjectBackup(JSON.stringify({ version: 1, project: { ...project, apiKey: 'secret' } })), /secret/i);
});

test('backup import allows ordinary user field names containing secret as a substring', () => {
  const withUserField: ProjectRecord = {
    ...project,
    extraction: {
      id: 'e1',
      documentId: 'd1',
      schemaId: 's1',
      provider: 'openai',
      model: 'gpt-test',
      processedAt: '2026-09-18T00:00:00.000Z',
      fields: {
        secretary_name: {
          key: 'secretary_name',
          prediction: 'Avery',
          finalValue: 'Avery',
          status: 'valid',
          validationIssues: [],
          correctedByHuman: false,
        },
      },
      globalIssues: [],
    },
  };

  assert.deepEqual(importProjectBackup(exportProjectBackup(withUserField)), withUserField);
});


test('backup round trips manual extraction provenance without provider credentials or raw chat response', () => {
  const manualProject: ProjectRecord = {
    ...project,
    extraction: {
      id: 'manual-e1',
      documentId: 'd1',
      schemaId: 's1',
      extractionMode: 'manual',
      manualService: 'chatgpt',
      processedAt: '2026-09-19T00:00:00.000Z',
      fields: {},
      globalIssues: [],
    },
  };

  const text = exportProjectBackup(manualProject);
  assert.deepEqual(importProjectBackup(text), manualProject);
  assert.doesNotMatch(text, /apiKey|Authorization|Bearer/i);
});

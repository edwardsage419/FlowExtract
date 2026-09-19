import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as projectStore from './features/persistence/projectStore';
import type { ProjectRecord } from './features/project/types';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('FlowExtract workspace', () => {
  it('renders the core Document, Schema, Extract, Review and Export workflow', () => {
    vi.spyOn(projectStore, 'listProjects').mockResolvedValue([]);
    vi.spyOn(projectStore, 'saveProject').mockResolvedValue();
    vi.useFakeTimers();
    render(<App />);
    expect(screen.getByRole('heading', { name: /FlowExtract/i })).toBeInTheDocument();
    expect(screen.getByText(/1\. Document/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Schema/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. AI Extraction/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Review/i)).toBeInTheDocument();
  });

  it('restores the latest local project including corrections without restoring an API key', async () => {
    const restored: ProjectRecord = {
      id: 'saved-project',
      name: 'Saved invoice',
      updatedAt: '2026-09-19T00:00:00.000Z',
      document: {
        id: 'doc-1',
        name: 'invoice.pdf',
        mimeType: 'application/pdf',
        size: 100,
        text: 'Invoice total 1333.80',
        pages: [{ page: 1, text: 'Invoice total 1333.80' }],
        ocrUsed: false,
        processedAt: '2026-09-19T00:00:00.000Z',
      },
      schema: {
        id: 'schema-1',
        name: 'Invoice fields',
        updatedAt: '2026-09-19T00:00:00.000Z',
        fields: [{ id: 'amount-field', name: 'Amount', key: 'amount', type: 'number', required: true, description: '', rules: {} }],
      },
      extraction: {
        id: 'extract-1',
        documentId: 'doc-1',
        schemaId: 'schema-1',
        provider: 'qwen',
        model: 'qwen-test',
        providerRegion: 'cn-beijing',
        processedAt: '2026-09-19T00:00:00.000Z',
        fields: {
          amount: {
            key: 'amount',
            prediction: 1333.8,
            correction: 1333.81,
            finalValue: 1333.81,
            status: 'corrected',
            issues: [],
          },
        },
        globalIssues: [],
      },
    };
    vi.spyOn(projectStore, 'listProjects').mockResolvedValue([restored]);
    vi.spyOn(projectStore, 'saveProject').mockResolvedValue();
    render(<App />);

    await waitFor(() => expect(screen.getByDisplayValue('Saved invoice')).toBeInTheDocument());
    expect(screen.getByDisplayValue('1333.81')).toBeInTheDocument();
    expect(screen.getByText(/AI prediction: 1333\.8/i)).toBeInTheDocument();
    expect(screen.getByText(/corrected/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Stored in memory only')).toHaveValue('');
  });
});

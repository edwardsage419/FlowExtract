import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as projectStore from './features/persistence/projectStore';
import type { ProjectRecord } from './features/project/types';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllTimers();
  vi.useRealTimers();
  Reflect.deleteProperty(navigator, 'clipboard');
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
    expect(screen.getByText('v0.1.2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AI Chat/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('option', { name: 'ChatGPT' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^API/i }));
    expect(screen.getByRole('option', { name: /Qwen \(Alibaba Cloud\) - Verified in Beijing/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Stored in memory only')).toHaveValue('');
    expect(screen.getByRole('link', { name: 'Feedback' })).toHaveAttribute('href', 'https://github.com/edwardsage419/FlowExtract/issues/new/choose');
  });



  it('imports pasted AI chat JSON into the existing validation and review flow', async () => {
    const source: ProjectRecord = {
      id: 'manual-source',
      name: 'Manual chat invoice',
      updatedAt: '2026-09-19T00:00:00.000Z',
      document: {
        id: 'doc-manual',
        name: 'invoice.pdf',
        mimeType: 'application/pdf',
        size: 100,
        createdAt: '2026-09-19T00:00:00.000Z',
        text: 'Invoice INV-42 total 1333.80',
        pages: ['Invoice INV-42 total 1333.80'],
        sourceKind: 'pdf',
        ocrUsed: false,
      },
      schema: {
        id: 'schema-manual',
        name: 'Invoice',
        updatedAt: '2026-09-19T00:00:00.000Z',
        fields: [{ id: 'amount-field', name: 'Amount', key: 'amount', type: 'number', required: true, description: '', rules: {} }],
      },
    };
    vi.spyOn(projectStore, 'listProjects').mockResolvedValue([source]);
    vi.spyOn(projectStore, 'saveProject').mockResolvedValue();
    render(<App />);

    await waitFor(() => expect(screen.getByRole('textbox', { name: /Project/i })).toHaveValue('Manual chat invoice'));
    expect(screen.getByRole('button', { name: /AI Chat/i })).toHaveAttribute('aria-pressed', 'true');

    const fence = String.fromCharCode(96).repeat(3);
    fireEvent.change(screen.getByLabelText('AI chat response'), {
      target: { value: fence + 'json\n{"amount":1333.8}\n' + fence },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Import current response & validate' }));

    await waitFor(() => expect(screen.getByDisplayValue('1333.8')).toBeInTheDocument());
    expect(screen.getByText('1333.8')).toBeInTheDocument();
    expect(screen.getByText(/0 issues/i)).toBeInTheDocument();
  });


  it('uses user-triggered clipboard assistance without reading an AI chat session', async () => {
    const source: ProjectRecord = {
      id: 'assisted-source',
      name: 'Assisted invoice',
      updatedAt: '2026-09-19T00:00:00.000Z',
      document: {
        id: 'doc-assisted',
        name: 'invoice.pdf',
        mimeType: 'application/pdf',
        size: 100,
        createdAt: '2026-09-19T00:00:00.000Z',
        text: 'Invoice INV-99 total 42.50',
        pages: ['Invoice INV-99 total 42.50'],
        sourceKind: 'pdf',
        ocrUsed: false,
      },
      schema: {
        id: 'schema-assisted',
        name: 'Invoice',
        updatedAt: '2026-09-19T00:00:00.000Z',
        fields: [{ id: 'amount-field', name: 'Amount', key: 'amount', type: 'number', required: true, description: '', rules: {} }],
      },
    };
    const writeText = vi.fn().mockResolvedValue(undefined);
    const readText = vi.fn().mockResolvedValue('{"amount":42.5}');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText, readText },
    });
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(projectStore, 'listProjects').mockResolvedValue([source]);
    vi.spyOn(projectStore, 'saveProject').mockResolvedValue();

    render(<App />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: /Project/i })).toHaveValue('Assisted invoice'));

    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt & open ChatGPT' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining('key=amount')));
    expect(open).toHaveBeenCalledWith('https://chatgpt.com/', '_blank', 'noopener,noreferrer');

    fireEvent.click(screen.getByRole('button', { name: 'Paste from clipboard & validate' }));
    await waitFor(() => expect(readText).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText('AI chat response')).toHaveValue('{"amount":42.5}');
    await waitFor(() => expect(screen.getByDisplayValue('42.5')).toBeInTheDocument());
    expect(screen.getByText(/0 issues/i)).toBeInTheDocument();
  });

  it('keeps manual paste available when clipboard access is blocked', async () => {
    const source: ProjectRecord = {
      id: 'clipboard-fallback',
      name: 'Clipboard fallback',
      updatedAt: '2026-09-19T00:00:00.000Z',
      document: {
        id: 'doc-fallback',
        name: 'invoice.pdf',
        mimeType: 'application/pdf',
        size: 100,
        createdAt: '2026-09-19T00:00:00.000Z',
        text: 'Amount 10',
        pages: ['Amount 10'],
        sourceKind: 'pdf',
        ocrUsed: false,
      },
      schema: {
        id: 'schema-fallback',
        name: 'Invoice',
        updatedAt: '2026-09-19T00:00:00.000Z',
        fields: [{ id: 'amount-field', name: 'Amount', key: 'amount', type: 'number', required: true, description: '', rules: {} }],
      },
    };
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('blocked')), readText: vi.fn().mockRejectedValue(new Error('blocked')) },
    });
    vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(projectStore, 'listProjects').mockResolvedValue([source]);
    vi.spyOn(projectStore, 'saveProject').mockResolvedValue();

    render(<App />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: /Project/i })).toHaveValue('Clipboard fallback'));

    fireEvent.click(screen.getByRole('button', { name: 'Paste from clipboard & validate' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/Clipboard read was blocked/i));

    fireEvent.change(screen.getByLabelText('AI chat response'), { target: { value: '{"amount":10}' } });
    fireEvent.click(screen.getByRole('button', { name: 'Import current response & validate' }));
    await waitFor(() => expect(screen.getByDisplayValue('10')).toBeInTheDocument());
  });

  it('does not autosave a blank project before startup hydration completes', async () => {
    vi.useFakeTimers();
    let resolveProjects!: (projects: ProjectRecord[]) => void;
    const pendingProjects = new Promise<ProjectRecord[]>((resolve) => { resolveProjects = resolve; });
    vi.spyOn(projectStore, 'listProjects').mockReturnValue(pendingProjects);
    const save = vi.spyOn(projectStore, 'saveProject').mockResolvedValue();
    render(<App />);

    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(save).not.toHaveBeenCalled();

    await act(async () => { resolveProjects([]); await pendingProjects; });
    await act(async () => { await vi.advanceTimersByTimeAsync(400); });
    expect(save).toHaveBeenCalledTimes(1);
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
        createdAt: '2026-09-19T00:00:00.000Z',
        text: 'Invoice total 1333.80',
        pages: ['Invoice total 1333.80'],
        sourceKind: 'pdf',
        ocrUsed: false,
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
            finalValue: 1333.81,
            status: 'corrected',
            validationIssues: [],
            correctedByHuman: true,
          },
        },
        globalIssues: [],
      },
    };
    vi.spyOn(projectStore, 'listProjects').mockResolvedValue([restored]);
    vi.spyOn(projectStore, 'saveProject').mockResolvedValue();
    render(<App />);

    await waitFor(() => expect(screen.getByRole('textbox', { name: /Project/i })).toHaveValue('Saved invoice'));
    expect(screen.getByDisplayValue('1333.81')).toBeInTheDocument();
    expect(screen.getByText('1333.8')).toBeInTheDocument();
    expect(screen.getAllByText(/corrected/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /^API/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByPlaceholderText('Stored in memory only')).toHaveValue('');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('FlowExtract workspace', () => {
  it('renders the core Document, Schema, Extract, Review and Export workflow', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /FlowExtract/i })).toBeInTheDocument();
    expect(screen.getByText(/1\. Document/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Schema/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. AI Extraction/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Review/i)).toBeInTheDocument();
  });
});

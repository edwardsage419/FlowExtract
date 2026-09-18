import { describe, expect, it } from 'vitest';
import { toCsv, toJson, toXlsx } from './exporters';
import type { ReviewedField } from '../validation/types';

const fields: Record<string, ReviewedField> = {
  name: { key: 'name', prediction: 'ACME', finalValue: 'ACME', status: 'valid', validationIssues: [], correctedByHuman: false },
  amount: { key: 'amount', prediction: 42, finalValue: 42, status: 'valid', validationIssues: [], correctedByHuman: false },
};

describe('exports', () => {
  it('exports JSON and CSV', () => {
    expect(JSON.parse(toJson(fields))).toEqual({ name: 'ACME', amount: 42 });
    expect(toCsv(fields)).toContain('name,amount');
  });

  it('exports a non empty XLSX workbook', async () => {
    const buffer = await toXlsx(fields);
    expect(buffer.byteLength).toBeGreaterThan(100);
  });
});

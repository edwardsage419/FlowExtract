import type { ReviewedField } from '../validation/types.ts';

export function finalValues(fields: Record<string, ReviewedField>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.finalValue]));
}

export function toJson(fields: Record<string, ReviewedField>): string {
  return JSON.stringify(finalValues(fields), null, 2);
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function toCsv(fields: Record<string, ReviewedField>): string {
  const keys = Object.keys(fields);
  const row = keys.map((key) => csvCell(fields[key].finalValue));
  return `${keys.map(csvCell).join(',')}\r\n${row.join(',')}\r\n`;
}

export async function toXlsx(fields: Record<string, ReviewedField>): Promise<ArrayBuffer> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Extracted Data');
  const keys = Object.keys(fields);
  worksheet.addRow(keys);
  worksheet.addRow(keys.map((key) => fields[key].finalValue ?? ''));
  worksheet.getRow(1).font = { bold: true };
  return workbook.xlsx.writeBuffer();
}

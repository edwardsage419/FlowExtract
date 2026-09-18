import assert from 'node:assert/strict';
import test from 'node:test';
import { isAcceptedDocument, joinPageText } from './documentHelpers.ts';

test('accepts PDF, PNG, JPG and JPEG', () => {
  assert.equal(isAcceptedDocument('invoice.pdf', 'application/pdf'), true);
  assert.equal(isAcceptedDocument('scan.PNG', 'image/png'), true);
  assert.equal(isAcceptedDocument('scan.jpg', 'image/jpeg'), true);
  assert.equal(isAcceptedDocument('scan.jpeg', ''), true);
});

test('rejects unsupported files', () => {
  assert.equal(isAcceptedDocument('notes.txt', 'text/plain'), false);
  assert.equal(isAcceptedDocument('sheet.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'), false);
});

test('joins pages with stable page markers', () => {
  assert.equal(joinPageText(['Hello', 'World']), '=== Page 1 ===\nHello\n\n=== Page 2 ===\nWorld');
});

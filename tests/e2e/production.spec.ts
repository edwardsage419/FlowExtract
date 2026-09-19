import { expect, test } from '@playwright/test';

test.skip(!process.env.PLAYWRIGHT_BASE_URL, 'Production smoke only runs against the configured live URL.');

test('production supports manual AI Chat extraction and preserves API mode', async ({ page }) => {
  const syntheticProject = {
    id: 'production-smoke-v011',
    name: 'Production smoke V0.1.1',
    updatedAt: '2099-01-01T00:00:00.000Z',
    document: {
      id: 'production-smoke-document',
      name: 'synthetic-invoice.pdf',
      mimeType: 'application/pdf',
      size: 256,
      createdAt: '2099-01-01T00:00:00.000Z',
      text: [
        'Redwood Demo Company',
        'Invoice Number: INV-2026-0919',
        'Date: 2026-09-19',
        'Amount: 1333.80',
      ].join('\n'),
      pages: ['Redwood Demo Company\nInvoice Number: INV-2026-0919\nDate: 2026-09-19\nAmount: 1333.80'],
      sourceKind: 'pdf',
      ocrUsed: false,
    },
    schema: {
      id: 'production-smoke-schema',
      name: 'Invoice fields',
      updatedAt: '2099-01-01T00:00:00.000Z',
      fields: [
        { id: 'f1', name: 'Customer Name', key: 'customer_name', type: 'string', required: true, description: '', rules: {} },
        { id: 'f2', name: 'Invoice Number', key: 'invoice_number', type: 'string', required: true, description: '', rules: {} },
        { id: 'f3', name: 'Date', key: 'date', type: 'date', required: true, description: '', rules: {} },
        { id: 'f4', name: 'Amount', key: 'amount', type: 'number', required: true, description: '', rules: { min: 0 } },
      ],
    },
  };

  await page.goto('/');
  await expect(page.getByText('v0.1.1')).toBeVisible();

  await page.evaluate(async (project) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('flowextract', 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('projects')) {
          const store = database.createObjectStore('projects', { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('projects', 'readwrite');
      tx.objectStore('projects').put(project);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  }, syntheticProject);

  await page.reload();

  await expect(page.getByRole('textbox', { name: /Project/i })).toHaveValue('Production smoke V0.1.1');
  await expect(page.getByRole('button', { name: /AI Chat/i })).toHaveAttribute('aria-pressed', 'true');

  const prompt = page.getByLabel('Generated extraction prompt');
  await expect(prompt).toContainText('INV-2026-0919');
  await expect(prompt).toContainText('key=amount');

  await page.getByLabel('AI chat response').fill(JSON.stringify({
    customer_name: 'Redwood Demo Company',
    invoice_number: 'INV-2026-0919',
    date: '2026-09-19',
    amount: 1333.8,
  }));
  await page.getByRole('button', { name: 'Import & validate' }).click();

  await expect(page.getByDisplayValue('1333.8')).toBeVisible();
  await expect(page.getByText('0 issues')).toBeVisible();

  await page.getByDisplayValue('1333.8').fill('1333.81');
  await expect(page.getByText('corrected', { exact: true })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'JSON' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  if (!stream) throw new Error('JSON export did not produce a readable download.');

  let exported = '';
  for await (const chunk of stream) exported += chunk.toString();
  expect(JSON.parse(exported)).toEqual({
    customer_name: 'Redwood Demo Company',
    invoice_number: 'INV-2026-0919',
    date: '2026-09-19',
    amount: 1333.81,
  });

  await page.getByRole('button', { name: /^API/i }).click();
  await expect(page.getByPlaceholder('Stored in memory only')).toBeVisible();
  await expect(page.getByRole('option', { name: /Qwen \(Alibaba Cloud\) - Verified in Beijing/i })).toBeAttached();
});

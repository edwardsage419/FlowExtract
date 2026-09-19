import { expect, test } from '@playwright/test';

test('shows the complete FlowExtract workflow shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FlowExtract' })).toBeVisible();
  await expect(page.getByText('1. Document')).toBeVisible();
  await expect(page.getByText('2. Schema')).toBeVisible();
  await expect(page.getByText('3. AI Extraction')).toBeVisible();
  await expect(page.getByText('4. Review')).toBeVisible();
  await expect(page.getByRole('button', { name: /AI Chat/i })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('combobox', { name: 'AI chat service' })).toHaveValue('chatgpt');
  await page.getByRole('button', { name: /^API/i }).click();
  await expect(page.getByPlaceholder('Stored in memory only')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Feedback' })).toHaveAttribute('href', 'https://github.com/edwardsage419/FlowExtract/issues/new/choose');
});


test('runs manual AI Chat import through validation and review in the browser', async ({ page }) => {
  await page.goto('/');

  await page.evaluate(async () => {
    const project = {
      id: 'e2e-manual-project',
      name: 'E2E manual invoice',
      updatedAt: '2026-09-19T12:00:00.000Z',
      document: {
        id: 'e2e-doc',
        name: 'invoice.pdf',
        mimeType: 'application/pdf',
        size: 128,
        createdAt: '2026-09-19T12:00:00.000Z',
        text: 'Customer Redwood Demo Company Invoice INV-2026-0919 Date 2026-09-19 Amount 1333.80',
        pages: ['Customer Redwood Demo Company Invoice INV-2026-0919 Date 2026-09-19 Amount 1333.80'],
        sourceKind: 'pdf',
        ocrUsed: false,
      },
      schema: {
        id: 'e2e-schema',
        name: 'Invoice fields',
        updatedAt: '2026-09-19T12:00:00.000Z',
        fields: [
          { id: 'f1', name: 'Customer Name', key: 'customer_name', type: 'string', required: false, description: '', rules: {} },
          { id: 'f2', name: 'Invoice Number', key: 'invoice_number', type: 'string', required: true, description: '', rules: {} },
          { id: 'f3', name: 'Date', key: 'date', type: 'date', required: false, description: '', rules: {} },
          { id: 'f4', name: 'Amount', key: 'amount', type: 'number', required: true, description: '', rules: { min: 0 } },
        ],
      },
    };

    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('flowextract', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('projects')) {
          const store = db.createObjectStore('projects', { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt');
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('projects', 'readwrite');
        tx.objectStore('projects').put(project);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  });

  await page.reload();

  await expect(page.getByRole('textbox', { name: /Project/i })).toHaveValue('E2E manual invoice');
  await expect(page.getByRole('button', { name: /AI Chat/i })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Generated extraction prompt')).toContainText('invoice_number');

  await page.getByLabel('AI chat response').fill(JSON.stringify({
    customer_name: 'Redwood Demo Company',
    invoice_number: 'INV-2026-0919',
    date: '2026-09-19',
    amount: 1333.8,
  }));
  await page.getByRole('button', { name: 'Import & validate' }).click();

  await expect(page.getByDisplayValue('Redwood Demo Company')).toBeVisible();
  await expect(page.getByDisplayValue('INV-2026-0919')).toBeVisible();
  await expect(page.getByDisplayValue('2026-09-19')).toBeVisible();
  await expect(page.getByDisplayValue('1333.8')).toBeVisible();
  await expect(page.getByText('4 valid')).toBeVisible();
  await expect(page.getByText('0 failed')).toBeVisible();

  await page.getByDisplayValue('1333.8').fill('1333.81');
  await expect(page.getByText(/1 corrected/i)).toBeVisible();
  await expect(page.getByText('1333.8')).toBeVisible();
});

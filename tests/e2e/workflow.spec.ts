import { expect, test } from '@playwright/test';

test('shows the complete FlowExtract workflow shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FlowExtract' })).toBeVisible();
  await expect(page.getByText('1. Document')).toBeVisible();
  await expect(page.getByText('2. Schema')).toBeVisible();
  await expect(page.getByText('3. AI Extraction')).toBeVisible();
  await expect(page.getByText('4. Review')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Feedback' })).toHaveAttribute('href', 'https://github.com/edwardsage419/FlowExtract/issues/new/choose');
});

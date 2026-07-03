const { test, expect } = require('@playwright/test');

test('Week 3', async ({ page }) => {
  const BASE_URL = 'https://demoqa.com';
  const NAME = 'Test User';
  const EMAIL = 'test.user@test.com';
  const CURRENT_ADDRESS = 'Dnipro';
  const PERMANENT_ADDRESS = 'Ukraine';

  await page.goto(BASE_URL);
  await page.locator('.card.mt-4.top-card', { hasText: 'Elements' }).click();
  await expect(page).toHaveURL(BASE_URL + '/elements');

  // check that left menu is shown
  await expect(page.locator('.left-pannel')).toBeVisible();
  // check that Elements list is open
  await expect(page.locator('.element-list.accordion-collapse.collapse.show')).toBeVisible();

  // click on Text Box in the left menu
  await page.getByText('Text Box').click();

  // fill in the form fields
  await page.locator('#userName').fill(NAME);
  await page.locator('#userEmail').fill(EMAIL);
  await page.locator('#currentAddress').fill(CURRENT_ADDRESS);
  await page.locator('#permanentAddress').fill(PERMANENT_ADDRESS);

  // click Submit button
  await page.locator('#submit').click();

  // check that output block is visible
  const expected = page.locator('#output');
  await expect(expected).toBeVisible();

  // check that all entered data is shown in the output
  await expect(expected).toContainText(NAME);
  await expect(expected).toContainText(EMAIL);
  await expect(expected).toContainText(CURRENT_ADDRESS);
  await expect(expected).toContainText(PERMANENT_ADDRESS);
});

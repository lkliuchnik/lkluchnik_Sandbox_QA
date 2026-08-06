const { test, expect } = require('@playwright/test');

test('Week 3', async ({ page }) => {
  const BASE_URL = process.env.BASE_URL;
  const NAME = 'Test User';
  const EMAIL = process.env.EMAIL;
  const CURRENT_ADDRESS = 'Dnipro';
  const PERMANENT_ADDRESS = 'Ukraine';

  await page.goto(BASE_URL);
  await page.getByRole('heading', { name: 'Elements', exact: true }).click();
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
  const output = page.locator('#output');
  await expect(output).toBeVisible();

  const expected = output.locator('p');

  // check that all entered data is shown in the output
  await expect(expected).toContainText([
    NAME,
    EMAIL,
    CURRENT_ADDRESS,
    PERMANENT_ADDRESS,
  ]);
});

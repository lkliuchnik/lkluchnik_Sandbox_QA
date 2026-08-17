const { expect } = require('@playwright/test');

class ElementsPage {
  constructor(page) {
    this.page = page;
    this.expandedElementsList = page.locator('.element-list.accordion-collapse.collapse.show');
    this.webTablesMenuItem = this.expandedElementsList.getByText('Web Tables', { exact: true });
    this.webTablesHeading = page.getByRole('heading', { name: 'Web Tables' });
    this.tableColumnHeaders = page.getByRole('columnheader');
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.searchBox = page.getByPlaceholder('Type to search');
    this.registrationFormHeading = page.getByText('Registration Form', { exact: true });
    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.emailInput = page.locator('#userEmail');
    this.ageInput = page.locator('#age');
    this.salaryInput = page.locator('#salary');
    this.departmentInput = page.locator('#department');
    this.submitButton = page.locator('#submit');
    this.tableBody = page.locator('.rt-tbody, table tbody');
  }

  getRowByText(text) {
    return this.tableBody.locator('tr', { hasText: text });
  }

  async expectMenuExpandedWithItems(itemNames) {
    await expect(this.expandedElementsList).toBeVisible();

    for (const itemName of itemNames) {
      await expect(this.expandedElementsList.getByText(itemName, { exact: true })).toBeVisible();
    }
  }

  async openWebTablesFromMenu() {
    await this.webTablesMenuItem.click();
    await expect(this.page).toHaveURL(/\/webtables$/);
  }

  async expectWebTablesHeadingVisible() {
    await expect(this.webTablesHeading).toBeVisible();
  }

  async expectWebTablesColumnsVisible(columnNames) {
    for (const columnName of columnNames) {
      await expect(this.tableColumnHeaders.filter({ hasText: columnName })).toBeVisible();
    }
  }

  async expectAddButtonVisible() {
    await expect(this.addButton).toBeVisible();
  }

  async expectSearchBoxVisible() {
    await expect(this.searchBox).toBeVisible();
  }

  async clickAddButton() {
    await this.addButton.click();
  }

  async expectRegistrationFormVisible() {
    await expect(this.registrationFormHeading).toBeVisible();
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.ageInput).toBeVisible();
    await expect(this.salaryInput).toBeVisible();
    await expect(this.departmentInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async clickSubmitButton() {
    await this.submitButton.click();
  }

  async fillRegistrationForm({ firstName, lastName, email, age, salary, department }) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.ageInput.fill(age);
    await this.salaryInput.fill(salary);
    await this.departmentInput.fill(department);
  }

  async expectRowVisibleWithEmail(email) {
    await expect(this.getRowByText(email)).toBeVisible();
    await expect(this.registrationFormHeading).toBeHidden();
  }

  async searchFor(text) {
    await this.searchBox.fill(text);
  }

  async expectRowVisibleWithText(text) {
    await expect(this.getRowByText(text)).toBeVisible();
  }

  async clickEditForRowWithText(text) {
    await this.getRowByText(text).locator('span[title="Edit"]').click();
  }

  async clickDeleteForRowWithText(text) {
    await this.getRowByText(text).locator('span[title="Delete"]').click();
  }

  async expectTableEmpty() {
    await expect(this.tableBody.locator('tr')).toHaveCount(0);
  }

  async expectRowFields(searchText, { firstName, lastName, email, age, salary, department }) {
    const row = this.getRowByText(searchText);
    const cells = row.locator('td');

    await expect(cells.nth(0)).toHaveText(firstName);
    await expect(cells.nth(1)).toHaveText(lastName);
    await expect(cells.nth(2)).toHaveText(age);
    await expect(cells.nth(3)).toHaveText(email);
    await expect(cells.nth(4)).toHaveText(salary);
    await expect(cells.nth(5)).toHaveText(department);
  }

  async expectRequiredFieldsHighlightedRed() {
    const redBorderColor = 'rgb(220, 53, 69)';

    await expect(this.firstNameInput).toHaveCSS('border-color', redBorderColor);
    await expect(this.lastNameInput).toHaveCSS('border-color', redBorderColor);
    await expect(this.emailInput).toHaveCSS('border-color', redBorderColor);
    await expect(this.ageInput).toHaveCSS('border-color', redBorderColor);
    await expect(this.salaryInput).toHaveCSS('border-color', redBorderColor);
    await expect(this.departmentInput).toHaveCSS('border-color', redBorderColor);

    await expect(this.registrationFormHeading).toBeVisible();
  }
}

module.exports = {
  ElementsPage,
};

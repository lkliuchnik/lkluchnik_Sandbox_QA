const { test } = require('../fixtures/app.fixture');
const { ElementsPage } = require('../pages/ElementsPage');
const { webTableRecords } = require('../test-data/webTableRecords');

const elementsMenuItems = [
  'Text Box',
  'Check Box',
  'Radio Button',
  'Web Tables',
  'Buttons',
  'Links',
  'Broken Links - Images',
  'Upload and Download',
  'Dynamic Properties',
];

const webTablesColumns = ['First Name', 'Last Name', 'Age', 'Email', 'Salary', 'Department', 'Action'];

test('Elements.WebTableAddEditRemove', async ({ elementsLandingPage, page }) => {
  /** @type {ElementsPage} */
  const elementsPage = elementsLandingPage;

  await elementsPage.expectMenuExpandedWithItems(elementsMenuItems);

  await elementsPage.openWebTablesFromMenu();
  await elementsPage.expectWebTablesHeadingVisible();
  await elementsPage.expectWebTablesColumnsVisible(webTablesColumns);
  await elementsPage.expectAddButtonVisible();
  await elementsPage.expectSearchBoxVisible();

  await elementsPage.clickAddButton();
  await elementsPage.expectRegistrationFormVisible();

  await elementsPage.clickSubmitButton();
  await elementsPage.expectRequiredFieldsHighlightedRed();

  await elementsPage.fillRegistrationForm(webTableRecords.record1);
  await elementsPage.clickSubmitButton();
  await elementsPage.expectRowVisibleWithEmail(webTableRecords.record1.email);

  await elementsPage.clickAddButton();
  await elementsPage.fillRegistrationForm(webTableRecords.record2);
  await elementsPage.clickSubmitButton();
  await elementsPage.expectRowVisibleWithEmail(webTableRecords.record2.email);

  await elementsPage.searchFor(webTableRecords.record1.department);
  await elementsPage.expectRowVisibleWithText(webTableRecords.record1.department);

  await elementsPage.clickEditForRowWithText(webTableRecords.record1.department);
  const updatedRecord1 = { ...webTableRecords.record1, department: webTableRecords.updatedDepartment };
  await elementsPage.fillRegistrationForm(updatedRecord1);
  await elementsPage.clickSubmitButton();

  await elementsPage.searchFor(webTableRecords.updatedDepartment);
  await elementsPage.expectRowFields(webTableRecords.updatedDepartment, updatedRecord1);

  await elementsPage.searchFor(webTableRecords.commonSearchTerm);
  await elementsPage.expectRowFields(webTableRecords.record1.email, updatedRecord1);
  await elementsPage.expectRowFields(webTableRecords.record2.email, webTableRecords.record2);

  await elementsPage.clickDeleteForRowWithText(webTableRecords.record1.email);
  // demoqa quirk: deleting the edited record also removes the other new record
  await elementsPage.expectTableEmpty();

  await page.reload();
  await elementsPage.searchFor(webTableRecords.commonSearchTerm);
  await elementsPage.expectTableEmpty();
});

import { expect, test, chromium } from '@playwright/test';

test('2 buttons on landing page', async ({ page }) => {
	await page.goto('/');
	await expect(await page.getByRole('button')).toHaveCount(2);
});

test('JacobWebb transacts with GroceryStore', async ({ page }) => {
	await page.goto('/');
	await page.getByPlaceholder("account").fill("GroceryStore");
	await page.getByRole('button', { name: 'Sign In' }).click();
	await page.getByPlaceholder("Recipient").fill("JacobWebb");
	await page.getByPlaceholder("item").fill("bread");
	await page.getByPlaceholder("Price").fill("3.000");
	await page.getByPlaceholder("Quantity").fill("3");
	await page.locator('css=[data-id="ruleItem"]').waitFor();
	await page.getByRole('button', { name: 'Request' }).click();

	const secondBrowser = await chromium.launch();
	const secondContext = await secondBrowser.newContext()
	const secondPage = await secondContext.newPage()

	await secondPage.goto('/')
	await secondPage.getByPlaceholder("account").fill("JacobWebb");
	await secondPage.getByRole('button', { name: 'Sign In' }).click();
	await secondPage.waitForSelector('css=.first')
	await secondPage.locator('css=.first').click();
	await secondPage.getByText('Requests').click();
	await secondPage.locator('css=[data-id-req="3"]').click();
	await secondPage.getByRole('button', { name: 'Approve' }).click();
	await secondPage.waitForTimeout(500); // wait for new value in balance component
	const JacobWebbAccountBalance = await secondPage.locator('css=[data-id="accountBalance"]').innerText();

	await page.locator('css=[data-id="homeIcon"]').click();
	await page.waitForTimeout(500); // wait for new value in balance component
	const GroceryStoreAccountBalance = await page.locator('css=[data-id="accountBalance"]').innerText();

	await expect(JacobWebbAccountBalance).toBe('990.190');
	await expect(GroceryStoreAccountBalance).toBe('1009.000');

	await secondContext.close()
	await secondBrowser.close()
});

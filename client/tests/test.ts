import { expect, test, chromium } from '@playwright/test';

test('2 buttons on landing page', async ({ page }) => {
	await page.goto('/');
	await expect(await page.getByRole('button')).toHaveCount(2);
});

test('request detail screen pairs transaction items with rule added items', async ({ page }) => {
	await signIn(page, "JacobWebb")
	await page.waitForSelector('css=.first')
	await page.locator('css=.first').click();
	await page.getByText('Requests').click();
	await page.locator('css=[data-id-req="1"]').click();
	await expect(await getFirstNTransactionItems(page, 6)).toEqual(
		// migrations/testseed/000003_request.up.sql
		[
			{
				item_id: "eggs",
				quantity: "1",
				price: "3.000",
			},
			{
				item_id: salesTax,
				quantity: "1",
				price: "0.270",
			},
			{
				item_id: "bread",
				quantity: "2",
				price: "2.000",
			},
			{
				item_id: salesTax,
				quantity: "2",
				price: "0.180",
			},
			{
				item_id: "milk",
				quantity: "1",
				price: "2.000",
			},
			{
				item_id: salesTax,
				quantity: "1",
				price: "0.180",
			},
		]
	);
	await signOut(page);
});

test('JacobWebb transacts with GroceryStore', async ({ page }) => {
	await signIn(page, "GroceryStore")
	await page.getByPlaceholder("Recipient").fill("JacobWebb");
	await page.getByPlaceholder("item").fill("bread");
	await page.getByPlaceholder("Price").fill("3.000");
	await page.getByPlaceholder("Quantity").fill("3");
	await page.locator('[data-id="ruleItem"] >> [data-id-index="0"]').waitFor();;
	await page.getByRole('button', { name: 'Request' }).click();

	const secondBrowser = await chromium.launch();
	const secondContext = await secondBrowser.newContext()
	const secondPage = await secondContext.newPage()

	await signIn(secondPage, "JacobWebb")
	await secondPage.waitForSelector('css=.first');
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

	await signOut(page);
	await signOut(secondPage);
	await secondContext.close();
	await secondBrowser.close();
});

test('history detail screen pairs transaction items with rule added items', async ({ page }) => {
	await signIn(page, "JacobWebb")
	await page.waitForSelector('css=.first')
	await page.locator('css=.first').click();
	await page.getByText('History').click();
	await page.locator('css=[data-id-tr="3"]').click();
	await expect(await getFirstNTransactionItems(page, 2)).toEqual(
		[
			{
				item_id: "bread",
				quantity: "3.000",
				price: "3.000",
			},
			{
				item_id: salesTax,
				quantity: "3.000",
				price: "0.270",
			}
		]
	);
	await signOut(page);
});

async function signIn(page, account) {
	await page.goto('/')
	await page.getByPlaceholder("account").fill(account);
	await page.getByRole('button', { name: 'Sign In' }).click();
}

async function signOut(page) {
	await page.waitForSelector('css=.first')
	await page.locator('css=.first').click();
	await page.getByText('Sign Out').click();
}

async function getFirstNTransactionItems(page, n) {
	const transactionItems = [];
	for (let i = 0; i < n; i++) {

		transactionItems.push({
			item_id: await page.locator(`css=[data-id-index="${i}"] .transaction-item-title`).innerText(),
			quantity: await page.locator(`css=[data-id-index="${i}"] .transaction-item-quantity`).innerText(),
			price: await page.locator(`css=[data-id-index="${i}"] .transaction-item-price`).innerText(),
		})


	}
	return transactionItems
}

const salesTax = '9% state sales tax';
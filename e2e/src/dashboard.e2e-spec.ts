import { DashboardPage } from './dashboard.po';
import { browser, logging } from 'protractor';

describe('Dashboard', () => {
	let page: DashboardPage;

	beforeEach(() => {
		page = new DashboardPage();
		page.navigateTo();
	});

	it('should display badge header', () => {
		expect(page.getBadgeHeader()).toEqual('ARENAORDEN');
	});

	it('should show gold badges first', () => {
		expect(page.getTopRow()).toContain(4);
	});

	it('should show gold badges after click', () => {
		page.clickBadge(4);
		expect(page.getTopRow()).toContain(4);
	});

	it('should show gold badges after click silver and then gold', () => {
		page.clickBadge(3);
		expect(page.getTopRow()).toContain(3);

		page.clickBadge(4);
		expect(page.getTopRow()).toContain(4);
	});

	it('should show gold badges after click bronze and then gold', () => {
		page.clickBadge(2);
		expect(page.getTopRow()).toContain(2);

		page.clickBadge(4);
		expect(page.getTopRow()).toContain(4);
	});

	it('should show silver badges after click', () => {
		page.clickBadge(3);
		expect(page.getTopRow()).toContain(3);
	});

	it('should show bronze badges after click', () => {
		page.clickBadge(2);
		expect(page.getTopRow()).toContain(2);
	});

	afterEach(async () => {
		// Assert that there are no errors emitted from the browser
		const logs = await browser.manage().logs().get(logging.Type.BROWSER);

		expect(logs).not.toContain(
			jasmine.objectContaining({
				level: logging.Level.SEVERE
			} as logging.Entry)
		);
	});
});

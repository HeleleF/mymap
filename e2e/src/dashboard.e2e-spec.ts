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
    expect(page.getTopRow()).toEqual('gold');
  });

  it('should show gold badges after click', () => {
    page.clickBadge('gold');
    expect(page.getTopRow()).toEqual('gold');
  });

  it('should show gold badges after click silver and then gold', () => {
    page.clickBadge('silver');
    expect(page.getTopRow()).toEqual('silver');

    page.clickBadge('gold');
    expect(page.getTopRow()).toEqual('gold');
  });

  it('should show gold badges after click bronze and then gold', () => {
    page.clickBadge('bronze');
    expect(page.getTopRow()).toEqual('bronze');

    page.clickBadge('gold');
    expect(page.getTopRow()).toEqual('gold');
  });

  it('should show silver badges after click', () => {
    page.clickBadge('silver');
    expect(page.getTopRow()).toEqual('silver');
  });

  it('should show bronze badges after click', () => {
    page.clickBadge('bronze');
    expect(page.getTopRow()).toEqual('bronze');
  });

  afterEach(async () => {

    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);

    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));

  });
});
import { browser, by, element } from 'protractor';

export class DashboardPage {

    clickBadge(badge: string) {
        throw new Error('Method not implemented.');
    }

    getTopRow(): any {
        throw new Error('Method not implemented.');
    }

    navigateTo() {
        return browser.get('dashboard') as Promise<any>;
    }

    getBadgeHeader() {
        return element(by.css('.badge-header')).getText() as Promise<string>;
    }
}
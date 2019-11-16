import { browser, by, element } from 'protractor';

export class DashboardPage {

    clickBadge(badge: number) {
        return element(by.css(`.badgeCountImage[data-badge="${badge}"]`)).click();
    }

    getTopRow(): any {
        return element.all(by.css('.over')).map(e => e.getAttribute('src'));
    }

    navigateTo() {
        return browser.get('dashboard') as Promise<any>;
    }

    getBadgeHeader() {
        return element(by.css('.badge-header')).getText() as Promise<string>;
    }
}
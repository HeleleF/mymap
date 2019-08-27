import { Injector } from '@angular/core';

/**
 * Get instance of something without constructor dependency injection
 * see https://stackoverflow.com/a/43695820
 */

export let AppInjector: Injector;

export function setAppInjector(injector: Injector) {
    AppInjector = injector;
}
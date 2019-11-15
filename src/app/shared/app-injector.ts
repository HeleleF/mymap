import { Injector } from '@angular/core';

/**
 * Get instance of something without constructor dependency injection
 * see https://stackoverflow.com/a/43695820
 */

export let AppInjector: Injector;

/**
 * Stores an instance of Injector.
 * 
 * Useful if a class needs a dependency 
 * but cant rely on dependency injection.
 */
export function setAppInjector(injector: Injector) {
    AppInjector = injector;
}

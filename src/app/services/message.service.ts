import { Injectable } from '@angular/core';

import { Subject, Observable } from 'rxjs';

import { ErrorMessage, Message } from '../model/shared.model';

/**
 * A service to pass messages between components.
 */
@Injectable({
	providedIn: 'root'
})
export class MessageService {
	private message$: Subject<Message>;

	constructor() {
		this.message$ = new Subject();
	}

	/**
	 * Provides a way to subscribe to messages.
	 */
	onMessage(): Observable<Message> {
		return this.message$.asObservable();
	}

	/**
	 * Triggers the `next()` method with the given message for all
	 * subscribers of this MessageService.
	 */
	broadcast(msg: Message): void {
		return this.message$.next(msg);
	}

	/**
	 * Triggers the `error()` method with the given error for all
	 * subscribers of this MessageService.
	 */
	fail(msg: ErrorMessage): void {
		return this.message$.error(msg);
	}
}

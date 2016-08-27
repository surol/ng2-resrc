import { EventEmitter } from "@angular/core";
import { AnonymousSubscription } from "rxjs/Subscription";
import { FieldErrors } from "./field-error";
import { RikeEventSource, RikeEvent, RikeErrorEvent } from "./event";
/**
 * Field errors subscription.
 *
 * The `unsubscribe()` method should be called to stop receiving error notifications.
 */
export interface ErrorSubscription {
    /**
     * After this method called the error notifications won't be sent to subscriber.
     *
     * This method should be called in order to release all resources associated with subscription.
     */
    unsubscribe(): void;
    /**
     * Request field errors to be updated by notifying the subscriber.
     *
     * Does nothing after `unsubscribe()` method called.
     */
    refresh(): this;
}
/**
 * An error collecting service.
 *
 * It collects errors from all available [Rike event sources][RikeEventSource]. It uses `fieldErrors()` method
 * to obtain a `FieldErrors` instance from {{RikeErrorEvent}}. Then it notifies all subscribers on when errors received
 * or removed.
 *
 * This service is registered automatically along with every event source by `provideEventSource()` function.
 * But unlike event sources it is not a multi-provider.
 *
 * An instance of this class could be created on its own. Then it is necessary to subscribe it on Rike events with
 * `subscribeOn` method.
 */
export declare class ErrorCollector {
    private _eventSources?;
    private readonly _emitters;
    private readonly _targetErrors;
    private _initialized;
    constructor(_eventSources?: RikeEventSource[]);
    /**
     * Subscribes this collector on the given Rike events emitter.
     *
     * @param events Rike events emitter to subscribe on.
     */
    subscribeOn(events: EventEmitter<RikeEvent>): AnonymousSubscription;
    /**
     * Adds subscription for errors corresponding to the given field.
     *
     * If the field name is `"*"`, then subscriber will be notified on error changes for all fields except those ones
     * with existing subscriptions.
     *
     * @param field target field name.
     * @param next function that will be called on every target field errors update.
     * @param error function that will be called on errors.
     * @param complete function that will be called when no more errors will be reported.
     *
     * @return {ErrorSubscription} subscription.
     */
    subscribe(field: string, next: ((errors: FieldErrors) => void), error?: (error: any) => void, complete?: () => void): ErrorSubscription;
    /**
     * Adds subscription for errors corresponding to all fields except those ones with existing subscriptions.
     *
     * Calling this method is the same as calling `subscribe("*", next, error, complete);`.
     *
     * @param next function that will be called on every errors update.
     * @param error function that will be called on errors.
     * @param complete function that will be called when no more errors will be reported.
     *
     * @return {ErrorSubscription} subscription.
     */
    subscribeForRest(next: ((errors: FieldErrors) => void), error?: (error: any) => void, complete?: () => void): ErrorSubscription;
    /**
     * Converts error to `FieldErrors`.
     *
     * This method uses `addFieldErrors` function by default. Override it if you are using custom error handler.
     *
     * @param error arbitrary error passed in [RikeEvent.error] field.
     *
     * @return {FieldErrors} field errors.
     */
    protected fieldErrors(error: RikeErrorEvent): FieldErrors;
    private fieldEmitter(field);
    private init();
    private handleEvent(event);
    private handleError(error);
    private targetErrors(target);
    private clearTargetErrors(target);
    private notify(field);
}

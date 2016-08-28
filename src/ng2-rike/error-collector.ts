import {Injectable, EventEmitter, Optional, Inject} from "@angular/core";
import {AnonymousSubscription} from "rxjs/Subscription";
import {FieldErrors, FieldError, addFieldErrors} from "./field-error";
import {RikeEventSource, RikeEvent, RikeErrorEvent} from "./event";
import {RikeTarget} from "./rike";

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
@Injectable()
export class ErrorCollector {

    private readonly _emitters: {[field: string]: FieldEmitter} = {};
    private readonly _targetErrors: {[target: string]: TargetErrors} = {};
    private _initialized = false;

    constructor(@Inject(RikeEventSource) @Optional() private _eventSources?: RikeEventSource[]) {
    }

    /**
     * Subscribes this collector on the given Rike events emitter.
     *
     * @param events Rike events emitter to subscribe on.
     */
    public subscribeOn(events: EventEmitter<RikeEvent>): AnonymousSubscription {
        return events.subscribe(
            (event: RikeEvent) => this.handleEvent(event),
            (error: RikeErrorEvent) => this.handleError(error));
    }

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
    public subscribe(
        field: string,
        next: ((errors: FieldErrors) => void),
        error?: (error: any) => void,
        complete?: () => void): ErrorSubscription {
        this.init();
        return this.fieldEmitter(field).subscribe(next, error, complete);
    }

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
    public subscribeForRest(
        next: ((errors: FieldErrors) => void),
        error?: (error: any) => void,
        complete?: () => void): ErrorSubscription {
        return this.subscribe("*", next, error, complete);
    }

    //noinspection JSMethodCanBeStatic
    /**
     * Converts error to `FieldErrors`.
     *
     * This method uses `addFieldErrors` function by default. Override it if you are using custom error handler.
     *
     * @param error arbitrary error passed in [RikeEvent.error] field.
     *
     * @return {FieldErrors} field errors.
     */
    protected fieldErrors(error: RikeErrorEvent): FieldErrors {

        const errorResponse = error.errorResponse;

        if (errorResponse) {
            return addFieldErrors(errorResponse).fieldErrors;
        }

        return {
            "*": [
                {message: error.error.toString()} as FieldError
            ]
        };
    }

    private fieldEmitter(field: string) {
        return this._emitters[field] || (
            this._emitters[field] = new FieldEmitter(field, this._emitters, this._targetErrors));
    }

    private init() {
        if (this._initialized) {
            return;
        }

        this._initialized = true;
        if (this._eventSources) {
            for (let src of this._eventSources) {
                this.subscribeOn(src.rikeEvents);
            }
        }
    }

    private handleEvent(event: RikeEvent) {

        let affectedFields: {[field: string]: any};

        if (!event.error) {
            affectedFields = this.clearTargetErrors(event.target);
        } else {
            affectedFields = this.targetErrors(event.target)
                .addAll(this.fieldErrors((event as any) as RikeErrorEvent));
        }

        for (let field in affectedFields) {
            if (affectedFields.hasOwnProperty(field)) {
                this.notify(field);
            }
        }
    }

    private handleError(error: RikeErrorEvent) {
        this.targetErrors(error.target).add("*", {message: error.error.toString()});
        this.notify("*");
    }

    private targetErrors(target: RikeTarget<any, any>): TargetErrors {

        const id = target.uniqueId;

        return this._targetErrors[id] || (this._targetErrors[id] = new TargetErrors(target, this._emitters));
    }

    private clearTargetErrors(target: RikeTarget<any, any>): {[field: string]: any} {

        const id = target.uniqueId;
        const targetErrors = this._targetErrors[id];

        if (!targetErrors) {
            return {};
        }

        delete this._targetErrors[id];

        return targetErrors.fieldsWithErrors;
    }

    private notify(field: string) {

        const emitter = this._emitters[field];

        if (emitter) {
            emitter.notify();
        }
    }

}

class FieldEmitter {

    private _emitter = new EventEmitter<FieldErrors>();
    private _counter = 0;

    constructor(
        private _field: string,
        private _emitters: {[field: string]: FieldEmitter},
        private _targetErrors: {[target: string]: TargetErrors}) {
    }

    subscribe(
        next: ((errors: FieldErrors) => void),
        error?: (error: any) => void,
        complete?: () => void): ErrorSubscription {

        const subscr = this._emitter.subscribe(next, error, complete) as AnonymousSubscription;

        this._counter++;

        return new ErrorSubscr(this, subscr).subscribe(next, error, complete);
    }

    notify(emitter?: EventEmitter<FieldErrors>) {

        const errors: FieldErrors = {};

        for (let id in this._targetErrors) {
            if (this._targetErrors.hasOwnProperty(id)) {
                this._targetErrors[id].appendTo(this._field, errors);
            }
        }

        (emitter || this._emitter).emit(errors);
    }

    unsubscribed() {
        if (!--this._counter) {
            delete this._emitters[this._field];
        }
    }

}

class ErrorSubscr implements ErrorSubscription {

    private readonly _refreshEmitter = new EventEmitter<FieldErrors>();
    private _refreshSubscription: AnonymousSubscription;

    constructor(private _fieldEmitter: FieldEmitter, private _subscription?: AnonymousSubscription) {
    }

    subscribe(
        next: ((errors: FieldErrors) => void),
        error?: (error: any) => void,
        complete?: () => void): this {
        this._refreshSubscription = this._refreshEmitter.subscribe(next, error, complete);
        return this;
    }

    unsubscribe(): void {
        if (!this._subscription) {
            return;
        }
        try {
            this._subscription.unsubscribe();
            this._refreshSubscription.unsubscribe();
        } finally {
            delete this._subscription;
            this._fieldEmitter.unsubscribed();
        }
    }

    refresh(): this {
        if (!this._subscription) {
            return this;
        }
        this._fieldEmitter.notify(this._refreshEmitter);
        return this;
    }

}

class TargetErrors {

    private _errors: FieldErrors;

    constructor(
        public target: RikeTarget<any, any>,
        private _emitters: {[field: string]: any},
        errors?: FieldErrors) {
        this._errors = errors || {};
    }

    get fieldsWithErrors(): {[field: string]: any} {
        return this._errors;
    }

    add(field: string, ...errors: FieldError[]) {

        const existing = this._errors[field];

        if (!existing) {
            this._errors[field] = errors;
        } else {
            this._errors[field].push(...errors);
        }
    }

    addAll(errors: FieldErrors): {[field: string]: any} {
        for (let field in errors) {
            if (errors.hasOwnProperty(field)) {
                this.add(field, ...errors[field]);
            }
        }
        return errors;
    }

    appendTo(field: string, out: FieldErrors) {
        if (field !== "*") {
            // Append errors for the given field.
            appendErrorsTo(field, out, this._errors[field]);
            return;
        }

        // Append errors for all fields except the ones with subscribers.
        for (let f in this._errors) {
            if (f === "*" || this._errors.hasOwnProperty(f) && !this._emitters[f]) {
                appendErrorsTo(f, out, this._errors[f]);
            }
        }
    }

}

function appendErrorsTo(field: string, fieldErrors: FieldErrors, errors: FieldError[] | undefined) {
    if (!errors || !errors.length) {
        return;
    }

    const errs = fieldErrors[field];

    if (errs) {
        errs.push(...errors);
    } else {
        fieldErrors[field] = errors;
    }
}

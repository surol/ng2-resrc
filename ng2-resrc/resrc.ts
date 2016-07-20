import {Injectable, Optional, EventEmitter} from "@angular/core";
import {Request, RequestOptionsArgs, Response, Http} from "@angular/http";
import {Observable, Observer, Subscription} from "rxjs/Rx";
import {ResrcEvent, ResrcErrorEvent, ResrcSuccessEvent, ResrcOperationEvent, ResrcCancelEvent} from "./event";
import {ResrcOptions, DEFAULT_RESRC_OPTIONS} from "./options";

/**
 * REST-like resource operations service.
 *
 * This service can be injected to other services or components.
 *
 * It basically mimics the `Http` interface, but also honors [global options][ResrcOptions].
 *
 * It can also be used to perform operations on particular targets.
 */
@Injectable()
export class Resrc {

    private readonly _options: ResrcOptions;
    private readonly _events = new EventEmitter<ResrcEvent>();
    private readonly _internals: ResrcInternals = {
        wrapResponse: (target, operation, response) => this.wrapResponse(target, operation, response)
    };

    constructor(private _http: Http, @Optional() _options?: ResrcOptions) {
        this._options = _options || DEFAULT_RESRC_OPTIONS;
    }

    /**
     * Global REST-like resource access options.
     *
     * @returns {ResrcOptions} either pre-configured, or [default][DEFAULT_RESRC_OPTIONS] options.
     */
    get options(): ResrcOptions {
        return this._options;
    }

    /**
     * All REST-like resource operation events emitter.
     *
     * @returns {EventEmitter<ResrcEvent>}
     */
    get events(): EventEmitter<ResrcEvent> {
        return this._events;
    }

    request(request: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        options = this.updateRequestOptions(options);
        if (typeof request === "string") {
            request = this.options.relativeUrl(request);
        }
        return this._http.request(request, options);
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.get(this.options.relativeUrl(url), this.updateRequestOptions(options));
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.post(this.options.relativeUrl(url), body, this.updateRequestOptions(options));
    }

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.put(this.options.relativeUrl(url), body, this.updateRequestOptions(options));
    }

    //noinspection ReservedWordAsName
    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.delete(this.options.relativeUrl(url), this.updateRequestOptions(options));
    }

    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.patch(this.options.relativeUrl(url), body, this.updateRequestOptions(options));
    }

    head(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.head(this.options.relativeUrl(url), this.updateRequestOptions(options));
    }

    /**
     * Constructs operation target.
     *
     * @param target arbitrary target value.
     *
     * @returns {ResrcTargetImpl} new operation target.
     */
    target(target: any): ResrcTarget {

        const targetResrc = new ResrcTargetImpl(this, this._internals, target);

        targetResrc.events.subscribe(
            (event: ResrcEvent) => this._events.emit(event),
            (error: any) => this._events.error(error),
            () => this._events.complete());

        return targetResrc;
    }

    /**
     * Updates HTTP request options accordingly to global _options_.
     *
     * @param options HTTP request options to update.
     *
     * @returns {RequestOptionsArgs} either new HTTP options instance, or the _options_ argument if no modifications
     * done.
     */
    protected updateRequestOptions(options?: RequestOptionsArgs): RequestOptionsArgs | undefined {
        if (!options) {
            return options;
        }
        if (options.url != null) {

            var newUrl = this._options.relativeUrl(options.url);

            if (newUrl !== options.url) {
                options = {
                    url: newUrl,
                    method: options.method,
                    search: options.search,
                    headers: options.headers,
                    body: options.body,
                    withCredentials: options.withCredentials,
                }
            }
        }

        return options;
    }

    //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
    /**
     * Wraps the HTTP response observable for the given operation.
     *
     * @param _target operation target.
     * @param _operation operation name.
     * @param response
     * @returns {Observable<Response>}
     */
    protected wrapResponse(
        _target: ResrcTarget,
        _operation: ResrcOperation,
        response: Observable<Response>): Observable<Response> {
        return response;
    }

}

/**
 * REST-like operations target.
 *
 * Operation targets are created using [Resrc.target] method. The actual operations should be created first with
 * _operation_ method.
 *
 * Only one operation can be performed on a target at a time. Whenever a new operation on the same target is initiated,
 * the previous one is cancelled.
 */
export interface ResrcTarget {

    /**
     * Operation target value.
     *
     * This is the value passed to the [Resrc.target] method.
     */
    readonly target: any;

    /**
     * A currently evaluating operation's name.
     *
     * `undefined` if no operations currently in process, i.e. operation not started, cancelled, or completed, either
     * successfully or with error.
     */
    readonly currentOperation?: string;

    /**
     * An emitter of events for operations performed on this target.
     */
    readonly events: EventEmitter<ResrcEvent>;

    /**
     * Creates an operation on this target.
     *
     * @param operation operation name.
     */
    operation(operation: string): ResrcOperation;

    /**
     * Cancels current operation, if any.
     *
     * @return `true` if operation cancelled, or `false` if there is no operation to cancel.
     */
    cancel(): boolean;

}

//noinspection ReservedWordAsName
/**
 * REST-like resource operation.
 *
 * It basically mimics the `Http` service interface, but also honors global REST-like resource access options, and emits
 * events.
 *
 * To initiate operation just call any of the HTTP access methods. Note that operation always belongs to its target
 * and thus two operations could not be initiated simultaneously.
 */
export interface ResrcOperation {

    /**
     * Operation target.
     */
    readonly target: ResrcTarget;

    /**
     * Operation name.
     */
    readonly name: string;

    request(request: string | Request, options?: RequestOptionsArgs): Observable<Response>;

    get(url: string, options?: RequestOptionsArgs): Observable<Response>;

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;

    delete(url: string, options?: RequestOptionsArgs): Observable<Response>;

    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;

    head(url: string, options?: RequestOptionsArgs): Observable<Response>;

}

interface ResrcInternals {

    wrapResponse(target: ResrcTarget, operation: ResrcOperation, response: Observable<Response>): Observable<Response>;

}

class ResrcTargetImpl implements ResrcTarget {

    private readonly _events = new EventEmitter<ResrcEvent>();
    private _operation?: ResrcOperationEvent;
    private _response?: Observable<Response>;
    private _observer?: Observer<Response>;
    private _subscr?: Subscription;

    constructor(private _resrc: Resrc, private _internals: ResrcInternals, private _target: any) {
    }

    get resrc(): Resrc {
        return this._resrc;
    }

    get target(): any {
        return this._target;
    }

    get currentOperation(): string | undefined {
        return this._operation && this._operation.operation;
    }

    get events(): EventEmitter<ResrcEvent> {
        return this._events;
    }

    get internal(): ResrcInternals {
        return this._internals;
    }

    cancel(): boolean {
        return this._cancel();
    }

    private _cancel(cause?: ResrcOperationEvent): boolean {
        if (!this._operation) {
            return false;
        }

        this._response = undefined;
        try {
            if (this._observer) {
                try {

                    const cancel = new ResrcCancelEvent(this.target, this._operation.operation, cause);

                    this._observer.error(cancel);
                    this._events.error(cancel);
                } catch (e) {
                    this._events.error(new ResrcErrorEvent(this.target, this._operation.operation, e));
                    throw e;
                } finally {
                    this._operation = undefined;
                    try {
                        this._observer.complete();
                    } finally {
                        this._observer = undefined;
                    }
                }
            }
        } finally {
            if (this._subscr) {
                this._subscr.unsubscribe();
                this._subscr = undefined;
            }
        }

        return true;
    }

    operation(operation: string): ResrcOperation {
        return new ResrcOperationImpl(this, operation);
    }

    startOperation(operation: ResrcOperation): void {

        const event = new ResrcOperationEvent(this.target, operation.name);

        this._cancel(event);
        try {
            this._events.emit(event);
            this._operation = event;
        } catch (e) {
            this._events.error(new ResrcErrorEvent(this.target, operation.name, e));
            throw e;
        }
    }

    wrapResponse(operation: ResrcOperation, response: Observable<Response>): Observable<Response> {
        response = this.internal.wrapResponse(this, operation, response);
        this._response = response;
        return new Observable<Response>((responseObserver: Observer<Response>) => {
            if (this._response !== response) {
                return;// Another request already initiated
            }
            this._observer = responseObserver;
            this._subscr = response.subscribe(
                response => {
                    try {
                        responseObserver.next(response);
                        this._events.emit(new ResrcSuccessEvent(this.target, operation.name, response));
                    } catch (e) {
                        this._events.error(new ResrcErrorEvent(this.target, operation.name, e));
                    }
                },
                error => {
                    console.error("[" + this.target + "] " + operation + " failed", error);
                    try {
                        responseObserver.error(error);
                        this._events.emit(new ResrcErrorEvent(this.target, operation.name, error));
                    } catch (e) {
                        this._events.error(new ResrcErrorEvent(this.target, operation.name, e));
                    }
                },
                () => {
                    try {
                        responseObserver.complete();
                    } catch (e) {
                        this._events.error(new ResrcErrorEvent(this.target, operation.name, e));
                    } finally {
                        if (this._subscr) {
                            this._subscr.unsubscribe();
                            this._subscr = undefined;
                            this._response = undefined;
                        }
                    }
                });
        });
    }

}

class ResrcOperationImpl implements ResrcOperation {

    constructor(private _target: ResrcTargetImpl, private _name: string) {
    }

    get resrc(): Resrc {
        return this.target.resrc;
    }

    get target(): ResrcTargetImpl {
        return this._target;
    }

    get name(): string {
        return this._name;
    }

    request(request: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        this.startOperation();
        return this.wrapResponse(this.resrc.request(request, options));
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        this.startOperation();
        return this.wrapResponse(this.resrc.get(url, options));
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        this.startOperation();
        return this.wrapResponse(this.resrc.post(url, body, options));
    }

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        this.startOperation();
        return this.wrapResponse(this.resrc.put(url, body, options));
    }

    //noinspection ReservedWordAsName
    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        this.startOperation();
        return this.wrapResponse(this.resrc.delete(url, options));
    }

    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        this.startOperation();
        return this.wrapResponse(this.resrc.patch(url, body, options));
    }

    head(url: string, options?: RequestOptionsArgs): Observable<Response> {
        this.startOperation();
        return this.wrapResponse(this.resrc.head(url, options));
    }

    private startOperation() {
        this.target.startOperation(this);
    }

    private wrapResponse(response: Observable<Response>): Observable<Response> {
        return this.target.wrapResponse(this, response);
    }

}

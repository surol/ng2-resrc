declare module "ng2-rike/event" {
    /**
     * Basic REST-like resource access event.
     *
     * Such events are emitted by [operations on REST-like resources][RikeOperation.events].
     */
    export abstract class RikeEvent {
        /**
         * Operation target.
         *
         * This is the value passed to the [Resrc.target] method.
         */
        readonly abstract target: any;
        /**
         * Operation name.
         *
         * This is the value passed to the [ResrcTarget.operation] method
         */
        readonly abstract operation: string;
        /**
         * Whether an operation is complete.
         *
         * `true` on error or successful completion event.
         */
        readonly abstract complete: boolean;
        /**
         * The error occurred.
         *
         * `undefined` if this is not an error event.
         */
        readonly abstract error?: any;
        /**
         * Operation result, if any.
         */
        readonly abstract result?: any;
    }
    /**
     * An event emitted when operation on a REST-like resource is started.
     */
    export class RikeOperationEvent extends RikeEvent {
        private _target;
        private _operation;
        constructor(_target: any, _operation: string);
        readonly target: any;
        readonly operation: string;
        readonly complete: boolean;
        readonly error: undefined;
        readonly result: undefined;
    }
    /**
     * An event emitted when operation on a REST-like resource is successfully completed.
     */
    export class RikeSuccessEvent extends RikeEvent {
        private _target;
        private _operation;
        private _result;
        constructor(_target: any, _operation: string, _result: any);
        readonly target: any;
        readonly operation: string;
        readonly complete: boolean;
        readonly error: undefined;
        readonly result: any;
    }
    /**
     * An event emitted when operation on a REST-like resource is failed.
     *
     * An object of this type is also reported as error when some internal exception occurs.
     */
    export class RikeErrorEvent extends RikeEvent {
        private _target;
        private _operation;
        private _error;
        constructor(_target: any, _operation: string, _error: any);
        readonly target: any;
        readonly operation: string;
        readonly complete: boolean;
        readonly error: any;
        readonly result: undefined;
    }
    /**
     * An event emitted when operation on a REST-like resource is cancelled.
     */
    export class RikeCancelEvent extends RikeErrorEvent {
        private _cause?;
        constructor(target: any, operation: string, _cause?: RikeOperationEvent);
        readonly cause: RikeOperationEvent | undefined;
    }
}
declare module "ng2-rike/options" {
    /**
     * Default resource options.
     *
     * @type {RikeOptions}
     */
    export const DEFAULT_RIKE_OPTIONS: RikeOptions;
    /**
     * Global resource options.
     *
     * To overwrite global options add a provider for [BaseRikeOptions] instance with [RikeOptions] as a key:
     * ```ts
     * bootstrap(AppComponent, {provide: RikeOptions, new BaseRikeOptions({baseDir: "/rike"})});
     * ```
     */
    export abstract class RikeOptions {
        /**
         * Base URL of all relative URLs
         */
        readonly abstract baseUrl?: string;
        /**
         * Constructs URL relative to _baseUrl_.
         *
         * @param url URL
         *
         * @returns {string} If _baseUrl_ is not set, or _url_ is absolute, then returns unmodified _url_.
         * Otherwise concatenates _baseUrl_ and _url_ separating them by `/` sign.
         */
        relativeUrl(url: string): string;
    }
    /**
     * Basic [global resource options][RikeOptions] implementation.
     *
     * Can be used to override the global resource options.
     */
    export class BaseRikeOptions extends RikeOptions {
        private _baseUrl?;
        constructor(opts?: RikeOptions);
        readonly baseUrl: string | undefined;
    }
}
declare module "ng2-rike/rike" {
    import { EventEmitter } from "@angular/core";
    import { Request, RequestOptionsArgs, Response, Http } from "@angular/http";
    import { Observable } from "rxjs/Rx";
    import { RikeEvent } from "ng2-rike/event";
    import { RikeOptions } from "ng2-rike/options";
    /**
     * REST-like resource operations service.
     *
     * This service can be injected to other services or components.
     *
     * It basically mimics the `Http` interface, but also honors [global Rike options][RikeOptions].
     *
     * It can also be used to perform operations on particular targets.
     */
    export class Rike {
        private _http;
        private readonly _options;
        private readonly _events;
        private readonly _internals;
        constructor(_http: Http, _options?: RikeOptions);
        /**
         * Global REST-like resource access options.
         *
         * @returns {RikeOptions} either pre-configured, or [default][DEFAULT_RIKE_OPTIONS] options.
         */
        readonly options: RikeOptions;
        /**
         * All REST-like resource operation events emitter.
         *
         * @returns {EventEmitter<RikeEvent>}
         */
        readonly events: EventEmitter<RikeEvent>;
        request(request: string | Request, options?: RequestOptionsArgs): Observable<Response>;
        get(url: string, options?: RequestOptionsArgs): Observable<Response>;
        post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
        put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
        delete(url: string, options?: RequestOptionsArgs): Observable<Response>;
        patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
        head(url: string, options?: RequestOptionsArgs): Observable<Response>;
        /**
         * Constructs operation target.
         *
         * @param target arbitrary target value.
         *
         * @returns {RikeTargetImpl} new operation target.
         */
        target(target: any): RikeTarget;
        /**
         * Updates HTTP request options accordingly to global _options_.
         *
         * @param options HTTP request options to update.
         *
         * @returns {RequestOptionsArgs} either new HTTP options instance, or the _options_ argument if no modifications
         * done.
         */
        protected updateRequestOptions(options?: RequestOptionsArgs): RequestOptionsArgs | undefined;
        /**
         * Wraps the HTTP response observable for the given operation.
         *
         * @param _target operation target.
         * @param _operation operation name.
         * @param response
         * @returns {Observable<Response>}
         */
        protected wrapResponse(_target: RikeTarget, _operation: RikeOperation, response: Observable<Response>): Observable<Response>;
    }
    /**
     * REST-like operations target.
     *
     * Operation targets are created using [Rike.target] method. The actual operations should be created first with
     * _operation_ method.
     *
     * Only one operation can be performed on a target at a time. Whenever a new operation on the same target is initiated,
     * the previous one is cancelled.
     */
    export interface RikeTarget {
        /**
         * Operation target value.
         *
         * This is the value passed to the [Rike.target] method.
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
        readonly events: EventEmitter<RikeEvent>;
        /**
         * Creates an operation on this target.
         *
         * @param operation operation name.
         */
        operation(operation: string): RikeOperation;
        /**
         * Cancels current operation, if any.
         *
         * @return `true` if operation cancelled, or `false` if there is no operation to cancel.
         */
        cancel(): boolean;
    }
    /**
     * REST-like resource operation.
     *
     * It basically mimics the `Http` service interface, but also honors global Rike options, and emits events.
     *
     * To initiate operation just call any of the HTTP access methods. Note that operation always belongs to its target
     * and thus two operations could not be initiated simultaneously.
     */
    export interface RikeOperation {
        /**
         * Operation target.
         */
        readonly target: RikeTarget;
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
}
declare module "ng2-rike" {
    export * from "ng2-rike/event";
    export * from "ng2-rike/options";
    export * from "ng2-rike/rike";
    /**
     * Provides a basic set of providers to use REST-like services in application.
     *
     * The `RIKE_PROVIDERS` should be included either in a component's injector, or in the root injector when bootstrapping
     * an application.
     *
     * @type {any[]}
     */
    export const RIKE_PROVIDERS: any[];
}

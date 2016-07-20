declare module "ng2-resrc/event" {
    /**
     * Basic REST-like resource access event.
     *
     * Such events are emitted by [operations on REST-like resources][ResrcOperation.event].
     */
    export abstract class ResrcEvent {
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
    export class ResrcOperationEvent extends ResrcEvent {
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
    export class ResrcSuccessEvent extends ResrcEvent {
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
    export class ResrcErrorEvent extends ResrcEvent {
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
    export class ResrcCancelEvent extends ResrcErrorEvent {
        private _cause?;
        constructor(target: any, operation: string, _cause?: ResrcOperationEvent);
        readonly cause: ResrcOperationEvent | undefined;
    }
}
declare module "ng2-resrc/options" {
    /**
     * Default resource options.
     *
     * @type {ResrcOptions}
     */
    export const DEFAULT_RESRC_OPTIONS: ResrcOptions;
    /**
     * Global resource options.
     *
     * To overwrite global options add a provider for [BaseResrcOptions] instance with [ResrcOptions] as a key:
     * ```ts
     * bootstrap(AppComponent, {provide: ResrcOptions, new BaseResrcOptions({baseDir: "/rest"})});
     * ```
     */
    export abstract class ResrcOptions {
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
     * Basic [global resource options][ResrcOptions] implementation.
     *
     * Can be used to override the global resource options.
     */
    export class BaseResrcOptions extends ResrcOptions {
        private readonly _baseUrl?;
        constructor(opts?: ResrcOptions);
        readonly baseUrl: string | undefined;
    }
}
declare module "ng2-resrc/resrc" {
    import { EventEmitter } from "@angular/core";
    import { Request, RequestOptionsArgs, Response, Http } from "@angular/http";
    import { Observable } from "rxjs/Rx";
    import { ResrcEvent } from "ng2-resrc/event";
    import { ResrcOptions } from "ng2-resrc/options";
    /**
     * REST-like resource operations service.
     *
     * This service can be injected to other services or components.
     *
     * It basically mimics the `Http` interface, but also honors [global options][ResrcOptions].
     *
     * It can also be used to perform operations on particular targets.
     */
    export class Resrc {
        private _http;
        private readonly _options;
        private readonly _events;
        private readonly _internals;
        constructor(_http: Http, _options?: ResrcOptions);
        /**
         * Global REST-like resource access options.
         *
         * @returns {ResrcOptions} either pre-configured, or [default][DEFAULT_RESRC_OPTIONS] options.
         */
        readonly options: ResrcOptions;
        /**
         * All REST-like resource operation events emitter.
         *
         * @returns {EventEmitter<ResrcEvent>}
         */
        readonly events: EventEmitter<ResrcEvent>;
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
         * @returns {ResrcTargetImpl} new operation target.
         */
        target(target: any): ResrcTarget;
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
        protected wrapResponse(_target: ResrcTarget, _operation: ResrcOperation, response: Observable<Response>): Observable<Response>;
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
}
declare module "ng2-resrc" {
    export * from "ng2-resrc/event";
    export * from "ng2-resrc/options";
    export * from "ng2-resrc/resrc";
    /**
     * Provides a basic set of providers to use REST-like services in application.
     *
     * The RESRC_PROVIDERS should be included either in a component's injector, or in the root injector when bootstrapping
     * an application.
     *
     * @type {any[]}
     */
    export const RESRC_PROVIDERS: any[];
}

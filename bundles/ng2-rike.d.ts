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
         * This is the value passed to the [Rike.target] method.
         */
        readonly abstract target: any;
        /**
         * Operation name.
         *
         * This is the value passed to the [RikeTarget.operation] method
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
declare module "ng2-rike/data" {
    import { Response, RequestOptionsArgs } from "@angular/http";
    /**
     * REST-like operations data type.
     *
     * It is used by REST-like operations to encode operation requests to HTTP, and to decode operation responses from HTTP.
     *
     * Some of the data types may support only request or response operations, but not both.
     *
     * `T` is operation request type, operation response type, or both.
     */
    export abstract class DataType<T> {
        /**
         * Reads operation response from HTTP response.
         *
         * @param response HTTP response.
         *
         * @returns operation response.
         */
        abstract readResponse(response: Response): T;
        /**
         * Prepares HTTP request.
         *
         * The `options` passed have at least `url` and `method` fields set.
         *
         * This method is called for each HTTP request before _writeRequest_ method. When default data type is set for
         * operation target, this method is called first on the default data type, and then - on the operation data type.
         *
         * @param options original HTTP request options.
         *
         * @returns modified HTTP request options to use further instead of original ones. Returns unmodified request
         * `options` by default.
         */
        prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs;
        /**
         * Writes operation request as HTTP request.
         *
         * This method is invoked only for HTTP request methods that expect request body.
         *
         * The `options` are the result of `prepareRequest` method invocation. It is expected that the result options will
         * contain a `body` field set.
         *
         * @param request operation request to encode
         * @param options original HTTP request options.
         *
         * @return modified HTTP request options that will be used to perform actual request.
         */
        abstract writeRequest(request: T, options: RequestOptionsArgs): RequestOptionsArgs;
    }
    /**
     * JSON data type.
     *
     * Sends and receives arbitrary data as JSON over HTTP.
     *
     * @type {DataType<any>}
     */
    export const JSON_DATA_TYPE: DataType<any>;
    /**
     * Returns JSON data type.
     *
     * Sends and receives the data of the given type as JSON over HTTP.
     */
    export const jsonDataType: (<T>() => DataType<T>);
    /**
     * HTTP response data type.
     *
     * This data type can not be used to post requests.
     *
     * @type {DataType<Response>}
     */
    export const HTTP_RESPONSE_DATA_TYPE: DataType<Response>;
    export abstract class RequestBodyType<T> extends DataType<T> {
        abstract readResponse(response: Response): T;
        writeRequest(request: T, options: RequestOptionsArgs): RequestOptionsArgs;
        abstract writeBody(request: T): any;
    }
}
declare module "ng2-rike/rike" {
    import { EventEmitter } from "@angular/core";
    import { Request, RequestOptionsArgs, Response, Http, RequestMethod, RequestOptions } from "@angular/http";
    import { Observable } from "rxjs/Rx";
    import { RikeEvent } from "ng2-rike/event";
    import { RikeOptions } from "ng2-rike/options";
    import { DataType } from "ng2-rike/data";
    export function requestMethod(method?: string | RequestMethod): RequestMethod;
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
        constructor(_http: Http, defaultHttpOptions: RequestOptions, _options?: RikeOptions);
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
         * Constructs operation target, which operations produce HTTP responses ([HTTP_RESPONSE_DATA_TYPE]).
         *
         * Note that this data type can not be used to post requests.
         *
         * @param target arbitrary target value.
         *
         * @returns {RikeTargetImpl} new operation target.
         */
        target(target: any): RikeTarget<Response>;
        /**
         * Constructs operations target, which operates on the given data type.
         *
         * @param target arbitrary target value.
         * @param dataType operations data type.
         *
         * @return {RikeTargetImpl<T>} new operations target.
         */
        target<T>(target: any, dataType: DataType<T>): RikeTarget<T>;
        /**
         * Constructs operations target, which operates on the given data type passing it as JSON over HTTP.
         *
         * @param target arbitrary target value.
         *
         * @return {RikeTarget<T>} new operations target.
         */
        json<T>(target: any): RikeTarget<T>;
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
        protected wrapResponse(_target: RikeTarget<any>, _operation: RikeOperation<any>, response: Observable<Response>): Observable<Response>;
    }
    /**
     * REST-like operations target.
     *
     * Operation targets are created using [Rike.target] method. The actual operations should be created first with
     * _operation_ method.
     *
     * Only one operation can be performed on a target at a time. Whenever a new operation on the same target is initiated,
     * the previous one is cancelled.
     *
     * `T` is a data type this target operates over by default.
     */
    export interface RikeTarget<T> {
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
         * An operations data type to use by default.
         *
         * This is the data type to the [Rike.target] method.
         */
        readonly dataType: DataType<T>;
        /**
         * Constructs an operation on this target, which produces responses of type `T`.
         *
         * The target data type (_dataType_) passed to the [Rike.target] will be used to encode/decode operation data.
         *
         * @param operation operation name.
         */
        operation(operation: string): RikeOperation<T>;
        /**
         * Constructs an operation on this target, which produces responses of the given type.
         *
         * @param operation operation name.
         * @param dataType operation data type.
         */
        operation<T>(operation: string, dataType: DataType<T>): RikeOperation<T>;
        /**
         * Constructs an operations on this target, which operates on the given data type passing it as JSON over HTTP.
         *
         * @param operation operation name.
         *
         * @return {RikeTarget<T>} new operations target.
         */
        json<T>(operation: string): RikeOperation<T>;
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
     *
     * `T` is a type of responses this operation produces.
     */
    export interface RikeOperation<T> {
        /**
         * Operation target.
         */
        readonly target: RikeTarget<any>;
        /**
         * Operation name.
         */
        readonly name: string;
        /**
         * Operation data type.
         *
         * This data type is based on the one passed to the [RikeTarget.operation], but also honors the default data type
         * set for target.
         */
        readonly dataType: DataType<T>;
        request(request: string | Request, options?: RequestOptionsArgs): Observable<T>;
        get(url: string, options?: RequestOptionsArgs): Observable<T>;
        post(url: string, body: any, options?: RequestOptionsArgs): Observable<T>;
        put(url: string, body: any, options?: RequestOptionsArgs): Observable<T>;
        delete(url: string, options?: RequestOptionsArgs): Observable<T>;
        patch(url: string, body: any, options?: RequestOptionsArgs): Observable<T>;
        head(url: string, options?: RequestOptionsArgs): Observable<T>;
    }
}
declare module "ng2-rike" {
    export * from "ng2-rike/data";
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

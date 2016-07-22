/// <reference types="core-js" />
declare module "ng2-rike/event" {
    import { EventEmitter, Type } from "@angular/core";
    import { RikeTarget, RikeOperation } from "ng2-rike/rike";
    /**
     * REST-like resource access event emitter.
     *
     * Multiple instances of this class could be injected into controller or service to listen for Rike events.
     */
    export abstract class RikeEventSource {
        /**
         * Constructs provider recipe for [RikeEventSource]
         *
         * @param useClass
         * @param useValue
         * @param useExisting
         * @param useFactory
         * @param deps
         *
         * @return new provider recipe.
         */
        static provide({useClass, useValue, useExisting, useFactory, deps}: {
            useClass?: Type;
            useValue?: any;
            useExisting?: any;
            useFactory?: Function;
            deps?: Object[];
            multi?: boolean;
        }): any;
        /**
         * Rike events emitter.
         */
        readonly abstract rikeEvents: EventEmitter<RikeEvent>;
    }
    /**
     * Basic REST-like resource access event.
     *
     * Such events are emitted by [Rike event sources][RikeEventsSource].
     */
    export abstract class RikeEvent {
        /**
         * Operation target.
         */
        readonly target: RikeTarget<any, any>;
        /**
         * Rike operation.
         */
        readonly abstract operation: RikeOperation<any, any>;
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
        private _operation;
        constructor(_operation: RikeOperation<any, any>);
        readonly operation: RikeOperation<any, any>;
        readonly complete: boolean;
        readonly error: undefined;
        readonly result: undefined;
    }
    /**
     * An event emitted when operation on a REST-like resource is successfully completed.
     */
    export class RikeSuccessEvent extends RikeEvent {
        private _operation;
        private _result;
        constructor(_operation: RikeOperation<any, any>, _result: any);
        readonly operation: RikeOperation<any, any>;
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
        private _operation;
        private _error;
        constructor(_operation: RikeOperation<any, any>, _error: any);
        readonly operation: RikeOperation<any, any>;
        readonly complete: boolean;
        readonly error: any;
        readonly result: undefined;
    }
    /**
     * An event emitted when operation on a REST-like resource is cancelled.
     */
    export class RikeCancelEvent extends RikeErrorEvent {
        private _cause?;
        constructor(operation: RikeOperation<any, any>, _cause?: RikeOperationEvent);
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
     * `IN` is operation request type.
     * `OUT` is operation response type.
     */
    export abstract class DataType<IN, OUT> {
        /**
         * Reads operation response from HTTP response.
         *
         * @param response HTTP response.
         *
         * @returns operation response.
         */
        abstract readResponse(response: Response): OUT;
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
        abstract writeRequest(request: IN, options: RequestOptionsArgs): RequestOptionsArgs;
        readResponseWith<OUT>(readResponse: (response: Response) => OUT): DataType<IN, OUT>;
    }
    /**
     * JSON data type.
     *
     * Sends and receives arbitrary data as JSON over HTTP.
     *
     * @type {DataType<any>}
     */
    export const JSON_DATA_TYPE: DataType<any, any>;
    /**
     * Returns JSON data type.
     *
     * Sends and receives the data of the given type as JSON over HTTP.
     */
    export const jsonDataType: (<T>() => DataType<T, T>);
    /**
     * HTTP response data type.
     *
     * The request type is any. It is used as request body.
     *
     * @type {DataType<any, Response>}
     */
    export const HTTP_RESPONSE_DATA_TYPE: DataType<any, Response>;
    export abstract class RequestBodyType<T> extends DataType<T, T> {
        abstract readResponse(response: Response): T;
        writeRequest(request: T, options: RequestOptionsArgs): RequestOptionsArgs;
        abstract writeBody(request: T): any;
    }
}
declare module "ng2-rike/rike" {
    import { EventEmitter } from "@angular/core";
    import { Request, RequestOptionsArgs, Response, Http, RequestMethod, RequestOptions } from "@angular/http";
    import { Observable } from "rxjs/Rx";
    import { RikeEvent, RikeEventSource } from "ng2-rike/event";
    import { RikeOptions } from "ng2-rike/options";
    import { DataType } from "ng2-rike/data";
    export function requestMethod(method: string | RequestMethod): RequestMethod;
    /**
     * REST-like resource operations service.
     *
     * This service can be injected to other services or components.
     *
     * It basically mimics the `Http` interface, but also honors [global Rike options][RikeOptions].
     *
     * It can also be used to perform operations on particular targets.
     */
    export class Rike implements RikeEventSource {
        private _http;
        private readonly _options;
        private readonly _rikeEvents;
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
        readonly rikeEvents: EventEmitter<RikeEvent>;
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
         * Arbitrary data type can be used as a request body.
         *
         * @param target arbitrary target value.
         *
         * @returns {RikeTargetImpl} new operation target.
         */
        target(target: any): RikeTarget<any, Response>;
        /**
         * Constructs operations target, which operates on the given data type.
         *
         * @param target arbitrary target value.
         * @param dataType operations data type.
         *
         * @return {RikeTargetImpl<T>} new operations target.
         */
        target<IN, OUT>(target: any, dataType: DataType<IN, OUT>): RikeTarget<IN, OUT>;
        /**
         * Constructs operations target, which operates on the given data type passing it as JSON over HTTP.
         *
         * @param target arbitrary target value.
         *
         * @return {RikeTarget<T>} new operations target.
         */
        json<T>(target: any): RikeTarget<T, T>;
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
        protected wrapResponse(_target: RikeTarget<any, any>, _operation: RikeOperation<any, any>, response: Observable<Response>): Observable<Response>;
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
     * `IN` is a request type this target's operations accept by default.
     * `OUT` is a response type this target's operations return by default.
     */
    export abstract class RikeTarget<IN, OUT> implements RikeEventSource {
        /**
         * Operation target value.
         *
         * This is the value passed to the [Rike.target] method.
         */
        readonly abstract target: any;
        /**
         * A currently evaluating operation.
         *
         * `undefined` if no operations currently in process, i.e. operation not started, cancelled, or completed, either
         * successfully or with error.
         */
        readonly abstract currentOperation?: RikeOperation<any, any>;
        /**
         * An emitter of events for operations performed on this target.
         */
        readonly abstract rikeEvents: EventEmitter<RikeEvent>;
        /**
         * An operations data type to use by default.
         *
         * This is the data type to the [Rike.target] method.
         */
        readonly abstract dataType: DataType<IN, OUT>;
        /**
         * Constructs an operation on this target, which produces responses of type `T`.
         *
         * The target data type (_dataType_) passed to the [Rike.target] will be used to encode/decode operation data.
         *
         * @param name operation name.
         */
        abstract operation(name: string): RikeOperation<IN, OUT>;
        /**
         * Constructs an operation on this target, which produces responses of the given type.
         *
         * @param name operation name.
         * @param dataType operation data type.
         */
        abstract operation<IN, OUT>(name: string, dataType: DataType<IN, OUT>): RikeOperation<IN, OUT>;
        /**
         * Constructs an operations on this target, which operates on the given data type passing it as JSON over HTTP.
         *
         * @param name operation name.
         *
         * @return {RikeTarget<T>} new operations target.
         */
        json<T>(name: string): RikeOperation<T, T>;
        /**
         * Cancels current operation, if any.
         *
         * @return `true` if operation cancelled, or `false` if there is no operation to cancel.
         */
        abstract cancel(): boolean;
    }
    /**
     * REST-like resource operation.
     *
     * It basically mimics the `Http` service interface, but also honors global Rike options, and emits events.
     *
     * To initiate operation just call any of the HTTP access methods. Note that operation always belongs to its target
     * and thus two operations could not be initiated simultaneously.
     *
     * `IN` is a type of requests this operation accepts.
     * `OUT` is a type of responses this operation produces.
     */
    export abstract class RikeOperation<IN, OUT> {
        /**
         * Operation target.
         */
        readonly abstract target: RikeTarget<any, any>;
        /**
         * Operation name.
         */
        readonly abstract name: string;
        /**
         * Operation data type.
         *
         * This data type is based on the one passed to the [RikeTarget.operation], but also honors the default data type
         * set for target.
         */
        readonly abstract dataType: DataType<IN, OUT>;
        readonly abstract options: RequestOptions;
        abstract withOptions(options?: RequestOptionsArgs): this;
        readonly url: string | undefined;
        withUrl(url: string): this;
        readonly method: RequestMethod | undefined;
        withMethod(method: string | RequestMethod): this;
        abstract load(url?: string, options?: RequestOptionsArgs): Observable<OUT>;
        abstract send(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT>;
        abstract get(url?: string, options?: RequestOptionsArgs): Observable<OUT>;
        abstract post(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT>;
        abstract put(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT>;
        abstract delete(url?: string, options?: RequestOptionsArgs): Observable<OUT>;
        abstract patch(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT>;
        abstract head(url?: string, options?: RequestOptionsArgs): Observable<OUT>;
    }
}
declare module "ng2-rike/resource" {
    import { Type } from "@angular/core";
    import { URLSearchParams, Headers, RequestMethod } from "@angular/http";
    import { DataType } from "ng2-rike/data";
    import { RikeTarget, Rike } from "ng2-rike/rike";
    export abstract class Resource {
        static provide({provide, useClass, useValue, useExisting, useFactory, deps}: {
            provide: any;
            useClass?: Type;
            useValue?: any;
            useExisting?: any;
            useFactory?: Function;
            deps?: Object[];
            multi?: boolean;
        }): any;
        readonly abstract rikeTarget: RikeTarget<any, any>;
    }
    export interface LoadFn<OUT> {
        (): OUT;
    }
    export interface SendFn<IN, OUT> {
        (request: IN): OUT;
    }
    export interface OperationMetadata {
        name?: string;
        dataType?: DataType<any, any>;
        url?: string;
        search?: string | URLSearchParams;
        headers?: Headers | {
            [key: string]: any;
        };
        withCredentials?: boolean;
    }
    export interface OperationWithMethodMetadata extends OperationMetadata {
        method?: string | RequestMethod;
    }
    export function RIKE(meta?: OperationWithMethodMetadata): PropertyDecorator;
    export function GET(meta?: OperationMetadata): PropertyDecorator;
    export function POST(meta?: OperationMetadata): PropertyDecorator;
    export function PUT(meta?: OperationMetadata): PropertyDecorator;
    export function DELETE(meta?: OperationMetadata): PropertyDecorator;
    export function OPTIONS(meta?: OperationMetadata): PropertyDecorator;
    export function HEAD(opts?: OperationMetadata): PropertyDecorator;
    export function PATCH(opts?: OperationMetadata): PropertyDecorator;
    export abstract class RikeResource implements Resource {
        private _rike;
        private _rikeTarget?;
        constructor(_rike: Rike);
        readonly rike: Rike;
        readonly rikeTarget: RikeTarget<any, any>;
        getRikeTarget(): RikeTarget<any, any>;
        protected createRikeTarget(): RikeTarget<any, any>;
    }
    export abstract class CRUDResource<T> extends RikeResource {
        constructor(rike: Rike);
        readonly rikeTarget: RikeTarget<T, T>;
        getRikeTarget(): RikeTarget<T, T>;
        protected createRikeTarget(): RikeTarget<T, T>;
    }
}
declare module "ng2-rike" {
    export * from "ng2-rike/data";
    export * from "ng2-rike/event";
    export * from "ng2-rike/options";
    export * from "ng2-rike/resource";
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

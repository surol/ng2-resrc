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
         * Whether this is an operation cancel.
         *
         * @return {boolean} `true` if operation cancelled, or `false` otherwise.
         */
        readonly cancel: boolean;
        /**
         * The operation that cancelled this operation.
         */
        readonly abstract cancelledBy?: RikeOperationEvent;
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
        readonly cancelledBy: undefined;
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
        readonly cancelledBy: undefined;
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
        readonly cancelledBy: RikeOperationEvent | undefined;
        readonly result: undefined;
    }
    /**
     * An event emitted when operation on a REST-like resource is cancelled.
     */
    export class RikeCancelEvent extends RikeErrorEvent {
        private _cancelledBy?;
        constructor(operation: RikeOperation<any, any>, _cancelledBy?: RikeOperationEvent);
        readonly error: RikeOperationEvent | undefined;
        readonly cancel: boolean;
        readonly cancelledBy: RikeOperationEvent | undefined;
    }
}
declare module "ng2-rike/status" {
    import { EventEmitter } from "@angular/core";
    import { RikeTarget } from "ng2-rike/rike";
    import { RikeEvent } from "ng2-rike/event";
    export const DEFAULT_STATUS_LABELS: {
        [operation: string]: RikeStatusLabels<any>;
    };
    export interface RikeStatusLabels<L> {
        processing?: L | ((target: RikeTarget<any, any>) => L);
        failed?: L | ((target: RikeTarget<any, any>) => L);
        cancelled?: L | ((target: RikeTarget<any, any>) => L);
        succeed?: L | ((target: RikeTarget<any, any>) => L);
    }
    export class RikeStatus<L> {
        private _targetStatuses;
        private _labels;
        private _combined?;
        subscribeOn(events: EventEmitter<RikeEvent>): void;
        withLabels(labels: RikeStatusLabels<L>): this;
        withLabels(operation: string, labels: RikeStatusLabels<L>): this;
        readonly labels: L[];
        readonly processing: boolean;
        readonly failed: boolean;
        readonly cancelled: boolean;
        readonly succeed: boolean;
        private readonly combined;
        private labelFor(id, status);
        private applyEvent(event);
    }
}
declare module "ng2-rike/options" {
    import { RikeStatusLabels } from "ng2-rike/status";
    /**
     * Constructs URL relative to base URL.
     *
     * @param baseUrl base URL.
     * @param url URL.
     *
     * @returns {string} If `baseUrl` is not specified, or empty string, or `url` is absolute, then returns unmodified `url`.
     * Otherwise concatenates `baseUrl` and `url` separating them by `/` sign.
     */
    export function relativeUrl(baseUrl: string | undefined, url: string): string;
    /**
     * Global Rike options interface.
     */
    export interface RikeOptionsArgs {
        /**
         * Base URL of all relative URLs
         */
        readonly baseUrl?: string;
        /**
         * Rike operation status labels to use by default.
         */
        readonly defaultStatusLabels?: {
            [operation: string]: RikeStatusLabels<any>;
        };
    }
    /**
     * Global Rike options.
     *
     * To overwrite global options add a provider for [BaseRikeOptions] instance with [RikeOptions] as a key:
     * ```ts
     * bootstrap(AppComponent, {provide: RikeOptions, new BaseRikeOptions({baseDir: "/rike"})});
     * ```
     */
    export abstract class RikeOptions implements RikeOptionsArgs {
        readonly abstract baseUrl?: string;
        abstract defaultStatusLabels?: {
            [operation: string]: RikeStatusLabels<any>;
        };
        /**
         * Constructs URL relative to `baseUrl`.
         *
         * @param url URL
         *
         * @returns {string} resolved URL.
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
        private _defaultStatusLabels;
        constructor(opts?: RikeOptionsArgs);
        readonly baseUrl: string | undefined;
        readonly defaultStatusLabels: {
            [operation: string]: RikeStatusLabels<any>;
        } | undefined;
    }
    /**
     * Default resource options.
     *
     * @type {RikeOptions}
     */
    export const DEFAULT_RIKE_OPTIONS: RikeOptions;
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
         * Constructs new data type based on this one, which prepares the request with the given function.
         *
         * @param prepare a request preparation function invoked in addition to `this.prepareRequest` method.
         * @param after `true` to call the `prepare` function after `this.prepareRequest` method,
         * otherwise it will be called before `this.prepareRequest()` method
         *
         * @return {DataType<IN, OUT>} new data type.
         */
        prepareRequestWith(prepare: (options: RequestOptionsArgs) => RequestOptionsArgs, after?: boolean): DataType<IN, OUT>;
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
        /**
         * Constructs new data type based on this one, which writes the request with the given function.
         *
         * @param writeRequest new request writer function.
         *
         * @return {DataType<IN, OUT>} new data type.
         */
        writeRequestWith<IN>(writeRequest: (request: IN, options: RequestOptionsArgs) => RequestOptionsArgs): DataType<IN, OUT>;
        /**
         * Constructs new data type based on this one, which updates request options with the given function. The request
         * will be written with original `writeRequest()` method.
         *
         * @param updateRequest a function updating request options in addition to `this.writeRequest()` method.
         * @param after `true` to invoke `updateRequest` function after `this.writeRequest()` method, otherwise it will be
         * invoked before the `this.writeRequest()` method.
         *
         * @return {DataType<IN, OUT>} new data type.
         */
        updateRequestWith(updateRequest: (request: IN, options: RequestOptionsArgs) => RequestOptionsArgs, after?: boolean): DataType<IN, OUT>;
        /**
         * Reads operation response from HTTP response.
         *
         * @param response HTTP response.
         *
         * @returns operation response.
         */
        abstract readResponse(response: Response): OUT;
        /**
         * Constructs new data type based on this one, which reads a response with the given function.
         *
         * @param readResponse new response reader function.
         *
         * @return {DataType<IN, OUT>} new data type.
         */
        readResponseWith<OUT>(readResponse: (response: Response) => OUT): DataType<IN, OUT>;
    }
    export abstract class RequestBodyType<T> extends DataType<T, T> {
        writeRequest(request: T, options: RequestOptionsArgs): RequestOptionsArgs;
        abstract writeBody(request: T): any;
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
        private _uniqueIdSeq;
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
         * @param response response observer to wrap.
         *
         * @returns {Observable<Response>} response observer wrapper.
         */
        protected wrapResponse(response: Observable<Response>): Observable<Response>;
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
         * `Rike` service instance.
         */
        readonly abstract rike: Rike;
        /**
         * Operation target value.
         *
         * This is the value passed to the [Rike.target] method.
         */
        readonly abstract target: any;
        /**
         * Unique target identifier.
         */
        readonly abstract uniqueId: string;
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
         * Base URL to use by operations.
         */
        readonly abstract baseUrl?: string;
        /**
         * Assigns base URL to use by operations.
         *
         * This URL can be absolute, or relative to the one specified in the [global options][RikeOptions.baseUrl].
         *
         * @param url new base URL or `undefined` to reset it.
         */
        abstract withBaseUrl(url?: string): this;
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
declare module "ng2-rike/status.component" {
    import { RikeStatusLabels, RikeStatus } from "ng2-rike/status";
    import { RikeEventSource } from "ng2-rike/event";
    export class RikeStatusComponent<L> {
        private _eventSources;
        private _statusLabels?;
        private _rikeStatus?;
        private _labelText;
        constructor(_eventSources: RikeEventSource[]);
        rikeStatus: RikeStatus<L>;
        rikeStatusLabels: RikeStatusLabels<L> | undefined;
        rikeStatusLabelText: (label: L) => string;
        readonly cssClass: any;
        readonly text: string | undefined;
        protected createStatus(): RikeStatus<L>;
        protected configureStatus(status: RikeStatus<L>): void;
    }
}
declare module "ng2-rike/resource" {
    import { Type } from "@angular/core";
    import { Observable } from "rxjs/Rx";
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
        create(object: T): Observable<T>;
        read(id: any): Observable<T>;
        update(object: T): Observable<T>;
        delete(object: T): Observable<any>;
        protected createRikeTarget(): RikeTarget<T, T>;
        protected objectCreateDataType(object: T): DataType<any, T>;
        protected objectReadDataType(id: any): DataType<any, T>;
        protected objectUpdateDataType(object: T): DataType<T, T>;
        protected objectDeleteDataType(object: T): DataType<T, any>;
        protected abstract objectId(object: T): any;
        protected objectUrl(baseUrl: string | undefined, id: any): string;
    }
}
declare module "ng2-rike" {
    export * from "ng2-rike/data";
    export * from "ng2-rike/event";
    export * from "ng2-rike/options";
    export * from "ng2-rike/resource";
    export * from "ng2-rike/rike";
    export * from "ng2-rike/status";
    export * from "ng2-rike/status.component";
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

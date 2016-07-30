/// <reference types="core-js" />
declare module "ng2-rike/protocol" {
    import { Response, RequestOptionsArgs } from "@angular/http";
    /**
     * Error response.
     *
     * All error handlers operates over it.
     *
     * Typical error handler extends this interface with handler-specific fields and fills them.
     */
    export interface ErrorResponse {
        /**
         * HTTP response.
         */
        response: Response;
        /**
         * Arbitrary error object.
         *
         * This field is filled when HTTP returns something different from `Response` object.
         */
        error?: any;
    }
    /**
     * REST-like operations protocol.
     *
     * It is used by REST-like operations to encode operation requests to HTTP, decode operation responses from HTTP,
     * and handle errors.
     *
     * `IN` is operation request type.
     * `OUT` is operation response type.
     */
    export abstract class Protocol<IN, OUT> {
        /**
         * Prepares HTTP request.
         *
         * The `options` passed have at least `url` and `method` fields set.
         *
         * This method is called for each HTTP request before _writeRequest_ method. When default protocol is set for
         * operation target, this method is called first on the default protocol, and then - on the operation protocol.
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
         * The `options` are the result of `prepareRequest` method invocation. It is expected the result options to
         * contain a `body` field set.
         *
         * @param request operation request to encode
         * @param options original HTTP request options.
         *
         * @return modified HTTP request options that will be used to perform actual request.
         */
        abstract writeRequest(request: IN, options: RequestOptionsArgs): RequestOptionsArgs;
        /**
         * Reads operation response from HTTP response.
         *
         * @param response HTTP response.
         *
         * @returns operation response.
         */
        abstract readResponse(response: Response): OUT;
        /**
         * Handles HTTP error.
         *
         * Does not modify error response by default.
         *
         * @param error error response to handle.
         *
         * @returns error processing result.
         */
        handleError(error: ErrorResponse): ErrorResponse;
        /**
         * Creates protocol addon able to prepend protocol actions with specified functions.
         *
         * @return {ProtocolAddon<IN, OUT>} protocol addon.
         */
        prior(): ProtocolAddon<IN, OUT>;
        /**
         * Creates protocol addon able to append specified functions to protocol actions.
         *
         * @return {ProtocolAddon<IN, OUT>} protocol addon.
         */
        then(): ProtocolAddon<IN, OUT>;
        /**
         * Creates protocol modifier able to replace protocol actions with specified functions.
         *
         * @return {ProtocolMod<IN, OUT>} protocol modifier.
         */
        instead(): ProtocolMod<IN, OUT>;
    }
    /**
     * Protocol addon. It is able to construct new protocol based on original one by adding specified actions to original
     * ones.
     */
    export interface ProtocolAddon<IN, OUT> {
        /**
         * Constructs new protocol based on this one, which prepares requests with the given function.
         *
         * @param prepare a request preparation function invoked in addition to `Protocol.prepareRequest` method.
         *
         * @return {Protocol<IN, OUT>} new protocol.
         */
        prepareRequest(prepare: (options: RequestOptionsArgs) => RequestOptionsArgs): Protocol<IN, OUT>;
        /**
         * Constructs new protocol based on original one, which updates request options with the given function.
         * The request will be written with original `Protocol.writeRequest()` method.
         *
         * @param update a function updating request options in addition to `Protocol.writeRequest()` method.
         *
         * @return {Protocol<IN, OUT>} new protocol.
         */
        updateRequest(update: (request: IN, options: RequestOptionsArgs) => RequestOptionsArgs): Protocol<IN, OUT>;
        /**
         * Constructs new protocol based on original one, which handles errors with the given function.
         *
         * @param handle a function handling errors in addition to `Protocol.handleError()` method.
         *
         * @return {Protocol<IN, OUT>} new protocol.
         */
        handleError(handle: (error: ErrorResponse) => ErrorResponse): Protocol<IN, OUT>;
        /**
         * Constructs new protocol based on original onw, which prepares requests and handles errors with corresponding
         * `protocol` methods in addition to original ones.
         *
         * @param protocol {Protocol<IN, OUT>} new protocol.
         */
        apply(protocol: Protocol<any, any>): Protocol<IN, OUT>;
    }
    /**
     * Protocol modifier. It is able to construct new protocol based on original one by replacing protocol actions with
     * specified ones.
     */
    export interface ProtocolMod<IN, OUT> {
        /**
         * Constructs new protocol based on original one, which prepares the request with the given function.
         *
         * @param prepare a request preparation function invoked instead of `Protocol.prepareRequest` method.
         *
         * @return {Protocol<IN, OUT>} new protocol.
         */
        prepareRequest(prepare: (options: RequestOptionsArgs) => RequestOptionsArgs): Protocol<IN, OUT>;
        /**
         * Constructs new protocol based on original one, which writes the request with the given function.
         *
         * @param write new request writer function.
         *
         * @return {Protocol<I, OUT>} new protocol.
         */
        writeRequest<I>(write: (request: I, options: RequestOptionsArgs) => RequestOptionsArgs): Protocol<I, OUT>;
        /**
         * Constructs new protocol based on original one, which reads responses with the given function.
         *
         * @param read new response reader function.
         *
         * @return {Protocol<IN, O>} new protocol.
         */
        readResponse<O>(read: (response: Response) => O): Protocol<IN, O>;
        /**
         * Constructs new protocol based on original one, which handles errors with the given function.
         *
         * @param handle a function handling errors instead of `Protocol.handleError()` method.
         *
         * @return {Protocol<IN, OUT>} new protocol.
         */
        handleError(handle: (error: ErrorResponse) => ErrorResponse): Protocol<IN, OUT>;
    }
    /**
     * JSON protocol.
     *
     * Sends and receives arbitrary data as JSON over HTTP.
     *
     * @type {Protocol<any>}
     */
    export const JSON_PROTOCOL: Protocol<any, any>;
    /**
     * Returns JSON protocol.
     *
     * Sends and receives the data of the given type as JSON over HTTP.
     */
    export const jsonProtocol: (<T>() => Protocol<T, T>);
    /**
     * HTTP protocol.
     *
     * The request type is any. It is used as request body.
     *
     * @type {Protocol<any, Response>}
     */
    export const HTTP_PROTOCOL: Protocol<any, Response>;
}
declare module "ng2-rike/event" {
    import { EventEmitter } from "@angular/core";
    import { RikeTarget, RikeOperation } from "ng2-rike/rike";
    import { ErrorResponse } from "ng2-rike/protocol";
    /**
     * REST-like resource access event emitter.
     *
     * Multiple instances of this class could be injected into controller or service to listen for Rike events.
     *
     * Use [provideEventSource] function to register event sources.
     */
    export abstract class RikeEventSource {
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
         * Error response.
         */
        readonly abstract errorResponse?: ErrorResponse;
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
        readonly errorResponse: undefined;
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
        readonly errorResponse: undefined;
        readonly cancelledBy: undefined;
        readonly result: any;
    }
    /**
     * An event emitted when operation on a REST-like resource is failed.
     *
     * An object of this type is also reported as an error when some internal exception occurs.
     */
    export abstract class RikeErrorEvent extends RikeEvent {
        private _operation;
        private _error;
        constructor(_operation: RikeOperation<any, any>, _error: any);
        readonly operation: RikeOperation<any, any>;
        readonly complete: boolean;
        readonly error: any;
        readonly errorResponse: ErrorResponse | undefined;
        readonly cancelledBy: RikeOperationEvent | undefined;
        readonly result: undefined;
    }
    /**
     * An event emitted when operation on a REST-like resource caused an exception.
     *
     * An object of this type is reported as an error.
     */
    export class RikeExceptionEvent extends RikeErrorEvent {
        private _errorResponse?;
        constructor(operation: RikeOperation<any, any>, error: any, _errorResponse?: ErrorResponse);
        readonly errorResponse: ErrorResponse | undefined;
    }
    /**
     * An event emitted when operation on a REST-like resource returned error.
     */
    export class RikeErrorResponseEvent extends RikeErrorEvent {
        private _errorResponse;
        constructor(operation: RikeOperation<any, any>, _errorResponse: ErrorResponse);
        readonly errorResponse: ErrorResponse;
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
declare module "ng2-rike/status-collector" {
    import { EventEmitter } from "@angular/core";
    import { RikeTarget } from "ng2-rike/rike";
    import { RikeEvent, RikeEventSource } from "ng2-rike/event";
    export const DEFAULT_STATUS_LABELS: {
        [operation: string]: StatusLabels<any>;
    };
    export interface StatusLabels<L> {
        processing?: L | ((target: RikeTarget<any, any>) => L);
        failed?: L | ((target: RikeTarget<any, any>) => L);
        cancelled?: L | ((target: RikeTarget<any, any>) => L);
        succeed?: L | ((target: RikeTarget<any, any>) => L);
    }
    export class StatusCollector<L> {
        private _targetStatuses;
        private _labels;
        private _combined?;
        constructor(eventSources?: RikeEventSource[]);
        subscribeOn(events: EventEmitter<RikeEvent>): void;
        withLabels(labels: StatusLabels<L>): this;
        withLabels(operation: string, labels: StatusLabels<L>): this;
        readonly labels: L[];
        readonly processing: boolean;
        readonly failed: boolean;
        readonly cancelled: boolean;
        readonly succeed: boolean;
        private readonly combined;
        private labelFor(status);
        private applyEvent(event);
    }
}
declare module "ng2-rike/options" {
    import { Protocol } from "ng2-rike/protocol";
    import { StatusLabels } from "ng2-rike/status-collector";
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
         * Base URL of all relative URLs.
         *
         * All relative Rike request URLs will be resolved against this one.
         */
        readonly baseUrl?: string;
        /**
         * Default operations protocol.
         *
         * If not specified then `HTTP_PROTOCOL` will be used.
         */
        readonly defaultProtocol?: Protocol<any, any>;
        /**
         * Rike operation status labels to use by default.
         */
        readonly defaultStatusLabels?: {
            [operation: string]: StatusLabels<any>;
        };
    }
    /**
     * Global Rike options.
     *
     * To overwrite global options add a provider for {{BaseRikeOptions}} instance with {{RikeOptions}} as token:
     * ```ts
     * bootstrap(AppComponent, {provide: RikeOptions, new BaseRikeOptions({baseUrl: "/rike"})});
     * ```
     */
    export abstract class RikeOptions implements RikeOptionsArgs {
        readonly abstract baseUrl?: string;
        readonly abstract defaultProtocol?: Protocol<any, any>;
        abstract defaultStatusLabels?: {
            [operation: string]: StatusLabels<any>;
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
        private _defaultProtocol?;
        private _defaultStatusLabels;
        constructor(opts?: RikeOptionsArgs);
        readonly baseUrl: string | undefined;
        readonly defaultProtocol: Protocol<any, any> | undefined;
        readonly defaultStatusLabels: {
            [operation: string]: StatusLabels<any>;
        } | undefined;
    }
    /**
     * Default resource options.
     *
     * @type {RikeOptions}
     */
    export const DEFAULT_RIKE_OPTIONS: RikeOptions;
}
declare module "ng2-rike/rike" {
    import { EventEmitter } from "@angular/core";
    import { Request, RequestOptionsArgs, Response, Http, RequestMethod, RequestOptions } from "@angular/http";
    import { Observable } from "rxjs/Rx";
    import { RikeEvent, RikeEventSource } from "ng2-rike/event";
    import { RikeOptions } from "ng2-rike/options";
    import { Protocol } from "ng2-rike/protocol";
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
         * Default Rike protocol.
         *
         * @return {Protocol<any, any>} either {{RikeOptions.defaultProtocol}}, or `HTTP_PROTOCOL`.
         */
        readonly defaultProtocol: Protocol<any, any>;
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
         * Constructs operation target which operates over `HTTP_PROTOCOL`.
         *
         * Arbitrary value can be used as a request body.
         *
         * @param target arbitrary target value.
         *
         * @returns {RikeTarget} new operation target.
         */
        target(target: any): RikeTarget<any, Response>;
        /**
         * Constructs operations target which operates over the given protocol.
         *
         * @param target arbitrary target value.
         * @param protocol operations protocol.
         *
         * @return {RikeTarget<IN, OUT>} new operations target.
         */
        target<IN, OUT>(target: any, protocol: Protocol<IN, OUT>): RikeTarget<IN, OUT>;
        /**
         * Constructs operations target which operates over [JSON protocol][jsonProtocol].
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
        private prepareRequest(options?);
        /**
         * Wraps the HTTP response observable for the given operation to make it handle errors.
         *
         * @param response response observer to wrap.
         *
         * @returns {Observable<Response>} response observer wrapper.
         */
        private handleErrors(response);
    }
    /**
     * REST-like operations target.
     *
     * Operation targets are created using [Rike.target] method. The actual operations should be created first with
     * `operation` method.
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
         * An operations protocol to use by default.
         *
         * This is a protocol based on the one passed to [Rike.target] method, which honors {{Rike.defaultProtocol}}.
         */
        readonly abstract protocol: Protocol<IN, OUT>;
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
         * Constructs an operation on this target which operates over the target's `protocol`.
         *
         * @param name operation name.
         *
         * @return {RikeOperation<IN, OUT>} new operation.
         */
        abstract operation(name: string): RikeOperation<IN, OUT>;
        /**
         * Constructs an operation on this target which operates over the given protocol.
         *
         * @param name operation name.
         * @param protocol operation protocol.
         *
         * @return {RikeOperation<IN, OUT>} new operation.
         */
        abstract operation<IN, OUT>(name: string, protocol: Protocol<IN, OUT>): RikeOperation<IN, OUT>;
        /**
         * Constructs JSON operation on this target.
         *
         * It operates over [JSON protocol][jsonProtocol].
         *
         * @param name operation name.
         *
         * @return {RikeOperation<T, T>} new operation.
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
     * It operates over the given protocol and emits events.
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
         * Operation protocol.
         *
         * This protocol is based on the one passed to the [RikeTarget.operation], but also honors the default protocol
         * set for target.
         */
        readonly abstract protocol: Protocol<IN, OUT>;
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
    import { StatusLabels, StatusCollector } from "ng2-rike/status-collector";
    import { RikeEventSource } from "ng2-rike/event";
    export class RikeStatusComponent<L> {
        private _eventSources;
        private _statusLabels?;
        private _rikeStatus?;
        private _labelText;
        constructor(_eventSources: RikeEventSource[]);
        rikeStatus: StatusCollector<L>;
        rikeStatusLabels: StatusLabels<L> | undefined;
        rikeStatusLabelText: (label: L) => string;
        readonly cssClass: any;
        readonly text: string | undefined;
        protected createStatus(): StatusCollector<L>;
        protected configureStatus(status: StatusCollector<L>): void;
    }
}
declare module "ng2-rike/field-error" {
    import { ErrorResponse } from "ng2-rike/protocol";
    /**
     * Error response.
     *
     * Any object can be converted to `ErrorResponse` with `toErrorResponse()` function.
     */
    export interface FieldErrorResponse extends ErrorResponse {
        /**
         * Field errors.
         */
        fieldErrors: FieldErrors;
    }
    /**
     * Field errors.
     *
     * Any field of this object is an arrays of errors corresponding to this field. Such array should never be empty.
     *
     * The special case is field named `"*"`. It contains errors not related to particular field.
     */
    export interface FieldErrors {
        [field: string]: FieldError[];
    }
    /**
     * Field error.
     */
    export interface FieldError {
        /**
         * Optional error code.
         */
        code?: string;
        /**
         * Error message.
         */
        message: string;
    }
    /**
     * Appends field errors to {{ErrorResponse}}.
     *
     * If field errors already present in `ErrorResponse` then does nothing.
     *
     * This function can be used as {{Protocol}} error handler error handler.
     *
     * @param error object to convert.
     *
     * @return {FieldErrorResponse} constructed error httpResponse.
     */
    export function addFieldErrors(error: ErrorResponse): FieldErrorResponse;
}
declare module "ng2-rike/error-collector" {
    import { EventEmitter } from "@angular/core";
    import { AnonymousSubscription } from "rxjs/Subscription";
    import { FieldErrors } from "ng2-rike/field-error";
    import { RikeEventSource, RikeEvent, RikeErrorEvent } from "ng2-rike/event";
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
     * This service is registered automatically along with every event source by [provideEventSource] method.
     * But unlike event sources it is not a multi-provider.
     *
     * An instance of this class could be created on its own. Then it is necessary to subscribe it on Rike events with
     * `subscribeOn` method.
     */
    export class ErrorCollector {
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
}
declare module "ng2-rike/errors.component" {
    import { OnInit, OnDestroy } from "@angular/core";
    import { ErrorCollector } from "ng2-rike/error-collector";
    import { FieldErrors, FieldError } from "ng2-rike/field-error";
    export class RikeErrorsComponent implements OnInit, OnDestroy {
        private _collector?;
        private _rikeErrorsField;
        private _errors;
        private _init;
        private _subscription?;
        constructor(_collector?: ErrorCollector);
        rikeErrorsField: string;
        rikeErrors: ErrorCollector;
        readonly errors: FieldError[];
        ngOnInit(): void;
        ngOnDestroy(): void;
        protected createCollector(): ErrorCollector;
        protected updateErrors(errors: FieldErrors): void;
        private subscribe();
        private unsubscribe();
    }
}
declare module "ng2-rike/event-source-provider" {
    import { Type } from "@angular/core";
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
    export function provideEventSource({useClass, useValue, useExisting, useFactory, deps}: {
        useClass?: Type;
        useValue?: any;
        useExisting?: any;
        useFactory?: Function;
        deps?: Object[];
        multi?: boolean;
    }): any[];
}
declare module "ng2-rike/resource" {
    import { Observable } from "rxjs/Rx";
    import { Protocol } from "ng2-rike/protocol";
    import { RikeTarget, Rike } from "ng2-rike/rike";
    export abstract class Resource {
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
        protected objectCreateProtocol(object: T): Protocol<any, T>;
        protected objectReadProtocol(id: any): Protocol<any, T>;
        protected objectUpdateProtocol(object: T): Protocol<T, T>;
        protected objectDeleteProtocol(object: T): Protocol<T, any>;
        protected abstract objectId(object: T): any;
        protected objectUrl(baseUrl: string | undefined, id: any): string;
    }
}
declare module "ng2-rike/resource-provider" {
    import { Type } from "@angular/core";
    export function provideResource({provide, useClass, useValue, useExisting, useFactory, deps}: {
        provide: any;
        useClass?: Type;
        useValue?: any;
        useExisting?: any;
        useFactory?: Function;
        deps?: Object[];
        multi?: boolean;
    }): any;
}
declare module "ng2-rike" {
    export * from "ng2-rike/error-collector";
    export * from "ng2-rike/errors.component";
    export * from "ng2-rike/event";
    export * from "ng2-rike/event-source-provider";
    export * from "ng2-rike/field-error";
    export * from "ng2-rike/options";
    export * from "ng2-rike/protocol";
    export * from "ng2-rike/resource";
    export * from "ng2-rike/resource-provider";
    export * from "ng2-rike/rike";
    export * from "ng2-rike/status-collector";
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

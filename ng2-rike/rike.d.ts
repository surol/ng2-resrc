import { Http, Request, RequestMethod, RequestOptions, RequestOptionsArgs, Response } from "@angular/http";
import { Observable } from "rxjs/Rx";
import { RikeEvent, RikeEventSource } from "./event";
import { RikeOptions } from "./options";
import { Protocol } from "./protocol";
export declare function requestMethod(method: string | RequestMethod): RequestMethod;
/**
 * REST-like resource operations service.
 *
 * This service can be injected to other services or components.
 *
 * It basically mimics the `Http` interface, but also honors [global Rike options][RikeOptions].
 *
 * It can also be used to perform operations on particular targets.
 */
export declare class Rike implements RikeEventSource {
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
     * @returns {Observable<RikeEvent>}
     */
    readonly rikeEvents: Observable<RikeEvent>;
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
     * @return {RikeTarget<I, O>} new operations target.
     */
    target<I, O>(target: any, protocol: Protocol<I, O>): RikeTarget<I, O>;
    /**
     * Constructs operations target which operates over [JSON protocol][jsonProtocol].
     *
     * @param target arbitrary target value.
     *
     * @return {RikeTarget<I, O>} new operations target.
     */
    json<I, O>(target: any): RikeTarget<I, O>;
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
export declare abstract class RikeTarget<IN, OUT> implements RikeEventSource {
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
    readonly abstract rikeEvents: Observable<RikeEvent>;
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
     * @return {RikeOperation<I, O>} new operation.
     */
    abstract operation<I, O>(name: string, protocol: Protocol<I, O>): RikeOperation<I, O>;
    /**
     * Constructs JSON operation on this target.
     *
     * It operates over [JSON protocol][jsonProtocol].
     *
     * @param name operation name.
     *
     * @return {RikeOperation<T, T>} new operation.
     */
    json<I, O>(name: string): RikeOperation<I, O>;
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
export declare abstract class RikeOperation<IN, OUT> {
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

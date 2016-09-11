import { Response, RequestOptionsArgs } from "@angular/http";
import { ProtocolAddon } from "./protocol";
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
export declare abstract class Protocol<IN, OUT> {
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
     * @return {ProtocolPre<IN, OUT>} protocol addon.
     */
    prior(): ProtocolPre<IN, OUT>;
    /**
     * Creates protocol addon able to append specified functions to protocol actions.
     *
     * @return {ProtocolPost<IN, OUT>} protocol addon.
     */
    then(): ProtocolPost<IN, OUT>;
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
     * Constructs new protocol based on original one, which prepares requests and handles errors with corresponding
     * `protocol` methods in addition to original ones.
     *
     * @param protocol a protocol to apply.
     *
     * @return protocol {Protocol<IN, OUT>} new protocol.
     */
    apply(protocol: Protocol<any, any>): Protocol<IN, OUT>;
}
/**
 * Protocol addon used to construct a new protocol based on original one by adding specified actions prior to original
 * ones.
 */
export interface ProtocolPre<IN, OUT> extends ProtocolAddon<IN, OUT> {
    /**
     * Constructs new protocol based on original one, which builds requests for target protocol based on requests
     * of another type.
     *
     * @param <I> new operation request type.
     * @param convert a request converter function.
     *
     * @return protocol {Protocol<I, OUT>} new protocol.
     */
    input<I>(convert: (request: I) => IN): Protocol<I, OUT>;
}
/**
 * Protocol addon used to construct a new protocol based on original one by adding specified actions after the original
 * ones.
 */
export interface ProtocolPost<IN, OUT> extends ProtocolAddon<IN, OUT> {
    /**
     * Constructs new protocol based on original one, which converts original responses to responses of another type.
     *
     * @param <O> new operation response type.
     * @param convert a response converter function.
     *
     * @return protocol {Protocol<IN, O>} new protocol.
     */
    output<O>(convert: (response: OUT, httpResponse: Response) => O): Protocol<IN, O>;
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
export declare const JSON_PROTOCOL: Protocol<any, any>;
/**
 * Returns JSON protocol.
 *
 * Sends and receives the data of the given type as JSON over HTTP.
 */
export declare const jsonProtocol: (<IN, OUT>() => Protocol<IN, OUT>);
/**
 * HTTP protocol.
 *
 * The request type is any. It is used as request body.
 *
 * @type {Protocol<any, Response>}
 */
export declare const HTTP_PROTOCOL: Protocol<any, Response>;

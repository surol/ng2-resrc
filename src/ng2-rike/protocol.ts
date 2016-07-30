import {Response, RequestOptionsArgs, RequestOptions, Headers} from "@angular/http";

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

    //noinspection JSMethodCanBeStatic
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
    prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs {
        return options;
    }

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
     * If absent the error is not modified.
     *
     * @param error error to handle.
     *
     * @returns error processing result.
     */
    abstract readonly handleError?: (error: any) => any;

    /**
     * Creates protocol addon able to prepend protocol actions with specified functions.
     *
     * @return {ProtocolAddon<IN, OUT>} protocol addon.
     */
    prior(): ProtocolAddon<IN, OUT> {
        return new CustomProtocolAddon<IN, OUT>(this, true);
    }

    /**
     * Creates protocol addon able to append specified functions to protocol actions.
     *
     * @return {ProtocolAddon<IN, OUT>} protocol addon.
     */
    then(): ProtocolAddon<IN, OUT> {
        return new CustomProtocolAddon<IN, OUT>(this, false);
    }

    /**
     * Creates protocol modifier able to replace protocol actions with specified functions.
     *
     * @return {ProtocolMod<IN, OUT>} protocol modifier.
     */
    instead(): ProtocolMod<IN, OUT> {
        return new CustomProtocolMod<IN, OUT>(this);
    }

}

/**
 * Protocol addon. It is able to construct new protocol based on original one by adding specified actions to original
 * ones.
 */
export interface ProtocolAddon<IN, OUT> {

    /**
     * Constructs new protocol based on this one, which prepares the request with the given function.
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
    handleError(handle: (error: any) => any): Protocol<IN, OUT>;

}

class CustomProtocolAddon<IN, OUT> implements ProtocolAddon<IN, OUT> {

    constructor(private _protocol: Protocol<IN, OUT>, private _prior: boolean) {
    }

    prepareRequest(prepare: (options: RequestOptionsArgs)=>RequestOptionsArgs): Protocol<IN, OUT> {

        const handleError = this._protocol.handleError;

        return new CustomProtocol<IN, OUT>(
            this._prior
                ? options => this._protocol.prepareRequest(prepare(options))
                : options => prepare(this._protocol.prepareRequest(options)),
            (request, options) => this._protocol.writeRequest(request, options),
            response => this._protocol.readResponse(response),
            handleError && (error => handleError(error)));
    }

    updateRequest(update: (request: IN, options: RequestOptionsArgs) => RequestOptionsArgs): Protocol<IN, OUT> {

        const handleError = this._protocol.handleError;

        return new CustomProtocol<IN, OUT>(
            options => this._protocol.prepareRequest(options),
            this._prior
                ? (request, options) => this._protocol.writeRequest(request, update(request, options))
                : (request, options) => update(request, this._protocol.writeRequest(request, options)),
            response => this._protocol.readResponse(response),
            handleError && (error => handleError(error)));
    }

    handleError(handle: (error: any) => any): Protocol<IN, OUT> {

        const handleError = this._protocol.handleError;

        return new CustomProtocol<IN, OUT>(
            options => this._protocol.prepareRequest(options),
            (request, options) => this._protocol.writeRequest(request, options),
            response => this._protocol.readResponse(response),
            !handleError ? handle : (
                this._prior
                    ? error => handleError(handle(error))
                    : error => handle(handleError(error))));
    }

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
    handleError(handle: (error: any) => any): Protocol<IN, OUT>;

}

class CustomProtocolMod<IN, OUT> implements ProtocolMod<IN, OUT> {

    constructor(private _protocol: Protocol<IN, OUT>) {
    }

    prepareRequest(prepare: (options: RequestOptionsArgs) => RequestOptionsArgs): Protocol<IN, OUT> {
        return new CustomProtocol<IN, OUT>(
            prepare,
            (request, options) => this._protocol.writeRequest(request, options),
            response => this._protocol.readResponse(response),
            this._protocol.handleError);
    }

    writeRequest<I>(write: (request: I, options: RequestOptionsArgs)=>RequestOptionsArgs): Protocol<I, OUT> {
        return new CustomProtocol<I, OUT>(
            options => this._protocol.prepareRequest(options),
            write,
            response => this._protocol.readResponse(response),
            this._protocol.handleError);
    }

    readResponse<O>(read: (response: Response)=>O): Protocol<IN, O> {
        return new CustomProtocol<IN, O>(
            options => this._protocol.prepareRequest(options),
            (request, options) => this._protocol.writeRequest(request, options),
            read,
            this._protocol.handleError);
    }

    handleError(handle: (error: any)=>any): Protocol<IN, OUT> {
        return new CustomProtocol<IN, OUT>(
            options => this._protocol.prepareRequest(options),
            (request, options) => this._protocol.writeRequest(request, options),
            response => this._protocol.readResponse(response),
            handle);
    }

}

class CustomProtocol<IN, OUT> extends Protocol<IN, OUT> {

    constructor(
        private _prepareRequest: (options: RequestOptionsArgs) => RequestOptionsArgs,
        private _writeRequest: (request: IN, options: RequestOptionsArgs) => RequestOptionsArgs,
        private _readResponse: (response: Response) => OUT,
        public handleError?: (error: any) => any) {
        super();
    }

    prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs {
        return this._prepareRequest(options);
    }

    writeRequest(request: IN, options: RequestOptionsArgs): RequestOptionsArgs {
        return this._writeRequest(request, options);
    }

    readResponse(response: Response): OUT {
        return this._readResponse(response);
    }

}

class JsonProtocol<T> extends Protocol<T, T> {

    readonly handleError?: undefined;

    writeRequest(request: T, options: RequestOptionsArgs): RequestOptionsArgs {

        const opts = new RequestOptions(options).merge({body: JSON.stringify(request)});

        let headers: Headers;

        if (opts.headers) {
            headers = opts.headers;
        } else {
            opts.headers = headers = new Headers();
        }
        headers.set("Content-Type", "application/json");

        return opts;
    }

    readResponse(response: Response): T {
        return response.json();
    }

}

/**
 * JSON protocol.
 *
 * Sends and receives arbitrary data as JSON over HTTP.
 *
 * @type {Protocol<any>}
 */
export const JSON_PROTOCOL: Protocol<any, any> = new JsonProtocol<any>();

/**
 * Returns JSON protocol.
 *
 * Sends and receives the data of the given type as JSON over HTTP.
 */
export const jsonProtocol: (<T>() => Protocol<T, T>) = () => JSON_PROTOCOL;

class HttpProtocol extends Protocol<any, Response> {

    readonly handleError?: undefined;

    writeRequest(request: any, options: RequestOptionsArgs): RequestOptionsArgs {
        return new RequestOptions(options).merge({body: request});
    }

    readResponse(response: Response): Response {
        return response;
    }

}

/**
 * HTTP protocol.
 *
 * The request type is any. It is used as request body.
 *
 * @type {Protocol<any, Response>}
 */
export const HTTP_PROTOCOL: Protocol<any, Response> = new HttpProtocol();

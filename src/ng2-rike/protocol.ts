import {Response, RequestOptionsArgs, RequestOptions} from "@angular/http";

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
     * Constructs new protocol based on this one, which prepares the request with the given function.
     *
     * @param prepare a request preparation function invoked in addition to `this.prepareRequest` method.
     * @param after `true` to call the `prepare` function after `this.prepareRequest` method,
     * otherwise it will be called before `this.prepareRequest()` method
     *
     * @return {Protocol<IN, OUT>} new protocol.
     */
    prepareRequestWith(
        prepare: (options: RequestOptionsArgs) => RequestOptionsArgs,
        after?: boolean): Protocol<IN, OUT> {
        return new PrepareRequestProtocol<IN, OUT>(this, prepare, after);
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
     * Constructs new protocol based on this one, which writes the request with the given function.
     *
     * @param writeRequest new request writer function.
     *
     * @return {Protocol<IN, OUT>} new protocol.
     */
    writeRequestWith<IN>(
        writeRequest: (request: IN, options: RequestOptionsArgs) => RequestOptionsArgs): Protocol<IN, OUT> {
        return new WriteRequestProtocol<IN, OUT>(this, writeRequest);
    }

    /**
     * Constructs new protocol based on this one, which updates request options with the given function. The request
     * will be written with original `writeRequest()` method.
     *
     * @param updateRequest a function updating request options in addition to `this.writeRequest()` method.
     * @param after `true` to invoke `updateRequest` function after `this.writeRequest()` method, otherwise it will be
     * invoked before the `this.writeRequest()` method.
     *
     * @return {Protocol<IN, OUT>} new protocol.
     */
    updateRequestWith(
        updateRequest: (request: IN, options: RequestOptionsArgs) => RequestOptionsArgs,
        after?: boolean): Protocol<IN, OUT> {
        return new WriteRequestProtocol<IN, OUT>(this, (request, args) => {
            if (!after) {
                return this.writeRequest(request, updateRequest(request, args));
            }
            return updateRequest(request, this.writeRequest(request, args));
        });
    }

    /**
     * Reads operation response from HTTP response.
     *
     * @param response HTTP response.
     *
     * @returns operation response.
     */
    abstract readResponse(response: Response): OUT;

    /**
     * Constructs new protocol based on this one, which reads responses with the given function.
     *
     * @param readResponse new response reader function.
     *
     * @return {Protocol<IN, OUT>} new protocol.
     */
    readResponseWith<OUT>(readResponse: (response: Response) => OUT): Protocol<IN, OUT> {
        return new ReadResponseProtocol<IN, OUT>(this, readResponse);
    }

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
     * Constructs new protocol based on this one, which handles errors with the given function.
     *
     * @param errorHandler
     *
     * @return {Protocol<IN, OUT>} new protocol.
     */
    handleErrorWith(errorHandler: (error: any) => any): Protocol<IN, OUT> {
        return new HandleErrorProtocol<IN, OUT>(this, errorHandler);
    }

}

export abstract class RequestBodyProtocol<T> extends Protocol<T, T> {

    handleError?: (error: any) => any;

    writeRequest(request: T, options: RequestOptionsArgs): RequestOptionsArgs {
        return new RequestOptions(options).merge({body: this.writeBody(request)});
    }

    abstract writeBody(request: T): any;

}

class PrepareRequestProtocol<IN, OUT> extends Protocol<IN, OUT> {

    readonly handleError?: (error: any) => any;

    constructor(
        private _protocol: Protocol<IN, OUT>,
        private _prepare: (options: RequestOptionsArgs) => RequestOptionsArgs,
        private _after?: boolean) {
        super();
        this.handleError = this._protocol.handleError;
    }

    prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs {
        if (this._after) {
            return this._prepare(this._protocol.prepareRequest(options));
        }
        return this._protocol.prepareRequest(this._prepare(options));
    }

    writeRequest(request: IN, options: RequestOptionsArgs): RequestOptionsArgs {
        return this._protocol.writeRequest(request, options);
    }

    readResponse(response: Response): OUT {
        return this._protocol.readResponse(response);
    }

}

class WriteRequestProtocol<IN, OUT> extends Protocol<IN, OUT> {

    readonly handleError?: (error: any) => any;

    constructor(
        private _responseProtocol: Protocol<any, OUT>,
        private _writeRequest: (request: IN, options: RequestOptionsArgs) => RequestOptionsArgs) {
        super();
        this.handleError = this._responseProtocol.handleError;
    }

    prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs {
        return this._responseProtocol.prepareRequest(options);
    }

    writeRequest(request: IN, options: RequestOptionsArgs): RequestOptionsArgs {
        return this._writeRequest(request, options);
    }

    readResponse(response: Response): OUT {
        return this._responseProtocol.readResponse(response);
    }

}

class ReadResponseProtocol<IN, OUT> extends Protocol<IN, OUT> {

    readonly handleError?: (error: any) => any;

    constructor(private _requestProtocol: Protocol<IN, any>, private _readResponse: (response: Response) => OUT) {
        super();
        this.handleError = this._requestProtocol.handleError;
    }

    prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs {
        return this._requestProtocol.prepareRequest(options);
    }

    writeRequest(request: IN, options: RequestOptionsArgs): RequestOptionsArgs {
        return this._requestProtocol.writeRequest(request, options);
    }

    readResponse(response: Response): OUT {
        return this._readResponse(response);
    }

    readResponseWith<OUT>(readResponse: (response: Response) => OUT): Protocol<IN, OUT> {
        return new ReadResponseProtocol<IN, OUT>(this._requestProtocol, readResponse);
    }

}

class HandleErrorProtocol<IN, OUT> extends Protocol<IN, OUT> {

    constructor(private _protocol: Protocol<IN, OUT>, public handleError: (error: any) => any) {
        super();
    }

    prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs {
        return this._protocol.prepareRequest(options);
    }

    writeRequest(request: IN, options: RequestOptionsArgs): RequestOptionsArgs {
        return this._protocol.writeRequest(request, options);
    }

    readResponse(response: Response): OUT {
        return this._protocol.readResponse(response);
    }

    handleErrorWith(errorHandler: (error: any) => any): Protocol<IN, OUT> {
        return new HandleErrorProtocol(this._protocol, errorHandler);
    }

}

class JsonProtocol<T> extends RequestBodyProtocol<T> {

    writeBody(request: T): string {
        return JSON.stringify(request);
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

    readonly handleError?: (error: any) => any;

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

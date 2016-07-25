import {Response, RequestOptionsArgs, Request, RequestOptions} from "@angular/http";

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

    //noinspection JSMethodCanBeStatic
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
    prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs {
        return options;
    }

    /**
     * Constructs new data type based on this one, which prepares the request with the given function.
     *
     * @param prepare a request preparation function invoked in addition to `this.prepareRequest` method.
     * @param after `true` to call the `prepare` function after `this.prepareRequest` method,
     * otherwise it will be called before `this.prepareRequest()` method
     *
     * @return {DataType<IN, OUT>} new data type.
     */
    prepareRequestWith(
        prepare: (options: RequestOptionsArgs) => RequestOptionsArgs,
        after?: boolean): DataType<IN, OUT> {
        return new PrepareRequestDataType<IN, OUT>(this, prepare, after);
    }

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
    writeRequestWith<IN>(
        writeRequest: (request: IN, options: RequestOptionsArgs) => RequestOptionsArgs): DataType<IN, OUT> {
        return new WriteRequestDataType<IN, OUT>(this, writeRequest);
    }

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
    updateRequestWith(
        updateRequest: (request: IN, options: RequestOptionsArgs) => RequestOptionsArgs,
        after?: boolean): DataType<IN, OUT> {
        return new WriteRequestDataType<IN, OUT>(this, (request, args) => {
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
     * Constructs new data type based on this one, which reads a response with the given function.
     *
     * @param readResponse new response reader function.
     *
     * @return {DataType<IN, OUT>} new data type.
     */
    readResponseWith<OUT>(readResponse: (response: Response) => OUT): DataType<IN, OUT> {
        return new ReadResponseDataType<IN, OUT>(this, readResponse);
    }

}

/**
 * JSON data type.
 *
 * Sends and receives arbitrary data as JSON over HTTP.
 *
 * @type {DataType<any>}
 */
export const JSON_DATA_TYPE: DataType<any, any> = new JsonDataType<any>();

/**
 * Returns JSON data type.
 *
 * Sends and receives the data of the given type as JSON over HTTP.
 */
export const jsonDataType: (<T>() => DataType<T, T>) = () => JSON_DATA_TYPE;

/**
 * HTTP response data type.
 *
 * The request type is any. It is used as request body.
 *
 * @type {DataType<any, Response>}
 */
export const HTTP_RESPONSE_DATA_TYPE: DataType<any, Response> = new HttpResponseDataType();

export abstract class RequestBodyType<T> extends DataType<T, T> {

    writeRequest(request: T, options: RequestOptionsArgs): RequestOptionsArgs {
        return new RequestOptions(options).merge({body: this.writeBody(request)});
    }

    abstract writeBody(request: T): any;

}

class PrepareRequestDataType<IN, OUT> extends DataType<IN, OUT> {

    constructor(
        private _dataType: DataType<IN, OUT>,
        private _prepare: (options: RequestOptionsArgs) => RequestOptionsArgs,
        private _after?: boolean) {
        super();
    }

    prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs {
        if (this._after) {
            return this._prepare(this._dataType.prepareRequest(options));
        }
        return this._dataType.prepareRequest(this._prepare(options));
    }

    writeRequest(request: IN, options: RequestOptionsArgs): RequestOptionsArgs {
        return this._dataType.writeRequest(request, options);
    }

    readResponse(response: Response): OUT {
        return this._dataType.readResponse(response);
    }

}

class WriteRequestDataType<IN, OUT> extends DataType<IN, OUT> {

    constructor(
        private _responseType: DataType<any, OUT>,
        private _writeRequest: (request: IN, options: RequestOptionsArgs) => RequestOptionsArgs) {
        super();
    }

    prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs {
        return this._responseType.prepareRequest(options);
    }

    writeRequest(request: IN, options: RequestOptionsArgs): RequestOptionsArgs {
        return this._writeRequest(request, options);
    }

    readResponse(response: Response): OUT {
        return this._responseType.readResponse(response);
    }

}

class ReadResponseDataType<IN, OUT> extends DataType<IN, OUT> {

    constructor(private _requestType: DataType<IN, any>, private _readResponse: (response: Response) => OUT) {
        super();
    }

    prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs {
        return this._requestType.prepareRequest(options);
    }

    writeRequest(request: IN, options: RequestOptionsArgs): RequestOptionsArgs {
        return this._requestType.writeRequest(request, options);
    }

    readResponse(response: Response): OUT {
        return this._readResponse(response);
    }

    readResponseWith<OUT>(readResponse: (response: Response) => OUT): DataType<IN, OUT> {
        return new ReadResponseDataType<IN, OUT>(this._requestType, readResponse);
    }

}

class JsonDataType<T> extends RequestBodyType<T> {

    writeBody(request: T): string {
        return JSON.stringify(request);
    }

    readResponse(response: Response): T {
        return response.json();
    }

}

class HttpResponseDataType extends DataType<any, Response> {

    writeRequest(request: any, options: RequestOptionsArgs): RequestOptionsArgs {
        return new RequestOptions(options).merge({body: request});
    }

    readResponse(response: Response): Response {
        return response;
    }

}

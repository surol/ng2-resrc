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

    /**
     * Reads operation response from HTTP response.
     *
     * @param response HTTP response.
     *
     * @returns operation response.
     */
    abstract readResponse(response: Response): OUT;

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

    readResponseWith<OUT>(readResponse: (response: Response) => OUT): DataType<IN, OUT> {
        return new ResponseDataType<IN, OUT>(this, readResponse);
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

    abstract readResponse(response: Response): T;

    writeRequest(request: T, options: RequestOptionsArgs): RequestOptionsArgs {
        return new RequestOptions(options).merge({body: this.writeBody(request)});
    }

    abstract writeBody(request: T): any;

}

class ResponseDataType<IN, OUT> extends DataType<IN, OUT> {

    constructor(private _requestType: DataType<IN, any>, private _readResponse: (response: Response) => OUT) {
        super();
    }

    readResponse(response: Response): OUT {
        return this._readResponse(response);
    }

    prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs {
        return this._requestType.prepareRequest(options);
    }

    writeRequest(request: IN, options: RequestOptionsArgs): RequestOptionsArgs {
        return this._requestType.writeRequest(request, options);
    }

    readResponseWith<OUT>(readResponse: (response: Response) => OUT): DataType<IN, OUT> {
        return new ResponseDataType<IN, OUT>(this._requestType, readResponse);
    }

}

class JsonDataType<T> extends RequestBodyType<T> {

    readResponse(response: Response): T {
        return response.json();
    }

    writeBody(request: T): string {
        return JSON.stringify(request);
    }

}

class HttpResponseDataType extends DataType<any, Response> {

    readResponse(response: Response): Response {
        return response;
    }

    writeRequest(request: any, options: RequestOptionsArgs): RequestOptionsArgs {
        return new RequestOptions(options).merge({body: request});
    }

}

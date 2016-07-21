import {Injectable, Optional, EventEmitter} from "@angular/core";
import {Request, RequestOptionsArgs, Response, Http, RequestMethod, RequestOptions} from "@angular/http";
import {Observable, Observer, Subscription} from "rxjs/Rx";
import {RikeEvent, RikeErrorEvent, RikeSuccessEvent, RikeOperationEvent, RikeCancelEvent} from "./event";
import {RikeOptions, DEFAULT_RIKE_OPTIONS} from "./options";
import {DataType, HTTP_RESPONSE_DATA_TYPE, JSON_DATA_TYPE, jsonDataType} from "./data";

const REQUEST_METHODS: {[name: string]: number} = {
    "GET": RequestMethod.Get,
    "POST": RequestMethod.Post,
    "PUT": RequestMethod.Put,
    "DELETE": RequestMethod.Delete,
    "OPTIONS": RequestMethod.Options,
    "HEAD": RequestMethod.Head,
    "PATCH": RequestMethod.Patch,
};

export function requestMethod(method?: string | RequestMethod): RequestMethod {
    if (!method) {
        return RequestMethod.Get;
    }
    if (typeof method !== "string") {
        return method;
    }

    const result = REQUEST_METHODS[method.toUpperCase()];

    if (result != null) {
        return result;
    }

    throw new Error("Unsupported HTTP request method: " + method);
}

/**
 * REST-like resource operations service.
 *
 * This service can be injected to other services or components.
 *
 * It basically mimics the `Http` interface, but also honors [global Rike options][RikeOptions].
 *
 * It can also be used to perform operations on particular targets.
 */
@Injectable()
export class Rike {

    private readonly _options: RikeOptions;
    private readonly _events = new EventEmitter<RikeEvent>();
    private readonly _internals: RikeInternals;

    constructor(private _http: Http, defaultHttpOptions: RequestOptions, @Optional() _options?: RikeOptions) {
        this._options = _options || DEFAULT_RIKE_OPTIONS;
        this._internals = {
            defaultHttpOptions,
            wrapResponse: (target, operation, response) => this.wrapResponse(target, operation, response)
        }
    }

    /**
     * Global REST-like resource access options.
     *
     * @returns {RikeOptions} either pre-configured, or [default][DEFAULT_RIKE_OPTIONS] options.
     */
    get options(): RikeOptions {
        return this._options;
    }

    /**
     * All REST-like resource operation events emitter.
     *
     * @returns {EventEmitter<RikeEvent>}
     */
    get events(): EventEmitter<RikeEvent> {
        return this._events;
    }

    request(request: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        options = this.updateRequestOptions(options);
        if (typeof request === "string") {
            request = this.options.relativeUrl(request);
        }
        return this._http.request(request, options);
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.get(this.options.relativeUrl(url), this.updateRequestOptions(options));
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.post(this.options.relativeUrl(url), body, this.updateRequestOptions(options));
    }

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.put(this.options.relativeUrl(url), body, this.updateRequestOptions(options));
    }

    //noinspection ReservedWordAsName
    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.delete(this.options.relativeUrl(url), this.updateRequestOptions(options));
    }

    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.patch(this.options.relativeUrl(url), body, this.updateRequestOptions(options));
    }

    head(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.head(this.options.relativeUrl(url), this.updateRequestOptions(options));
    }

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

    target(target: any, dataType?: DataType<any>): RikeTarget<any> {

        const rikeTarget = new RikeTargetImpl<any>(this, this._internals, target, dataType || HTTP_RESPONSE_DATA_TYPE);

        rikeTarget.events.subscribe(
            (event: RikeEvent) => this._events.emit(event),
            (error: any) => this._events.error(error),
            () => this._events.complete());

        return rikeTarget;
    }

    /**
     * Constructs operations target, which operates on the given data type passing it as JSON over HTTP.
     *
     * @param target arbitrary target value.
     *
     * @return {RikeTarget<T>} new operations target.
     */
    json<T>(target: any): RikeTarget<T> {
        return this.target(target, jsonDataType<T>());
    }

    /**
     * Updates HTTP request options accordingly to global _options_.
     *
     * @param options HTTP request options to update.
     *
     * @returns {RequestOptionsArgs} either new HTTP options instance, or the _options_ argument if no modifications
     * done.
     */
    protected updateRequestOptions(options?: RequestOptionsArgs): RequestOptionsArgs | undefined {
        if (!options) {
            return options;
        }
        if (options.url != null) {

            var newUrl = this._options.relativeUrl(options.url);

            if (newUrl !== options.url) {
                options = {
                    url: newUrl,
                    method: options.method,
                    search: options.search,
                    headers: options.headers,
                    body: options.body,
                    withCredentials: options.withCredentials,
                }
            }
        }

        return options;
    }

    //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
    /**
     * Wraps the HTTP response observable for the given operation.
     *
     * @param _target operation target.
     * @param _operation operation name.
     * @param response
     * @returns {Observable<Response>}
     */
    protected wrapResponse(
        _target: RikeTarget<any>,
        _operation: RikeOperation<any>,
        response: Observable<Response>): Observable<Response> {
        return response;
    }

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

//noinspection ReservedWordAsName
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

interface RikeInternals {

    readonly defaultHttpOptions: RequestOptions;

    wrapResponse(
        target: RikeTarget<any>,
        operation: RikeOperation<any>,
        response: Observable<Response>): Observable<Response>;

}

class RikeTargetImpl<T> implements RikeTarget<T> {

    private readonly _events = new EventEmitter<RikeEvent>();
    private _operation?: RikeOperationEvent;
    private _response?: Observable<Response>;
    private _observer?: Observer<any>;
    private _subscr?: Subscription;

    constructor(
        private _rike: Rike,
        private _internals: RikeInternals,
        private _target: any,
        private _dataType: DataType<T>) {
    }

    get rike(): Rike {
        return this._rike;
    }

    get target(): any {
        return this._target;
    }

    get currentOperation(): string | undefined {
        return this._operation && this._operation.operation;
    }

    get events(): EventEmitter<RikeEvent> {
        return this._events;
    }

    get internals(): RikeInternals {
        return this._internals;
    }

    get dataType(): DataType<T> {
        return this._dataType;
    }

    cancel(): boolean {
        return this._cancel();
    }

    private _cancel(cause?: RikeOperationEvent): boolean {
        if (!this._operation) {
            return false;
        }

        this._response = undefined;
        try {
            if (this._observer) {
                try {

                    const cancel = new RikeCancelEvent(this.target, this._operation.operation, cause);

                    this._observer.error(cancel);
                    this._events.error(cancel);
                } catch (e) {
                    this._events.error(new RikeErrorEvent(this.target, this._operation.operation, e));
                    throw e;
                } finally {
                    this._operation = undefined;
                    try {
                        this._observer.complete();
                    } finally {
                        this._observer = undefined;
                    }
                }
            }
        } finally {
            if (this._subscr) {
                this._subscr.unsubscribe();
                this._subscr = undefined;
            }
        }

        return true;
    }

    operation(operation: string, dataType?: DataType<any>): RikeOperation<any> {
        return new RikeOperationImpl(
            this,
            operation,
            !dataType ? this.dataType : (
                this.dataType as DataType<any> === HTTP_RESPONSE_DATA_TYPE
                    ? dataType : new OperationDataType<any>(this.dataType, dataType)));
    }

    json<T>(operation: string): RikeOperation<T> {
        return this.operation(operation, jsonDataType<T>());
    }

    startOperation(operation: RikeOperation<any>): void {

        const event = new RikeOperationEvent(this.target, operation.name);

        this._cancel(event);
        this._events.emit(event);
        this._operation = event;
    }

    wrapResponse<T>(operation: RikeOperation<T>, response: Observable<Response>): Observable<T> {
        response = this.internals.wrapResponse(this, operation, response);
        this._response = response;
        return new Observable<T>((responseObserver: Observer<T>) => {
            if (this._response !== response) {
                return;// Another request already initiated
            }
            this._observer = responseObserver;
            this._subscr = response.subscribe(
                httpResponse => {
                    try {

                        const response = operation.dataType.readResponse(httpResponse);

                        responseObserver.next(response);
                        this._events.emit(new RikeSuccessEvent(this.target, operation.name, response));
                    } catch (e) {
                        this._events.error(new RikeErrorEvent(this.target, operation.name, e));
                    }
                },
                error => {
                    console.error("[" + this.target + "] " + operation + " failed", error);
                    try {
                        responseObserver.error(error);
                        this._events.emit(new RikeErrorEvent(this.target, operation.name, error));
                    } catch (e) {
                        this._events.error(new RikeErrorEvent(this.target, operation.name, e));
                    }
                },
                () => {
                    try {
                        responseObserver.complete();
                    } catch (e) {
                        this._events.error(new RikeErrorEvent(this.target, operation.name, e));
                    } finally {
                        if (this._subscr) {
                            this._subscr.unsubscribe();
                            this._subscr = undefined;
                            this._response = undefined;
                        }
                    }
                });
        });
    }

}

class OperationDataType<T> extends DataType<T> {

    constructor(private _targetDataType: DataType<any>, private _dataType: DataType<T>) {
        super();
    }

    readResponse(response: Response): T {
        return this._dataType.readResponse(response);
    }

    prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs {
        options = this._targetDataType.prepareRequest(options);
        return this._dataType.prepareRequest(options);
    }

    writeRequest(request: T, options: RequestOptionsArgs): RequestOptionsArgs {
        return this._dataType.writeRequest(request, options);
    }

}

class RikeOperationImpl<T> implements RikeOperation<T> {

    constructor(
        private _target: RikeTargetImpl<any>,
        private _name: string,
        private _dataType: DataType<T>) {
    }

    get rike(): Rike {
        return this.target.rike;
    }

    get target(): RikeTargetImpl<any> {
        return this._target;
    }

    get name(): string {
        return this._name;
    }

    get dataType(): DataType<T> {
        return this._dataType;
    }

    request(request: string | Request, options?: RequestOptionsArgs): Observable<T> {
        try {
            this.startOperation();

            if (typeof request === "string") {
                options = this.target.internals.defaultHttpOptions.merge(options || {url: request});
                options = this.httpOptions(requestMethod(options.method), request, options);
            }

            return this.wrapResponse(this.rike.request(request, options));
        } catch (e) {
            this.target.events.error(new RikeErrorEvent(this.target, this.name, e));
            throw e;
        }
    }

    get(url: string, options?: RequestOptionsArgs): Observable<T> {
        try {
            this.startOperation();
            options = this.httpOptions(RequestMethod.Get, url, options);
            return this.wrapResponse(this.rike.get(url, options));
        } catch (e) {
            this.target.events.error(new RikeErrorEvent(this.target, this.name, e));
            throw e;
        }
    }

    post(url: string, data: T, options?: RequestOptionsArgs): Observable<T> {
        try {
            this.startOperation();
            options = this.writeRequest(data, this.httpOptions(RequestMethod.Post, url, options));
            return this.wrapResponse(this.rike.post(url, options.body, options));
        } catch (e) {
            this.target.events.error(new RikeErrorEvent(this.target, this.name, e));
            throw e;
        }
    }

    put(url: string, data: T, options?: RequestOptionsArgs): Observable<T> {
        try {
            this.startOperation();
            options = this.writeRequest(data, this.httpOptions(RequestMethod.Put, url, options));
            return this.wrapResponse(this.rike.put(url, options.body, options));
        } catch (e) {
            this.target.events.error(new RikeErrorEvent(this.target, this.name, e));
            throw e;
        }
    }

    //noinspection ReservedWordAsName
    delete(url: string, options?: RequestOptionsArgs): Observable<T> {
        try {
            this.startOperation();
            options = this.httpOptions(RequestMethod.Delete, url, options);
            return this.wrapResponse(this.rike.delete(url, options));
        } catch (e) {
            this.target.events.error(new RikeErrorEvent(this.target, this.name, e));
            throw e;
        }
    }

    patch(url: string, data: T, options?: RequestOptionsArgs): Observable<T> {
        try {
            this.startOperation();
            options = this.writeRequest(data, this.httpOptions(RequestMethod.Patch, url, options));
            return this.wrapResponse(this.rike.patch(url, options.body, options));
        } catch (e) {
            this.target.events.error(new RikeErrorEvent(this.target, this.name, e));
            throw e;
        }
    }

    head(url: string, options?: RequestOptionsArgs): Observable<T> {
        try {
            this.startOperation();
            options = this.httpOptions(RequestMethod.Head, url, options);
            return this.wrapResponse(this.rike.head(url, options));
        } catch (e) {
            this.target.events.error(new RikeErrorEvent(this.target, this.name, e));
            throw e;
        }
    }

    private startOperation() {
        this.target.startOperation(this);
    }

    private httpOptions(method: RequestMethod, url: string, options?: RequestOptionsArgs): RequestOptionsArgs {
        if (!options) {
            options = {
                url,
                method
            };
        } else {
            options = {
                url,
                method,
                search: options.search,
                headers: options.headers,
                body: options.body,
                withCredentials: options.withCredentials
            };
        }

        return this.dataType.prepareRequest(options);
    }

    private writeRequest(request: T, options: RequestOptionsArgs): RequestOptionsArgs {
        options = this.dataType.writeRequest(request, options);
        return options;
    }

    private wrapResponse(response: Observable<Response>): Observable<T> {
        return this.target.wrapResponse(this, response);
    }

}

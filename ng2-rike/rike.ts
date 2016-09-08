import {Injectable, Optional, EventEmitter} from "@angular/core";
import {
    Request,
    RequestOptionsArgs,
    Response,
    Http,
    RequestMethod,
    RequestOptions,
    ResponseOptions,
    ResponseType
} from "@angular/http";
import {Observable, Observer, Subscription} from "rxjs/Rx";
import {
    RikeEvent,
    RikeSuccessEvent,
    RikeOperationEvent,
    RikeCancelEvent,
    RikeEventSource,
    RikeErrorResponseEvent,
    RikeExceptionEvent
} from "./event";
import {RikeOptions, DEFAULT_RIKE_OPTIONS, relativeUrl} from "./options";
import {Protocol, HTTP_PROTOCOL, jsonProtocol, ErrorResponse} from "./protocol";

const REQUEST_METHODS: {[name: string]: number} = {
    "GET": RequestMethod.Get,
    "POST": RequestMethod.Post,
    "PUT": RequestMethod.Put,
    "DELETE": RequestMethod.Delete,
    "OPTIONS": RequestMethod.Options,
    "HEAD": RequestMethod.Head,
    "PATCH": RequestMethod.Patch,
};

export function requestMethod(method: string | RequestMethod): RequestMethod {
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
export class Rike implements RikeEventSource {

    private readonly _options: RikeOptions;
    private readonly _rikeEvents = new EventEmitter<RikeEvent>();
    private readonly _internals: RikeInternals;
    private _uniqueIdSeq = 0;

    constructor(private _http: Http, defaultHttpOptions: RequestOptions, @Optional() _options?: RikeOptions) {
        this._options = _options || DEFAULT_RIKE_OPTIONS;
        this._internals = {
            defaultHttpOptions,
            generateUniqueId: () => {
                return "" + ++this._uniqueIdSeq;
            },
            request: (request: string | Request, options?: RequestOptionsArgs) => {
                options = this.updateRequestOptions(options);
                if (typeof request === "string") {
                    request = this.options.relativeUrl(request);
                }
                return this._http.request(request, options);
            },
            get: (url: string, options?: RequestOptionsArgs) =>
                this._http.get(
                    this.options.relativeUrl(url),
                    this.updateRequestOptions(options)),
            post: (url: string, body: any, options?: RequestOptionsArgs) =>
                this._http.post(
                    this.options.relativeUrl(url),
                    body,
                    this.updateRequestOptions(options)),
            put: (url: string, body: any, options?: RequestOptionsArgs) =>
                this._http.put(
                    this.options.relativeUrl(url),
                    body,
                    this.updateRequestOptions(options)),
            "delete": (url: string, options?: RequestOptionsArgs) =>
                this._http.delete(
                    this.options.relativeUrl(url),
                    this.updateRequestOptions(options)),
            patch: (url: string, body: any, options?: RequestOptionsArgs) =>
                this._http.patch(
                    this.options.relativeUrl(url),
                    body,
                    this.updateRequestOptions(options)),
            head: (url: string, options?: RequestOptionsArgs) =>
                this._http.head(
                    this.options.relativeUrl(url),
                    this.updateRequestOptions(options)),
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
     * Default Rike protocol.
     *
     * @return {Protocol<any, any>} either {{RikeOptions.defaultProtocol}}, or `HTTP_PROTOCOL`.
     */
    get defaultProtocol(): Protocol<any, any> {
        return this.options.defaultProtocol || HTTP_PROTOCOL;
    }

    /**
     * All REST-like resource operation events emitter.
     *
     * @returns {EventEmitter<RikeEvent>}
     */
    get rikeEvents(): EventEmitter<RikeEvent> {
        return this._rikeEvents;
    }

    request(request: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return this.handleErrors(this._internals.request(request, this.prepareRequest(options)));
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.handleErrors(this._internals.get(url, this.prepareRequest(options)));
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.handleErrors(this._internals.post(url, body, this.prepareRequest(options)));
    }

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.handleErrors(this._internals.put(url, body, this.prepareRequest(options)));
    }

    //noinspection ReservedWordAsName
    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.handleErrors(this._internals.delete(url, this.prepareRequest(options)));
    }

    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.handleErrors(this._internals.patch(url, body, this.prepareRequest(options)));
    }

    head(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.handleErrors(this._internals.head(url, this.prepareRequest(options)));
    }

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

    target(target: any, protocol?: Protocol<any, any>): RikeTarget<any, any> {

        const rikeTarget = new RikeTargetImpl<any, any>(
            this,
            this._internals,
            target,
            protocol ? protocol.prior().apply(this.defaultProtocol) : this.defaultProtocol);

        rikeTarget.rikeEvents.subscribe(
            (event: RikeEvent) => this._rikeEvents.emit(event),
            (error: any) => this._rikeEvents.error(error),
            () => this._rikeEvents.complete());

        return rikeTarget;
    }

    /**
     * Constructs operations target which operates over [JSON protocol][jsonProtocol].
     *
     * @param target arbitrary target value.
     *
     * @return {RikeTarget<I, O>} new operations target.
     */
    json<I, O>(target: any): RikeTarget<I, O> {
        return this.target(target, jsonProtocol<I, O>());
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

    private prepareRequest(options?: RequestOptionsArgs) {
        return this.defaultProtocol.prepareRequest(options || {});
    }

    /**
     * Wraps the HTTP response observable for the given operation to make it handle errors.
     *
     * @param response response observer to wrap.
     *
     * @returns {Observable<Response>} response observer wrapper.
     */
    private handleErrors(response: Observable<Response>): Observable<Response> {
        return new Observable<Response>((responseObserver: Observer<Response>) => {
            response.subscribe(
                httpResponse => responseObserver.next(httpResponse),
                error => responseObserver.error(this.defaultProtocol.handleError(toErrorResponse(error))),
                () => responseObserver.complete());
        });
    }

}

function toErrorResponse(error: any): ErrorResponse {
    if (error instanceof Response) {
        return {
            response: error,
            error: error.status,
        };
    }
    return syntheticResponse(error);
}

function syntheticResponse(error: any): ErrorResponse {

    const statusText = error != null ? error.toString() : null;

    return {
        response: new Response(new ResponseOptions({
            type: ResponseType.Error,
            status: 500,
            statusText: statusText || "Unknown error"
        })),
        error,
    };
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
    abstract readonly rike: Rike;

    /**
     * Operation target value.
     *
     * This is the value passed to the [Rike.target] method.
     */
    abstract readonly target: any;

    /**
     * Unique target identifier.
     */
    abstract readonly uniqueId: string;

    /**
     * A currently evaluating operation.
     *
     * `undefined` if no operations currently in process, i.e. operation not started, cancelled, or completed, either
     * successfully or with error.
     */
    abstract readonly currentOperation?: RikeOperation<any, any>;

    /**
     * An emitter of events for operations performed on this target.
     */
    abstract readonly rikeEvents: EventEmitter<RikeEvent>;

    /**
     * An operations protocol to use by default.
     *
     * This is a protocol based on the one passed to [Rike.target] method, which honors {{Rike.defaultProtocol}}.
     */
    abstract readonly protocol: Protocol<IN, OUT>;

    /**
     * Base URL to use by operations.
     */
    abstract readonly baseUrl?: string;

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
    json<I, O>(name: string): RikeOperation<I, O> {
        return this.operation(name, jsonProtocol<I, O>());
    }

    /**
     * Cancels current operation, if any.
     *
     * @return `true` if operation cancelled, or `false` if there is no operation to cancel.
     */
    abstract cancel(): boolean;

}

//noinspection ReservedWordAsName
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
    abstract readonly target: RikeTarget<any, any>;

    /**
     * Operation name.
     */
    abstract readonly name: string;

    /**
     * Operation protocol.
     *
     * This protocol is based on the one passed to the [RikeTarget.operation], but also honors the default protocol
     * set for target.
     */
    abstract readonly protocol: Protocol<IN, OUT>;

    abstract readonly options: RequestOptions;

    abstract withOptions(options?: RequestOptionsArgs): this;

    get url(): string | undefined {
        return this.options.url;
    }

    withUrl(url: string): this {
        return this.withOptions({url});
    }

    get method(): RequestMethod | undefined {

        const method = this.options.method;

        return method == null ? undefined : requestMethod(method);
    }

    withMethod(method: string | RequestMethod): this {
        return this.withOptions({method});
    }

    abstract load(url?: string, options?: RequestOptionsArgs): Observable<OUT>;

    abstract send(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT>;

    abstract get(url?: string, options?: RequestOptionsArgs): Observable<OUT>;

    abstract post(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT>;

    abstract put(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT>;

    //noinspection ReservedWordAsName
    abstract delete(url?: string, options?: RequestOptionsArgs): Observable<OUT>;

    abstract patch(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT>;

    abstract head(url?: string, options?: RequestOptionsArgs): Observable<OUT>;

}

//noinspection ReservedWordAsName
interface RikeInternals {

    readonly defaultHttpOptions: RequestOptions;

    generateUniqueId(): string;

    request(request: string | Request, options?: RequestOptionsArgs): Observable<Response>;

    get(url: string, options?: RequestOptionsArgs): Observable<Response>;

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;

    delete(url: string, options?: RequestOptionsArgs): Observable<Response>;

    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;

    head(url: string, options?: RequestOptionsArgs): Observable<Response>;

}

class RikeTargetImpl<IN, OUT> extends RikeTarget<IN, OUT> {

    private _uniqueId: string;
    private _rikeEvents = new EventEmitter<RikeEvent>();
    private _baseUrl?: string;
    private _operation?: RikeOperationEvent;
    private _response?: Observable<Response>;
    private _observer?: Observer<any>;
    private _subscr?: Subscription;

    constructor(
        private _rike: Rike,
        private _internals: RikeInternals,
        private _target: any,
        private _protocol: Protocol<IN, OUT>) {
        super();
        this._uniqueId = _internals.generateUniqueId();
    }

    get rike(): Rike {
        return this._rike;
    }

    get target(): any {
        return this._target;
    }

    get uniqueId(): string {
        return this._uniqueId;
    }

    get currentOperation(): RikeOperation<any, any> | undefined {
        return this._operation && this._operation.operation;
    }

    get rikeEvents(): EventEmitter<RikeEvent> {
        return this._rikeEvents;
    }

    get internals(): RikeInternals {
        return this._internals;
    }

    get protocol(): Protocol<IN, OUT> {
        return this._protocol;
    }

    get baseUrl(): string | undefined {
        return this._baseUrl;
    }

    withBaseUrl(url?: string): this {
        this._baseUrl = url;
        return this;
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

                    const cancel = new RikeCancelEvent(this._operation.operation, cause);

                    this._observer.error(cancel);
                    this._rikeEvents.error(cancel);
                } catch (e) {
                    this._rikeEvents.error(new RikeExceptionEvent(this._operation.operation, e));
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

    operation(name: string, protocol?: Protocol<any, any>): RikeOperation<any, any> {
        return new RikeOperationImpl(
            this,
            name,
            !protocol ? this.protocol : protocol.prior().apply(this.protocol));
    }

    startOperation(operation: RikeOperation<any, any>): void {

        const event = new RikeOperationEvent(operation);

        this._cancel(event);
        this._rikeEvents.emit(event);
        this._operation = event;
    }

    wrapResponse<IN, OUT>(operation: RikeOperation<IN, OUT>, response: Observable<Response>): Observable<OUT> {
        this._response = response;
        return new Observable<OUT>((responseObserver: Observer<OUT>) => {
            if (this._response !== response) {
                return;// Another request already initiated
            }
            this._observer = responseObserver;

            const cleanup = () => {
                this._response = undefined;
                this._operation = undefined;
                if (this._subscr) {
                    this._subscr.unsubscribe();
                    this._subscr = undefined;
                }
            };

            this._subscr = response.subscribe(
                httpResponse => {
                    try {

                        const response = operation.protocol.readResponse(httpResponse);

                        responseObserver.next(response);
                        this._rikeEvents.emit(new RikeSuccessEvent(operation, response));
                    } catch (e) {
                        console.error("Failed to handle Rike response", e);
                        this._rikeEvents.error(new RikeExceptionEvent(
                            operation,
                            e,
                            {
                                response: httpResponse,
                                error: e
                            }));
                    }
                },
                error => {
                    console.error("[" + this.target + "] " + operation.name + " failed", error);

                    let errorResponse = toErrorResponse(error);

                    try {
                        errorResponse = operation.protocol.handleError(errorResponse);
                        responseObserver.error(errorResponse);
                        this._rikeEvents.emit(new RikeErrorResponseEvent(operation, errorResponse));
                    } catch (e) {
                        console.error("Failed to handle Rike error", e);
                        errorResponse.error = e;
                        this._rikeEvents.error(new RikeExceptionEvent(operation, e, errorResponse));
                    } finally {
                        cleanup();
                    }
                },
                () => {
                    try {
                        responseObserver.complete();
                    } catch (e) {
                        console.error("Failed to complete Rike response", e);
                        this._rikeEvents.error(new RikeExceptionEvent(operation, e));
                    } finally {
                        cleanup();
                    }
                });
        });
    }

    toString(): string {
        return "RikeTarget[" + this.target + "]";
    }

}

class RikeOperationImpl<IN, OUT> extends RikeOperation<IN, OUT> {

    private _options: RequestOptions;

    constructor(
        private _target: RikeTargetImpl<any, any>,
        private _name: string,
        private _protocol: Protocol<IN, OUT>) {
        super();
        this._options = _target.internals.defaultHttpOptions.merge();
    }

    get rike(): Rike {
        return this.target.rike;
    }

    get internals(): RikeInternals {
        return this.target.internals;
    }

    get target(): RikeTargetImpl<any, any> {
        return this._target;
    }

    get name(): string {
        return this._name;
    }

    get protocol(): Protocol<IN, OUT> {
        return this._protocol;
    }

    withOptions(options?: RequestOptionsArgs): this {
        if (options) {
            this._options = this._options.merge(options);
        }
        return this;
    }

    get options(): RequestOptions {
        return this._options;
    }

    load(url?: string, options?: RequestOptionsArgs): Observable<OUT> {
        try {
            this.startOperation();
            options = this.requestOptions(undefined, url, options);
            return this.wrapResponse(this.internals.request(this.requestUrl(options), options));
        } catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    }

    send(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT> {
        try {
            this.startOperation();
            options = this.writeRequest(request, this.requestOptions(undefined, url, options));
            return this.wrapResponse(this.internals.request(this.requestUrl(options), options));
        } catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    }

    get(url?: string, options?: RequestOptionsArgs): Observable<OUT> {
        try {
            this.startOperation();
            options = this.requestOptions(RequestMethod.Get, url, options);
            return this.wrapResponse(this.internals.get(this.requestUrl(options), options));
        } catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    }

    post(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT> {
        try {
            this.startOperation();
            options = this.writeRequest(request, this.requestOptions(RequestMethod.Post, url, options));
            return this.wrapResponse(this.internals.post(this.requestUrl(options), options.body, options));
        } catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    }

    put(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT> {
        try {
            this.startOperation();
            options = this.writeRequest(request, this.requestOptions(RequestMethod.Put, url, options));
            return this.wrapResponse(this.internals.put(this.requestUrl(options), options.body, options));
        } catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    }

    //noinspection ReservedWordAsName
    delete(url?: string, options?: RequestOptionsArgs): Observable<OUT> {
        try {
            this.startOperation();
            options = this.requestOptions(RequestMethod.Delete, url, options);
            return this.wrapResponse(this.internals.delete(this.requestUrl(options), options));
        } catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    }

    patch(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT> {
        try {
            this.startOperation();
            options = this.writeRequest(request, this.requestOptions(RequestMethod.Patch, url, options));
            return this.wrapResponse(this.internals.patch(this.requestUrl(options), options.body, options));
        } catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    }

    head(url?: string, options?: RequestOptionsArgs): Observable<OUT> {
        try {
            this.startOperation();
            options = this.requestOptions(RequestMethod.Head, url, options);
            return this.wrapResponse(this.internals.head(this.requestUrl(options), options));
        } catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    }

    toString() {
        return "RikeOperation[" + this.name + "@" + this.target + "]";
    }

    private startOperation() {
        this.target.startOperation(this);
    }

    private requestOptions(method?: RequestMethod, url?: string, options?: RequestOptionsArgs): RequestOptionsArgs {
        if (!options) {
            options = {url, method};
        } else {
            options = new RequestOptions(options).merge({url, method});
        }

        options = this.options.merge(options);
        if (options.url == null) {
            options.url = this.target.baseUrl;
        } else {
            options.url = relativeUrl(this.target.baseUrl, options.url);
        }

        return this.protocol.prepareRequest(options);
    }

    private writeRequest(request: IN, options: RequestOptionsArgs): RequestOptionsArgs {
        options = this.protocol.writeRequest(request, options);
        return options;
    }

    //noinspection JSMethodCanBeStatic
    private requestUrl(options: RequestOptionsArgs): string {
        if (options.url != null) {
            return options.url;
        }
        throw new Error("Request URL not specified");
    }

    private wrapResponse(response: Observable<Response>): Observable<OUT> {
        return this.target.wrapResponse(this, response);
    }

}

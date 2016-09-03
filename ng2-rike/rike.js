var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable, Optional, EventEmitter } from "@angular/core";
import { Response, Http, RequestMethod, RequestOptions, ResponseOptions, ResponseType } from "@angular/http";
import { Observable } from "rxjs/Rx";
import { RikeSuccessEvent, RikeOperationEvent, RikeCancelEvent, RikeErrorResponseEvent, RikeExceptionEvent } from "./event";
import { RikeOptions, DEFAULT_RIKE_OPTIONS, relativeUrl } from "./options";
import { HTTP_PROTOCOL, jsonProtocol } from "./protocol";
var REQUEST_METHODS = {
    "GET": RequestMethod.Get,
    "POST": RequestMethod.Post,
    "PUT": RequestMethod.Put,
    "DELETE": RequestMethod.Delete,
    "OPTIONS": RequestMethod.Options,
    "HEAD": RequestMethod.Head,
    "PATCH": RequestMethod.Patch,
};
export function requestMethod(method) {
    if (typeof method !== "string") {
        return method;
    }
    var result = REQUEST_METHODS[method.toUpperCase()];
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
export var Rike = (function () {
    function Rike(_http, defaultHttpOptions, _options) {
        var _this = this;
        this._http = _http;
        this._rikeEvents = new EventEmitter();
        this._uniqueIdSeq = 0;
        this._options = _options || DEFAULT_RIKE_OPTIONS;
        this._internals = {
            defaultHttpOptions: defaultHttpOptions,
            generateUniqueId: function () {
                return "" + ++_this._uniqueIdSeq;
            },
            request: function (request, options) {
                options = _this.updateRequestOptions(options);
                if (typeof request === "string") {
                    request = _this.options.relativeUrl(request);
                }
                return _this._http.request(request, options);
            },
            get: function (url, options) {
                return _this._http.get(_this.options.relativeUrl(url), _this.updateRequestOptions(options));
            },
            post: function (url, body, options) {
                return _this._http.post(_this.options.relativeUrl(url), body, _this.updateRequestOptions(options));
            },
            put: function (url, body, options) {
                return _this._http.put(_this.options.relativeUrl(url), body, _this.updateRequestOptions(options));
            },
            "delete": function (url, options) {
                return _this._http.delete(_this.options.relativeUrl(url), _this.updateRequestOptions(options));
            },
            patch: function (url, body, options) {
                return _this._http.patch(_this.options.relativeUrl(url), body, _this.updateRequestOptions(options));
            },
            head: function (url, options) {
                return _this._http.head(_this.options.relativeUrl(url), _this.updateRequestOptions(options));
            },
        };
    }
    Object.defineProperty(Rike.prototype, "options", {
        /**
         * Global REST-like resource access options.
         *
         * @returns {RikeOptions} either pre-configured, or [default][DEFAULT_RIKE_OPTIONS] options.
         */
        get: function () {
            return this._options;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rike.prototype, "defaultProtocol", {
        /**
         * Default Rike protocol.
         *
         * @return {Protocol<any, any>} either {{RikeOptions.defaultProtocol}}, or `HTTP_PROTOCOL`.
         */
        get: function () {
            return this.options.defaultProtocol || HTTP_PROTOCOL;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rike.prototype, "rikeEvents", {
        /**
         * All REST-like resource operation events emitter.
         *
         * @returns {EventEmitter<RikeEvent>}
         */
        get: function () {
            return this._rikeEvents;
        },
        enumerable: true,
        configurable: true
    });
    Rike.prototype.request = function (request, options) {
        return this.handleErrors(this._internals.request(request, this.prepareRequest(options)));
    };
    Rike.prototype.get = function (url, options) {
        return this.handleErrors(this._internals.get(url, this.prepareRequest(options)));
    };
    Rike.prototype.post = function (url, body, options) {
        return this.handleErrors(this._internals.post(url, body, this.prepareRequest(options)));
    };
    Rike.prototype.put = function (url, body, options) {
        return this.handleErrors(this._internals.put(url, body, this.prepareRequest(options)));
    };
    //noinspection ReservedWordAsName
    Rike.prototype.delete = function (url, options) {
        return this.handleErrors(this._internals.delete(url, this.prepareRequest(options)));
    };
    Rike.prototype.patch = function (url, body, options) {
        return this.handleErrors(this._internals.patch(url, body, this.prepareRequest(options)));
    };
    Rike.prototype.head = function (url, options) {
        return this.handleErrors(this._internals.head(url, this.prepareRequest(options)));
    };
    Rike.prototype.target = function (target, protocol) {
        var _this = this;
        var rikeTarget = new RikeTargetImpl(this, this._internals, target, protocol ? protocol.prior().apply(this.defaultProtocol) : this.defaultProtocol);
        rikeTarget.rikeEvents.subscribe(function (event) { return _this._rikeEvents.emit(event); }, function (error) { return _this._rikeEvents.error(error); }, function () { return _this._rikeEvents.complete(); });
        return rikeTarget;
    };
    /**
     * Constructs operations target which operates over [JSON protocol][jsonProtocol].
     *
     * @param target arbitrary target value.
     *
     * @return {RikeTarget<I, O>} new operations target.
     */
    Rike.prototype.json = function (target) {
        return this.target(target, jsonProtocol());
    };
    /**
     * Updates HTTP request options accordingly to global _options_.
     *
     * @param options HTTP request options to update.
     *
     * @returns {RequestOptionsArgs} either new HTTP options instance, or the _options_ argument if no modifications
     * done.
     */
    Rike.prototype.updateRequestOptions = function (options) {
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
                };
            }
        }
        return options;
    };
    Rike.prototype.prepareRequest = function (options) {
        return this.defaultProtocol.prepareRequest(options || {});
    };
    /**
     * Wraps the HTTP response observable for the given operation to make it handle errors.
     *
     * @param response response observer to wrap.
     *
     * @returns {Observable<Response>} response observer wrapper.
     */
    Rike.prototype.handleErrors = function (response) {
        var _this = this;
        return new Observable(function (responseObserver) {
            response.subscribe(function (httpResponse) { return responseObserver.next(httpResponse); }, function (error) { return responseObserver.error(_this.defaultProtocol.handleError(toErrorResponse(error))); }, function () { return responseObserver.complete(); });
        });
    };
    Rike = __decorate([
        Injectable(),
        __param(2, Optional()), 
        __metadata('design:paramtypes', [Http, RequestOptions, RikeOptions])
    ], Rike);
    return Rike;
}());
function toErrorResponse(error) {
    if (error instanceof Response) {
        return {
            response: error,
            error: error.status,
        };
    }
    return syntheticResponse(error);
}
function syntheticResponse(error) {
    var statusText = error != null ? error.toString() : null;
    return {
        response: new Response(new ResponseOptions({
            type: ResponseType.Error,
            status: 500,
            statusText: statusText || "Unknown error"
        })),
        error: error,
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
export var RikeTarget = (function () {
    function RikeTarget() {
    }
    /**
     * Constructs JSON operation on this target.
     *
     * It operates over [JSON protocol][jsonProtocol].
     *
     * @param name operation name.
     *
     * @return {RikeOperation<T, T>} new operation.
     */
    RikeTarget.prototype.json = function (name) {
        return this.operation(name, jsonProtocol());
    };
    return RikeTarget;
}());
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
export var RikeOperation = (function () {
    function RikeOperation() {
    }
    Object.defineProperty(RikeOperation.prototype, "url", {
        get: function () {
            return this.options.url;
        },
        enumerable: true,
        configurable: true
    });
    RikeOperation.prototype.withUrl = function (url) {
        return this.withOptions({ url: url });
    };
    Object.defineProperty(RikeOperation.prototype, "method", {
        get: function () {
            var method = this.options.method;
            return method == null ? undefined : requestMethod(method);
        },
        enumerable: true,
        configurable: true
    });
    RikeOperation.prototype.withMethod = function (method) {
        return this.withOptions({ method: method });
    };
    return RikeOperation;
}());
var RikeTargetImpl = (function (_super) {
    __extends(RikeTargetImpl, _super);
    function RikeTargetImpl(_rike, _internals, _target, _protocol) {
        _super.call(this);
        this._rike = _rike;
        this._internals = _internals;
        this._target = _target;
        this._protocol = _protocol;
        this._rikeEvents = new EventEmitter();
        this._uniqueId = _internals.generateUniqueId();
    }
    Object.defineProperty(RikeTargetImpl.prototype, "rike", {
        get: function () {
            return this._rike;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeTargetImpl.prototype, "target", {
        get: function () {
            return this._target;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeTargetImpl.prototype, "uniqueId", {
        get: function () {
            return this._uniqueId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeTargetImpl.prototype, "currentOperation", {
        get: function () {
            return this._operation && this._operation.operation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeTargetImpl.prototype, "rikeEvents", {
        get: function () {
            return this._rikeEvents;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeTargetImpl.prototype, "internals", {
        get: function () {
            return this._internals;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeTargetImpl.prototype, "protocol", {
        get: function () {
            return this._protocol;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeTargetImpl.prototype, "baseUrl", {
        get: function () {
            return this._baseUrl;
        },
        enumerable: true,
        configurable: true
    });
    RikeTargetImpl.prototype.withBaseUrl = function (url) {
        this._baseUrl = url;
        return this;
    };
    RikeTargetImpl.prototype.cancel = function () {
        return this._cancel();
    };
    RikeTargetImpl.prototype._cancel = function (cause) {
        if (!this._operation) {
            return false;
        }
        this._response = undefined;
        try {
            if (this._observer) {
                try {
                    var cancel = new RikeCancelEvent(this._operation.operation, cause);
                    this._observer.error(cancel);
                    this._rikeEvents.error(cancel);
                }
                catch (e) {
                    this._rikeEvents.error(new RikeExceptionEvent(this._operation.operation, e));
                    throw e;
                }
                finally {
                    this._operation = undefined;
                    try {
                        this._observer.complete();
                    }
                    finally {
                        this._observer = undefined;
                    }
                }
            }
        }
        finally {
            if (this._subscr) {
                this._subscr.unsubscribe();
                this._subscr = undefined;
            }
        }
        return true;
    };
    RikeTargetImpl.prototype.operation = function (name, protocol) {
        return new RikeOperationImpl(this, name, !protocol ? this.protocol : protocol.prior().apply(this.protocol));
    };
    RikeTargetImpl.prototype.startOperation = function (operation) {
        var event = new RikeOperationEvent(operation);
        this._cancel(event);
        this._rikeEvents.emit(event);
        this._operation = event;
    };
    RikeTargetImpl.prototype.wrapResponse = function (operation, response) {
        var _this = this;
        this._response = response;
        return new Observable(function (responseObserver) {
            if (_this._response !== response) {
                return; // Another request already initiated
            }
            _this._observer = responseObserver;
            var cleanup = function () {
                _this._response = undefined;
                _this._operation = undefined;
                if (_this._subscr) {
                    _this._subscr.unsubscribe();
                    _this._subscr = undefined;
                }
            };
            _this._subscr = response.subscribe(function (httpResponse) {
                try {
                    var response_1 = operation.protocol.readResponse(httpResponse);
                    responseObserver.next(response_1);
                    _this._rikeEvents.emit(new RikeSuccessEvent(operation, response_1));
                }
                catch (e) {
                    console.error("Failed to handle Rike response", e);
                    _this._rikeEvents.error(new RikeExceptionEvent(operation, e, {
                        response: httpResponse,
                        error: e
                    }));
                }
            }, function (error) {
                console.error("[" + _this.target + "] " + operation.name + " failed", error);
                var errorResponse = toErrorResponse(error);
                try {
                    errorResponse = operation.protocol.handleError(errorResponse);
                    responseObserver.error(errorResponse);
                    _this._rikeEvents.emit(new RikeErrorResponseEvent(operation, errorResponse));
                }
                catch (e) {
                    console.error("Failed to handle Rike error", e);
                    errorResponse.error = e;
                    _this._rikeEvents.error(new RikeExceptionEvent(operation, e, errorResponse));
                }
                finally {
                    cleanup();
                }
            }, function () {
                try {
                    responseObserver.complete();
                }
                catch (e) {
                    console.error("Failed to complete Rike response", e);
                    _this._rikeEvents.error(new RikeExceptionEvent(operation, e));
                }
                finally {
                    cleanup();
                }
            });
        });
    };
    RikeTargetImpl.prototype.toString = function () {
        return "RikeTarget[" + this.target + "]";
    };
    return RikeTargetImpl;
}(RikeTarget));
var RikeOperationImpl = (function (_super) {
    __extends(RikeOperationImpl, _super);
    function RikeOperationImpl(_target, _name, _protocol) {
        _super.call(this);
        this._target = _target;
        this._name = _name;
        this._protocol = _protocol;
        this._options = _target.internals.defaultHttpOptions.merge();
    }
    Object.defineProperty(RikeOperationImpl.prototype, "rike", {
        get: function () {
            return this.target.rike;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeOperationImpl.prototype, "internals", {
        get: function () {
            return this.target.internals;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeOperationImpl.prototype, "target", {
        get: function () {
            return this._target;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeOperationImpl.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeOperationImpl.prototype, "protocol", {
        get: function () {
            return this._protocol;
        },
        enumerable: true,
        configurable: true
    });
    RikeOperationImpl.prototype.withOptions = function (options) {
        if (options) {
            this._options = this._options.merge(options);
        }
        return this;
    };
    Object.defineProperty(RikeOperationImpl.prototype, "options", {
        get: function () {
            return this._options;
        },
        enumerable: true,
        configurable: true
    });
    RikeOperationImpl.prototype.load = function (url, options) {
        try {
            this.startOperation();
            options = this.requestOptions(undefined, url, options);
            return this.wrapResponse(this.internals.request(this.requestUrl(options), options));
        }
        catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    };
    RikeOperationImpl.prototype.send = function (request, url, options) {
        try {
            this.startOperation();
            options = this.writeRequest(request, this.requestOptions(undefined, url, options));
            return this.wrapResponse(this.internals.request(this.requestUrl(options), options));
        }
        catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    };
    RikeOperationImpl.prototype.get = function (url, options) {
        try {
            this.startOperation();
            options = this.requestOptions(RequestMethod.Get, url, options);
            return this.wrapResponse(this.internals.get(this.requestUrl(options), options));
        }
        catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    };
    RikeOperationImpl.prototype.post = function (request, url, options) {
        try {
            this.startOperation();
            options = this.writeRequest(request, this.requestOptions(RequestMethod.Post, url, options));
            return this.wrapResponse(this.internals.post(this.requestUrl(options), options.body, options));
        }
        catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    };
    RikeOperationImpl.prototype.put = function (request, url, options) {
        try {
            this.startOperation();
            options = this.writeRequest(request, this.requestOptions(RequestMethod.Put, url, options));
            return this.wrapResponse(this.internals.put(this.requestUrl(options), options.body, options));
        }
        catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    };
    //noinspection ReservedWordAsName
    RikeOperationImpl.prototype.delete = function (url, options) {
        try {
            this.startOperation();
            options = this.requestOptions(RequestMethod.Delete, url, options);
            return this.wrapResponse(this.internals.delete(this.requestUrl(options), options));
        }
        catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    };
    RikeOperationImpl.prototype.patch = function (request, url, options) {
        try {
            this.startOperation();
            options = this.writeRequest(request, this.requestOptions(RequestMethod.Patch, url, options));
            return this.wrapResponse(this.internals.patch(this.requestUrl(options), options.body, options));
        }
        catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    };
    RikeOperationImpl.prototype.head = function (url, options) {
        try {
            this.startOperation();
            options = this.requestOptions(RequestMethod.Head, url, options);
            return this.wrapResponse(this.internals.head(this.requestUrl(options), options));
        }
        catch (e) {
            this.target.rikeEvents.error(new RikeExceptionEvent(this, e));
            throw e;
        }
    };
    RikeOperationImpl.prototype.toString = function () {
        return "RikeOperation[" + this.name + "@" + this.target + "]";
    };
    RikeOperationImpl.prototype.startOperation = function () {
        this.target.startOperation(this);
    };
    RikeOperationImpl.prototype.requestOptions = function (method, url, options) {
        if (!options) {
            options = { url: url, method: method };
        }
        else {
            options = new RequestOptions(options).merge({ url: url, method: method });
        }
        options = this.options.merge(options);
        if (options.url == null) {
            options.url = this.target.baseUrl;
        }
        else {
            options.url = relativeUrl(this.target.baseUrl, options.url);
        }
        return this.protocol.prepareRequest(options);
    };
    RikeOperationImpl.prototype.writeRequest = function (request, options) {
        options = this.protocol.writeRequest(request, options);
        return options;
    };
    //noinspection JSMethodCanBeStatic
    RikeOperationImpl.prototype.requestUrl = function (options) {
        if (options.url != null) {
            return options.url;
        }
        throw new Error("Request URL not specified");
    };
    RikeOperationImpl.prototype.wrapResponse = function (response) {
        return this.target.wrapResponse(this, response);
    };
    return RikeOperationImpl;
}(RikeOperation));

//# sourceMappingURL=rike.js.map

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
System.register("ng2-rike/event", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var RikeEvent, RikeOperationEvent, RikeSuccessEvent, RikeErrorEvent, RikeCancelEvent;
    return {
        setters:[],
        execute: function() {
            /**
             * Basic REST-like resource access event.
             *
             * Such events are emitted by [operations on REST-like resources][RikeOperation.events].
             */
            RikeEvent = (function () {
                function RikeEvent() {
                }
                return RikeEvent;
            }());
            exports_1("RikeEvent", RikeEvent);
            /**
             * An event emitted when operation on a REST-like resource is started.
             */
            RikeOperationEvent = (function (_super) {
                __extends(RikeOperationEvent, _super);
                function RikeOperationEvent(_target, _operation) {
                    _super.call(this);
                    this._target = _target;
                    this._operation = _operation;
                }
                Object.defineProperty(RikeOperationEvent.prototype, "target", {
                    get: function () {
                        return this._target;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeOperationEvent.prototype, "operation", {
                    get: function () {
                        return this._operation;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeOperationEvent.prototype, "complete", {
                    get: function () {
                        return false;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeOperationEvent.prototype, "error", {
                    get: function () {
                        return undefined;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeOperationEvent.prototype, "result", {
                    get: function () {
                        return undefined;
                    },
                    enumerable: true,
                    configurable: true
                });
                return RikeOperationEvent;
            }(RikeEvent));
            exports_1("RikeOperationEvent", RikeOperationEvent);
            /**
             * An event emitted when operation on a REST-like resource is successfully completed.
             */
            RikeSuccessEvent = (function (_super) {
                __extends(RikeSuccessEvent, _super);
                function RikeSuccessEvent(_target, _operation, _result) {
                    _super.call(this);
                    this._target = _target;
                    this._operation = _operation;
                    this._result = _result;
                }
                Object.defineProperty(RikeSuccessEvent.prototype, "target", {
                    get: function () {
                        return this._target;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeSuccessEvent.prototype, "operation", {
                    get: function () {
                        return this._operation;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeSuccessEvent.prototype, "complete", {
                    get: function () {
                        return true;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeSuccessEvent.prototype, "error", {
                    get: function () {
                        return undefined;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeSuccessEvent.prototype, "result", {
                    get: function () {
                        return this._result;
                    },
                    enumerable: true,
                    configurable: true
                });
                return RikeSuccessEvent;
            }(RikeEvent));
            exports_1("RikeSuccessEvent", RikeSuccessEvent);
            /**
             * An event emitted when operation on a REST-like resource is failed.
             *
             * An object of this type is also reported as error when some internal exception occurs.
             */
            RikeErrorEvent = (function (_super) {
                __extends(RikeErrorEvent, _super);
                function RikeErrorEvent(_target, _operation, _error) {
                    _super.call(this);
                    this._target = _target;
                    this._operation = _operation;
                    this._error = _error;
                }
                Object.defineProperty(RikeErrorEvent.prototype, "target", {
                    get: function () {
                        return this._target;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeErrorEvent.prototype, "operation", {
                    get: function () {
                        return this._operation;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeErrorEvent.prototype, "complete", {
                    get: function () {
                        return true;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeErrorEvent.prototype, "error", {
                    get: function () {
                        return this._error;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeErrorEvent.prototype, "result", {
                    get: function () {
                        return undefined;
                    },
                    enumerable: true,
                    configurable: true
                });
                return RikeErrorEvent;
            }(RikeEvent));
            exports_1("RikeErrorEvent", RikeErrorEvent);
            /**
             * An event emitted when operation on a REST-like resource is cancelled.
             */
            RikeCancelEvent = (function (_super) {
                __extends(RikeCancelEvent, _super);
                function RikeCancelEvent(target, operation, _cause) {
                    _super.call(this, target, operation, _cause || "cancel");
                    this._cause = _cause;
                }
                Object.defineProperty(RikeCancelEvent.prototype, "cause", {
                    get: function () {
                        return this._cause;
                    },
                    enumerable: true,
                    configurable: true
                });
                return RikeCancelEvent;
            }(RikeErrorEvent));
            exports_1("RikeCancelEvent", RikeCancelEvent);
        }
    }
});
System.register("ng2-rike/options", [], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var DEFAULT_RIKE_OPTIONS, RikeOptions, BaseRikeOptions;
    return {
        setters:[],
        execute: function() {
            /**
             * Default resource options.
             *
             * @type {RikeOptions}
             */
            exports_2("DEFAULT_RIKE_OPTIONS", DEFAULT_RIKE_OPTIONS = new BaseRikeOptions());
            /**
             * Global resource options.
             *
             * To overwrite global options add a provider for [BaseRikeOptions] instance with [RikeOptions] as a key:
             * ```ts
             * bootstrap(AppComponent, {provide: RikeOptions, new BaseRikeOptions({baseDir: "/rike"})});
             * ```
             */
            RikeOptions = (function () {
                function RikeOptions() {
                }
                /**
                 * Constructs URL relative to _baseUrl_.
                 *
                 * @param url URL
                 *
                 * @returns {string} If _baseUrl_ is not set, or _url_ is absolute, then returns unmodified _url_.
                 * Otherwise concatenates _baseUrl_ and _url_ separating them by `/` sign.
                 */
                RikeOptions.prototype.relativeUrl = function (url) {
                    if (this.baseUrl == null) {
                        return url;
                    }
                    if (url[0] === "/") {
                        return url; // Absolute URL
                    }
                    if (url.match(/^(\w*:)?\/\//)) {
                        return url; // Full URL
                    }
                    return this.baseUrl + "/";
                };
                return RikeOptions;
            }());
            exports_2("RikeOptions", RikeOptions);
            /**
             * Basic [global resource options][RikeOptions] implementation.
             *
             * Can be used to override the global resource options.
             */
            BaseRikeOptions = (function (_super) {
                __extends(BaseRikeOptions, _super);
                function BaseRikeOptions(opts) {
                    _super.call(this);
                    if (opts) {
                        this._baseUrl = opts.baseUrl;
                    }
                }
                Object.defineProperty(BaseRikeOptions.prototype, "baseUrl", {
                    get: function () {
                        return this._baseUrl;
                    },
                    enumerable: true,
                    configurable: true
                });
                return BaseRikeOptions;
            }(RikeOptions));
            exports_2("BaseRikeOptions", BaseRikeOptions);
        }
    }
});
System.register("ng2-rike/data", [], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var DataType, JSON_DATA_TYPE, jsonDataType, HTTP_RESPONSE_DATA_TYPE, RequestBodyType, JsonDataType, HttpResponseDataType;
    return {
        setters:[],
        execute: function() {
            /**
             * REST-like operations data type.
             *
             * It is used by REST-like operations to encode operation requests to HTTP, and to decode operation responses from HTTP.
             *
             * Some of the data types may support only request or response operations, but not both.
             *
             * `T` is operation request type, operation response type, or both.
             */
            DataType = (function () {
                function DataType() {
                }
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
                DataType.prototype.prepareRequest = function (options) {
                    return options;
                };
                return DataType;
            }());
            exports_3("DataType", DataType);
            /**
             * JSON data type.
             *
             * Sends and receives arbitrary data as JSON over HTTP.
             *
             * @type {DataType<any>}
             */
            exports_3("JSON_DATA_TYPE", JSON_DATA_TYPE = new JsonDataType());
            /**
             * Returns JSON data type.
             *
             * Sends and receives the data of the given type as JSON over HTTP.
             */
            exports_3("jsonDataType", jsonDataType = function () { return JSON_DATA_TYPE; });
            /**
             * HTTP response data type.
             *
             * This data type can not be used to post requests.
             *
             * @type {DataType<Response>}
             */
            exports_3("HTTP_RESPONSE_DATA_TYPE", HTTP_RESPONSE_DATA_TYPE = new HttpResponseDataType());
            RequestBodyType = (function (_super) {
                __extends(RequestBodyType, _super);
                function RequestBodyType() {
                    _super.apply(this, arguments);
                }
                RequestBodyType.prototype.writeRequest = function (request, options) {
                    return {
                        url: options.url,
                        method: options.method,
                        search: options.search,
                        headers: options.headers,
                        body: this.writeBody(request),
                        withCredentials: options.withCredentials
                    };
                };
                return RequestBodyType;
            }(DataType));
            exports_3("RequestBodyType", RequestBodyType);
            JsonDataType = (function (_super) {
                __extends(JsonDataType, _super);
                function JsonDataType() {
                    _super.apply(this, arguments);
                }
                JsonDataType.prototype.readResponse = function (response) {
                    return response.json();
                };
                JsonDataType.prototype.writeBody = function (request) {
                    return JSON.stringify(request);
                };
                return JsonDataType;
            }(RequestBodyType));
            HttpResponseDataType = (function (_super) {
                __extends(HttpResponseDataType, _super);
                function HttpResponseDataType() {
                    _super.apply(this, arguments);
                }
                HttpResponseDataType.prototype.readResponse = function (response) {
                    return response;
                };
                HttpResponseDataType.prototype.writeRequest = function (request, options) {
                    throw new Error("Unsupported HTTP method: " + options.method);
                };
                return HttpResponseDataType;
            }(DataType));
        }
    }
});
System.register("ng2-rike/rike", ["@angular/core", "@angular/http", "rxjs/Rx", "ng2-rike/event", "ng2-rike/options", "ng2-rike/data"], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var core_1, http_1, Rx_1, event_1, options_1, data_1;
    var REQUEST_METHODS, Rike, RikeTargetImpl, OperationDataType, RikeOperationImpl;
    function requestMethod(method) {
        if (!method) {
            return http_1.RequestMethod.Get;
        }
        if (typeof method !== "string") {
            return method;
        }
        var result = REQUEST_METHODS[method.toUpperCase()];
        if (result != null) {
            return result;
        }
        throw new Error("Unsupported HTTP request method: " + method);
    }
    exports_4("requestMethod", requestMethod);
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (Rx_1_1) {
                Rx_1 = Rx_1_1;
            },
            function (event_1_1) {
                event_1 = event_1_1;
            },
            function (options_1_1) {
                options_1 = options_1_1;
            },
            function (data_1_1) {
                data_1 = data_1_1;
            }],
        execute: function() {
            REQUEST_METHODS = {
                "GET": http_1.RequestMethod.Get,
                "POST": http_1.RequestMethod.Post,
                "PUT": http_1.RequestMethod.Put,
                "DELETE": http_1.RequestMethod.Delete,
                "OPTIONS": http_1.RequestMethod.Options,
                "HEAD": http_1.RequestMethod.Head,
                "PATCH": http_1.RequestMethod.Patch,
            };
            /**
             * REST-like resource operations service.
             *
             * This service can be injected to other services or components.
             *
             * It basically mimics the `Http` interface, but also honors [global Rike options][RikeOptions].
             *
             * It can also be used to perform operations on particular targets.
             */
            Rike = (function () {
                function Rike(_http, defaultHttpOptions, _options) {
                    var _this = this;
                    this._http = _http;
                    this._events = new core_1.EventEmitter();
                    this._options = _options || options_1.DEFAULT_RIKE_OPTIONS;
                    this._internals = {
                        defaultHttpOptions: defaultHttpOptions,
                        wrapResponse: function (target, operation, response) { return _this.wrapResponse(target, operation, response); }
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
                Object.defineProperty(Rike.prototype, "events", {
                    /**
                     * All REST-like resource operation events emitter.
                     *
                     * @returns {EventEmitter<RikeEvent>}
                     */
                    get: function () {
                        return this._events;
                    },
                    enumerable: true,
                    configurable: true
                });
                Rike.prototype.request = function (request, options) {
                    options = this.updateRequestOptions(options);
                    if (typeof request === "string") {
                        request = this.options.relativeUrl(request);
                    }
                    return this._http.request(request, options);
                };
                Rike.prototype.get = function (url, options) {
                    return this._http.get(this.options.relativeUrl(url), this.updateRequestOptions(options));
                };
                Rike.prototype.post = function (url, body, options) {
                    return this._http.post(this.options.relativeUrl(url), body, this.updateRequestOptions(options));
                };
                Rike.prototype.put = function (url, body, options) {
                    return this._http.put(this.options.relativeUrl(url), body, this.updateRequestOptions(options));
                };
                //noinspection ReservedWordAsName
                Rike.prototype.delete = function (url, options) {
                    return this._http.delete(this.options.relativeUrl(url), this.updateRequestOptions(options));
                };
                Rike.prototype.patch = function (url, body, options) {
                    return this._http.patch(this.options.relativeUrl(url), body, this.updateRequestOptions(options));
                };
                Rike.prototype.head = function (url, options) {
                    return this._http.head(this.options.relativeUrl(url), this.updateRequestOptions(options));
                };
                Rike.prototype.target = function (target, dataType) {
                    var _this = this;
                    var rikeTarget = new RikeTargetImpl(this, this._internals, target, dataType || data_1.HTTP_RESPONSE_DATA_TYPE);
                    rikeTarget.events.subscribe(function (event) { return _this._events.emit(event); }, function (error) { return _this._events.error(error); }, function () { return _this._events.complete(); });
                    return rikeTarget;
                };
                /**
                 * Constructs operations target, which operates on the given data type passing it as JSON over HTTP.
                 *
                 * @param target arbitrary target value.
                 *
                 * @return {RikeTarget<T>} new operations target.
                 */
                Rike.prototype.json = function (target) {
                    return this.target(target, data_1.jsonDataType());
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
                //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
                /**
                 * Wraps the HTTP response observable for the given operation.
                 *
                 * @param _target operation target.
                 * @param _operation operation name.
                 * @param response
                 * @returns {Observable<Response>}
                 */
                Rike.prototype.wrapResponse = function (_target, _operation, response) {
                    return response;
                };
                Rike = __decorate([
                    core_1.Injectable(),
                    __param(2, core_1.Optional()), 
                    __metadata('design:paramtypes', [http_1.Http, http_1.RequestOptions, options_1.RikeOptions])
                ], Rike);
                return Rike;
            }());
            exports_4("Rike", Rike);
            RikeTargetImpl = (function () {
                function RikeTargetImpl(_rike, _internals, _target, _dataType) {
                    this._rike = _rike;
                    this._internals = _internals;
                    this._target = _target;
                    this._dataType = _dataType;
                    this._events = new core_1.EventEmitter();
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
                Object.defineProperty(RikeTargetImpl.prototype, "currentOperation", {
                    get: function () {
                        return this._operation && this._operation.operation;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeTargetImpl.prototype, "events", {
                    get: function () {
                        return this._events;
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
                Object.defineProperty(RikeTargetImpl.prototype, "dataType", {
                    get: function () {
                        return this._dataType;
                    },
                    enumerable: true,
                    configurable: true
                });
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
                                var cancel = new event_1.RikeCancelEvent(this.target, this._operation.operation, cause);
                                this._observer.error(cancel);
                                this._events.error(cancel);
                            }
                            catch (e) {
                                this._events.error(new event_1.RikeErrorEvent(this.target, this._operation.operation, e));
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
                RikeTargetImpl.prototype.operation = function (operation, dataType) {
                    return new RikeOperationImpl(this, operation, !dataType ? this.dataType : (this.dataType === data_1.HTTP_RESPONSE_DATA_TYPE
                        ? dataType : new OperationDataType(this.dataType, dataType)));
                };
                RikeTargetImpl.prototype.json = function (operation) {
                    return this.operation(operation, data_1.jsonDataType());
                };
                RikeTargetImpl.prototype.startOperation = function (operation) {
                    var event = new event_1.RikeOperationEvent(this.target, operation.name);
                    this._cancel(event);
                    this._events.emit(event);
                    this._operation = event;
                };
                RikeTargetImpl.prototype.wrapResponse = function (operation, response) {
                    var _this = this;
                    response = this.internals.wrapResponse(this, operation, response);
                    this._response = response;
                    return new Rx_1.Observable(function (responseObserver) {
                        if (_this._response !== response) {
                            return; // Another request already initiated
                        }
                        _this._observer = responseObserver;
                        _this._subscr = response.subscribe(function (httpResponse) {
                            try {
                                var response_1 = operation.dataType.readResponse(httpResponse);
                                responseObserver.next(response_1);
                                _this._events.emit(new event_1.RikeSuccessEvent(_this.target, operation.name, response_1));
                            }
                            catch (e) {
                                _this._events.error(new event_1.RikeErrorEvent(_this.target, operation.name, e));
                            }
                        }, function (error) {
                            console.error("[" + _this.target + "] " + operation + " failed", error);
                            try {
                                responseObserver.error(error);
                                _this._events.emit(new event_1.RikeErrorEvent(_this.target, operation.name, error));
                            }
                            catch (e) {
                                _this._events.error(new event_1.RikeErrorEvent(_this.target, operation.name, e));
                            }
                        }, function () {
                            try {
                                responseObserver.complete();
                            }
                            catch (e) {
                                _this._events.error(new event_1.RikeErrorEvent(_this.target, operation.name, e));
                            }
                            finally {
                                if (_this._subscr) {
                                    _this._subscr.unsubscribe();
                                    _this._subscr = undefined;
                                    _this._response = undefined;
                                }
                            }
                        });
                    });
                };
                return RikeTargetImpl;
            }());
            OperationDataType = (function (_super) {
                __extends(OperationDataType, _super);
                function OperationDataType(_targetDataType, _dataType) {
                    _super.call(this);
                    this._targetDataType = _targetDataType;
                    this._dataType = _dataType;
                }
                OperationDataType.prototype.readResponse = function (response) {
                    return this._dataType.readResponse(response);
                };
                OperationDataType.prototype.prepareRequest = function (options) {
                    options = this._targetDataType.prepareRequest(options);
                    return this._dataType.prepareRequest(options);
                };
                OperationDataType.prototype.writeRequest = function (request, options) {
                    return this._dataType.writeRequest(request, options);
                };
                return OperationDataType;
            }(data_1.DataType));
            RikeOperationImpl = (function () {
                function RikeOperationImpl(_target, _name, _dataType) {
                    this._target = _target;
                    this._name = _name;
                    this._dataType = _dataType;
                }
                Object.defineProperty(RikeOperationImpl.prototype, "rike", {
                    get: function () {
                        return this.target.rike;
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
                Object.defineProperty(RikeOperationImpl.prototype, "dataType", {
                    get: function () {
                        return this._dataType;
                    },
                    enumerable: true,
                    configurable: true
                });
                RikeOperationImpl.prototype.request = function (request, options) {
                    try {
                        this.startOperation();
                        if (typeof request === "string") {
                            options = this.target.internals.defaultHttpOptions.merge(options || { url: request });
                            options = this.httpOptions(requestMethod(options.method), request, options);
                        }
                        return this.wrapResponse(this.rike.request(request, options));
                    }
                    catch (e) {
                        this.target.events.error(new event_1.RikeErrorEvent(this.target, this.name, e));
                        throw e;
                    }
                };
                RikeOperationImpl.prototype.get = function (url, options) {
                    try {
                        this.startOperation();
                        options = this.httpOptions(http_1.RequestMethod.Get, url, options);
                        return this.wrapResponse(this.rike.get(url, options));
                    }
                    catch (e) {
                        this.target.events.error(new event_1.RikeErrorEvent(this.target, this.name, e));
                        throw e;
                    }
                };
                RikeOperationImpl.prototype.post = function (url, data, options) {
                    try {
                        this.startOperation();
                        options = this.writeRequest(data, this.httpOptions(http_1.RequestMethod.Post, url, options));
                        return this.wrapResponse(this.rike.post(url, options.body, options));
                    }
                    catch (e) {
                        this.target.events.error(new event_1.RikeErrorEvent(this.target, this.name, e));
                        throw e;
                    }
                };
                RikeOperationImpl.prototype.put = function (url, data, options) {
                    try {
                        this.startOperation();
                        options = this.writeRequest(data, this.httpOptions(http_1.RequestMethod.Put, url, options));
                        return this.wrapResponse(this.rike.put(url, options.body, options));
                    }
                    catch (e) {
                        this.target.events.error(new event_1.RikeErrorEvent(this.target, this.name, e));
                        throw e;
                    }
                };
                //noinspection ReservedWordAsName
                RikeOperationImpl.prototype.delete = function (url, options) {
                    try {
                        this.startOperation();
                        options = this.httpOptions(http_1.RequestMethod.Delete, url, options);
                        return this.wrapResponse(this.rike.delete(url, options));
                    }
                    catch (e) {
                        this.target.events.error(new event_1.RikeErrorEvent(this.target, this.name, e));
                        throw e;
                    }
                };
                RikeOperationImpl.prototype.patch = function (url, data, options) {
                    try {
                        this.startOperation();
                        options = this.writeRequest(data, this.httpOptions(http_1.RequestMethod.Patch, url, options));
                        return this.wrapResponse(this.rike.patch(url, options.body, options));
                    }
                    catch (e) {
                        this.target.events.error(new event_1.RikeErrorEvent(this.target, this.name, e));
                        throw e;
                    }
                };
                RikeOperationImpl.prototype.head = function (url, options) {
                    try {
                        this.startOperation();
                        options = this.httpOptions(http_1.RequestMethod.Head, url, options);
                        return this.wrapResponse(this.rike.head(url, options));
                    }
                    catch (e) {
                        this.target.events.error(new event_1.RikeErrorEvent(this.target, this.name, e));
                        throw e;
                    }
                };
                RikeOperationImpl.prototype.startOperation = function () {
                    this.target.startOperation(this);
                };
                RikeOperationImpl.prototype.httpOptions = function (method, url, options) {
                    if (!options) {
                        options = {
                            url: url,
                            method: method
                        };
                    }
                    else {
                        options = {
                            url: url,
                            method: method,
                            search: options.search,
                            headers: options.headers,
                            body: options.body,
                            withCredentials: options.withCredentials
                        };
                    }
                    return this.dataType.prepareRequest(options);
                };
                RikeOperationImpl.prototype.writeRequest = function (request, options) {
                    options = this.dataType.writeRequest(request, options);
                    return options;
                };
                RikeOperationImpl.prototype.wrapResponse = function (response) {
                    return this.target.wrapResponse(this, response);
                };
                return RikeOperationImpl;
            }());
        }
    }
});
System.register("ng2-rike", ["ng2-rike/rike", "ng2-rike/data", "ng2-rike/event", "ng2-rike/options"], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var rike_1;
    var RIKE_PROVIDERS;
    var exportedNames_1 = {
        'RIKE_PROVIDERS': true
    };
    function exportStar_1(m) {
        var exports = {};
        for(var n in m) {
            if (n !== "default"&& !exportedNames_1.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_5(exports);
    }
    return {
        setters:[
            function (rike_1_1) {
                rike_1 = rike_1_1;
                exportStar_1(rike_1_1);
            },
            function (data_2_1) {
                exportStar_1(data_2_1);
            },
            function (event_2_1) {
                exportStar_1(event_2_1);
            },
            function (options_2_1) {
                exportStar_1(options_2_1);
            }],
        execute: function() {
            /**
             * Provides a basic set of providers to use REST-like services in application.
             *
             * The `RIKE_PROVIDERS` should be included either in a component's injector, or in the root injector when bootstrapping
             * an application.
             *
             * @type {any[]}
             */
            exports_5("RIKE_PROVIDERS", RIKE_PROVIDERS = [
                rike_1.Rike
            ]);
        }
    }
});
//# sourceMappingURL=ng2-rike.js.map
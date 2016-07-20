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
System.register("ng2-resrc/event", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ResrcEvent, ResrcOperationEvent, ResrcSuccessEvent, ResrcErrorEvent, ResrcCancelEvent;
    return {
        setters:[],
        execute: function() {
            /**
             * Basic REST-like resource access event.
             *
             * Such events are emitted by [operations on REST-like resources][ResrcOperation.event].
             */
            ResrcEvent = (function () {
                function ResrcEvent() {
                }
                return ResrcEvent;
            }());
            exports_1("ResrcEvent", ResrcEvent);
            /**
             * An event emitted when operation on a REST-like resource is started.
             */
            ResrcOperationEvent = (function (_super) {
                __extends(ResrcOperationEvent, _super);
                function ResrcOperationEvent(_target, _operation) {
                    _super.call(this);
                    this._target = _target;
                    this._operation = _operation;
                }
                Object.defineProperty(ResrcOperationEvent.prototype, "target", {
                    get: function () {
                        return this._target;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcOperationEvent.prototype, "operation", {
                    get: function () {
                        return this._operation;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcOperationEvent.prototype, "complete", {
                    get: function () {
                        return false;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcOperationEvent.prototype, "error", {
                    get: function () {
                        return undefined;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcOperationEvent.prototype, "result", {
                    get: function () {
                        return undefined;
                    },
                    enumerable: true,
                    configurable: true
                });
                return ResrcOperationEvent;
            }(ResrcEvent));
            exports_1("ResrcOperationEvent", ResrcOperationEvent);
            /**
             * An event emitted when operation on a REST-like resource is successfully completed.
             */
            ResrcSuccessEvent = (function (_super) {
                __extends(ResrcSuccessEvent, _super);
                function ResrcSuccessEvent(_target, _operation, _result) {
                    _super.call(this);
                    this._target = _target;
                    this._operation = _operation;
                    this._result = _result;
                }
                Object.defineProperty(ResrcSuccessEvent.prototype, "target", {
                    get: function () {
                        return this._target;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcSuccessEvent.prototype, "operation", {
                    get: function () {
                        return this._operation;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcSuccessEvent.prototype, "complete", {
                    get: function () {
                        return true;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcSuccessEvent.prototype, "error", {
                    get: function () {
                        return undefined;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcSuccessEvent.prototype, "result", {
                    get: function () {
                        return this._result;
                    },
                    enumerable: true,
                    configurable: true
                });
                return ResrcSuccessEvent;
            }(ResrcEvent));
            exports_1("ResrcSuccessEvent", ResrcSuccessEvent);
            /**
             * An event emitted when operation on a REST-like resource is failed.
             *
             * An object of this type is also reported as error when some internal exception occurs.
             */
            ResrcErrorEvent = (function (_super) {
                __extends(ResrcErrorEvent, _super);
                function ResrcErrorEvent(_target, _operation, _error) {
                    _super.call(this);
                    this._target = _target;
                    this._operation = _operation;
                    this._error = _error;
                }
                Object.defineProperty(ResrcErrorEvent.prototype, "target", {
                    get: function () {
                        return this._target;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcErrorEvent.prototype, "operation", {
                    get: function () {
                        return this._operation;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcErrorEvent.prototype, "complete", {
                    get: function () {
                        return true;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcErrorEvent.prototype, "error", {
                    get: function () {
                        return this._error;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcErrorEvent.prototype, "result", {
                    get: function () {
                        return undefined;
                    },
                    enumerable: true,
                    configurable: true
                });
                return ResrcErrorEvent;
            }(ResrcEvent));
            exports_1("ResrcErrorEvent", ResrcErrorEvent);
            /**
             * An event emitted when operation on a REST-like resource is cancelled.
             */
            ResrcCancelEvent = (function (_super) {
                __extends(ResrcCancelEvent, _super);
                function ResrcCancelEvent(target, operation, _cause) {
                    _super.call(this, target, operation, _cause || "cancel");
                    this._cause = _cause;
                }
                Object.defineProperty(ResrcCancelEvent.prototype, "cause", {
                    get: function () {
                        return this._cause;
                    },
                    enumerable: true,
                    configurable: true
                });
                return ResrcCancelEvent;
            }(ResrcErrorEvent));
            exports_1("ResrcCancelEvent", ResrcCancelEvent);
        }
    }
});
System.register("ng2-resrc/options", [], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var DEFAULT_RESRC_OPTIONS, ResrcOptions, BaseResrcOptions;
    return {
        setters:[],
        execute: function() {
            /**
             * Default resource options.
             *
             * @type {ResrcOptions}
             */
            exports_2("DEFAULT_RESRC_OPTIONS", DEFAULT_RESRC_OPTIONS = new BaseResrcOptions());
            /**
             * Global resource options.
             *
             * To overwrite global options add a provider for [BaseResrcOptions] instance with [ResrcOptions] as a key:
             * ```ts
             * bootstrap(AppComponent, {provide: ResrcOptions, new BaseResrcOptions({baseDir: "/rest"})});
             * ```
             */
            ResrcOptions = (function () {
                function ResrcOptions() {
                }
                /**
                 * Constructs URL relative to _baseUrl_.
                 *
                 * @param url URL
                 *
                 * @returns {string} If _baseUrl_ is not set, or _url_ is absolute, then returns unmodified _url_.
                 * Otherwise concatenates _baseUrl_ and _url_ separating them by `/` sign.
                 */
                ResrcOptions.prototype.relativeUrl = function (url) {
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
                return ResrcOptions;
            }());
            exports_2("ResrcOptions", ResrcOptions);
            /**
             * Basic [global resource options][ResrcOptions] implementation.
             *
             * Can be used to override the global resource options.
             */
            BaseResrcOptions = (function (_super) {
                __extends(BaseResrcOptions, _super);
                function BaseResrcOptions(opts) {
                    _super.call(this);
                    if (opts) {
                        this._baseUrl = opts.baseUrl;
                    }
                }
                Object.defineProperty(BaseResrcOptions.prototype, "baseUrl", {
                    get: function () {
                        return this._baseUrl;
                    },
                    enumerable: true,
                    configurable: true
                });
                return BaseResrcOptions;
            }(ResrcOptions));
            exports_2("BaseResrcOptions", BaseResrcOptions);
        }
    }
});
System.register("ng2-resrc/resrc", ["@angular/core", "@angular/http", "rxjs/Rx", "ng2-resrc/event", "ng2-resrc/options"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var core_1, http_1, Rx_1, event_1, options_1;
    var Resrc, ResrcTargetImpl, ResrcOperationImpl;
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
            }],
        execute: function() {
            /**
             * REST-like resource operations service.
             *
             * This service can be injected to other services or components.
             *
             * It basically mimics the `Http` interface, but also honors [global options][ResrcOptions].
             *
             * It can also be used to perform operations on particular targets.
             */
            Resrc = (function () {
                function Resrc(_http, _options) {
                    var _this = this;
                    this._http = _http;
                    this._events = new core_1.EventEmitter();
                    this._internals = {
                        wrapResponse: function (target, operation, response) { return _this.wrapResponse(target, operation, response); }
                    };
                    this._options = _options || options_1.DEFAULT_RESRC_OPTIONS;
                }
                Object.defineProperty(Resrc.prototype, "options", {
                    /**
                     * Global REST-like resource access options.
                     *
                     * @returns {ResrcOptions} either pre-configured, or [default][DEFAULT_RESRC_OPTIONS] options.
                     */
                    get: function () {
                        return this._options;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Resrc.prototype, "events", {
                    /**
                     * All REST-like resource operation events emitter.
                     *
                     * @returns {EventEmitter<ResrcEvent>}
                     */
                    get: function () {
                        return this._events;
                    },
                    enumerable: true,
                    configurable: true
                });
                Resrc.prototype.request = function (request, options) {
                    options = this.updateRequestOptions(options);
                    if (typeof request === "string") {
                        request = this.options.relativeUrl(request);
                    }
                    return this._http.request(request, options);
                };
                Resrc.prototype.get = function (url, options) {
                    return this._http.get(this.options.relativeUrl(url), this.updateRequestOptions(options));
                };
                Resrc.prototype.post = function (url, body, options) {
                    return this._http.post(this.options.relativeUrl(url), body, this.updateRequestOptions(options));
                };
                Resrc.prototype.put = function (url, body, options) {
                    return this._http.put(this.options.relativeUrl(url), body, this.updateRequestOptions(options));
                };
                //noinspection ReservedWordAsName
                Resrc.prototype.delete = function (url, options) {
                    return this._http.delete(this.options.relativeUrl(url), this.updateRequestOptions(options));
                };
                Resrc.prototype.patch = function (url, body, options) {
                    return this._http.patch(this.options.relativeUrl(url), body, this.updateRequestOptions(options));
                };
                Resrc.prototype.head = function (url, options) {
                    return this._http.head(this.options.relativeUrl(url), this.updateRequestOptions(options));
                };
                /**
                 * Constructs operation target.
                 *
                 * @param target arbitrary target value.
                 *
                 * @returns {ResrcTargetImpl} new operation target.
                 */
                Resrc.prototype.target = function (target) {
                    var _this = this;
                    var targetResrc = new ResrcTargetImpl(this, this._internals, target);
                    targetResrc.events.subscribe(function (event) { return _this._events.emit(event); }, function (error) { return _this._events.error(error); }, function () { return _this._events.complete(); });
                    return targetResrc;
                };
                /**
                 * Updates HTTP request options accordingly to global _options_.
                 *
                 * @param options HTTP request options to update.
                 *
                 * @returns {RequestOptionsArgs} either new HTTP options instance, or the _options_ argument if no modifications
                 * done.
                 */
                Resrc.prototype.updateRequestOptions = function (options) {
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
                Resrc.prototype.wrapResponse = function (_target, _operation, response) {
                    return response;
                };
                Resrc = __decorate([
                    core_1.Injectable(),
                    __param(1, core_1.Optional()), 
                    __metadata('design:paramtypes', [http_1.Http, options_1.ResrcOptions])
                ], Resrc);
                return Resrc;
            }());
            exports_3("Resrc", Resrc);
            ResrcTargetImpl = (function () {
                function ResrcTargetImpl(_resrc, _internals, _target) {
                    this._resrc = _resrc;
                    this._internals = _internals;
                    this._target = _target;
                    this._events = new core_1.EventEmitter();
                }
                Object.defineProperty(ResrcTargetImpl.prototype, "resrc", {
                    get: function () {
                        return this._resrc;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcTargetImpl.prototype, "target", {
                    get: function () {
                        return this._target;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcTargetImpl.prototype, "currentOperation", {
                    get: function () {
                        return this._operation && this._operation.operation;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcTargetImpl.prototype, "events", {
                    get: function () {
                        return this._events;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcTargetImpl.prototype, "internal", {
                    get: function () {
                        return this._internals;
                    },
                    enumerable: true,
                    configurable: true
                });
                ResrcTargetImpl.prototype.cancel = function () {
                    return this._cancel();
                };
                ResrcTargetImpl.prototype._cancel = function (cause) {
                    if (!this._operation) {
                        return false;
                    }
                    this._response = undefined;
                    try {
                        if (this._observer) {
                            try {
                                var cancel = new event_1.ResrcCancelEvent(this.target, this._operation.operation, cause);
                                this._observer.error(cancel);
                                this._events.error(cancel);
                            }
                            catch (e) {
                                this._events.error(new event_1.ResrcErrorEvent(this.target, this._operation.operation, e));
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
                ResrcTargetImpl.prototype.operation = function (operation) {
                    return new ResrcOperationImpl(this, operation);
                };
                ResrcTargetImpl.prototype.startOperation = function (operation) {
                    var event = new event_1.ResrcOperationEvent(this.target, operation.name);
                    this._cancel(event);
                    try {
                        this._events.emit(event);
                        this._operation = event;
                    }
                    catch (e) {
                        this._events.error(new event_1.ResrcErrorEvent(this.target, operation.name, e));
                        throw e;
                    }
                };
                ResrcTargetImpl.prototype.wrapResponse = function (operation, response) {
                    var _this = this;
                    response = this.internal.wrapResponse(this, operation, response);
                    this._response = response;
                    return new Rx_1.Observable(function (responseObserver) {
                        if (_this._response !== response) {
                            return; // Another request already initiated
                        }
                        _this._observer = responseObserver;
                        _this._subscr = response.subscribe(function (response) {
                            try {
                                responseObserver.next(response);
                                _this._events.emit(new event_1.ResrcSuccessEvent(_this.target, operation.name, response));
                            }
                            catch (e) {
                                _this._events.error(new event_1.ResrcErrorEvent(_this.target, operation.name, e));
                            }
                        }, function (error) {
                            console.error("[" + _this.target + "] " + operation + " failed", error);
                            try {
                                responseObserver.error(error);
                                _this._events.emit(new event_1.ResrcErrorEvent(_this.target, operation.name, error));
                            }
                            catch (e) {
                                _this._events.error(new event_1.ResrcErrorEvent(_this.target, operation.name, e));
                            }
                        }, function () {
                            try {
                                responseObserver.complete();
                            }
                            catch (e) {
                                _this._events.error(new event_1.ResrcErrorEvent(_this.target, operation.name, e));
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
                return ResrcTargetImpl;
            }());
            ResrcOperationImpl = (function () {
                function ResrcOperationImpl(_target, _name) {
                    this._target = _target;
                    this._name = _name;
                }
                Object.defineProperty(ResrcOperationImpl.prototype, "resrc", {
                    get: function () {
                        return this.target.resrc;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcOperationImpl.prototype, "target", {
                    get: function () {
                        return this._target;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResrcOperationImpl.prototype, "name", {
                    get: function () {
                        return this._name;
                    },
                    enumerable: true,
                    configurable: true
                });
                ResrcOperationImpl.prototype.request = function (request, options) {
                    this.startOperation();
                    return this.wrapResponse(this.resrc.request(request, options));
                };
                ResrcOperationImpl.prototype.get = function (url, options) {
                    this.startOperation();
                    return this.wrapResponse(this.resrc.get(url, options));
                };
                ResrcOperationImpl.prototype.post = function (url, body, options) {
                    this.startOperation();
                    return this.wrapResponse(this.resrc.post(url, body, options));
                };
                ResrcOperationImpl.prototype.put = function (url, body, options) {
                    this.startOperation();
                    return this.wrapResponse(this.resrc.put(url, body, options));
                };
                //noinspection ReservedWordAsName
                ResrcOperationImpl.prototype.delete = function (url, options) {
                    this.startOperation();
                    return this.wrapResponse(this.resrc.delete(url, options));
                };
                ResrcOperationImpl.prototype.patch = function (url, body, options) {
                    this.startOperation();
                    return this.wrapResponse(this.resrc.patch(url, body, options));
                };
                ResrcOperationImpl.prototype.head = function (url, options) {
                    this.startOperation();
                    return this.wrapResponse(this.resrc.head(url, options));
                };
                ResrcOperationImpl.prototype.startOperation = function () {
                    this.target.startOperation(this);
                };
                ResrcOperationImpl.prototype.wrapResponse = function (response) {
                    return this.target.wrapResponse(this, response);
                };
                return ResrcOperationImpl;
            }());
        }
    }
});
System.register("ng2-resrc", ["ng2-resrc/resrc", "ng2-resrc/event", "ng2-resrc/options"], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var resrc_1;
    var RESRC_PROVIDERS;
    var exportedNames_1 = {
        'RESRC_PROVIDERS': true
    };
    function exportStar_1(m) {
        var exports = {};
        for(var n in m) {
            if (n !== "default"&& !exportedNames_1.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_4(exports);
    }
    return {
        setters:[
            function (resrc_1_1) {
                resrc_1 = resrc_1_1;
                exportStar_1(resrc_1_1);
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
             * The RESRC_PROVIDERS should be included either in a component's injector, or in the root injector when bootstrapping
             * an application.
             *
             * @type {any[]}
             */
            exports_4("RESRC_PROVIDERS", RESRC_PROVIDERS = [
                resrc_1.Resrc
            ]);
        }
    }
});
//# sourceMappingURL=ng2-resrc.js.map
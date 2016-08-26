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
System.register("ng2rike/protocol", ["@angular/http"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var http_1;
    var Protocol, CustomProtocolAddon, CustomProtocolMod, CustomProtocol, JsonProtocol, JSON_PROTOCOL, jsonProtocol, HttpProtocol, HTTP_PROTOCOL;
    return {
        setters:[
            function (http_1_1) {
                http_1 = http_1_1;
            }],
        execute: function() {
            /**
             * REST-like operations protocol.
             *
             * It is used by REST-like operations to encode operation requests to HTTP, decode operation responses from HTTP,
             * and handle errors.
             *
             * `IN` is operation request type.
             * `OUT` is operation response type.
             */
            Protocol = (function () {
                function Protocol() {
                }
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
                Protocol.prototype.prepareRequest = function (options) {
                    return options;
                };
                //noinspection JSMethodCanBeStatic
                /**
                 * Handles HTTP error.
                 *
                 * Does not modify error response by default.
                 *
                 * @param error error response to handle.
                 *
                 * @returns error processing result.
                 */
                Protocol.prototype.handleError = function (error) {
                    return error;
                };
                /**
                 * Creates protocol addon able to prepend protocol actions with specified functions.
                 *
                 * @return {ProtocolAddon<IN, OUT>} protocol addon.
                 */
                Protocol.prototype.prior = function () {
                    return new CustomProtocolAddon(this, true);
                };
                /**
                 * Creates protocol addon able to append specified functions to protocol actions.
                 *
                 * @return {ProtocolAddon<IN, OUT>} protocol addon.
                 */
                Protocol.prototype.then = function () {
                    return new CustomProtocolAddon(this, false);
                };
                /**
                 * Creates protocol modifier able to replace protocol actions with specified functions.
                 *
                 * @return {ProtocolMod<IN, OUT>} protocol modifier.
                 */
                Protocol.prototype.instead = function () {
                    return new CustomProtocolMod(this);
                };
                return Protocol;
            }());
            exports_1("Protocol", Protocol);
            CustomProtocolAddon = (function () {
                function CustomProtocolAddon(_protocol, _prior) {
                    this._protocol = _protocol;
                    this._prior = _prior;
                }
                CustomProtocolAddon.prototype.prepareRequest = function (prepare) {
                    var _this = this;
                    return new CustomProtocol(this._prior
                        ? function (options) { return _this._protocol.prepareRequest(prepare(options)); }
                        : function (options) { return prepare(_this._protocol.prepareRequest(options)); }, function (request, options) { return _this._protocol.writeRequest(request, options); }, function (response) { return _this._protocol.readResponse(response); }, function (error) { return _this._protocol.handleError(error); });
                };
                CustomProtocolAddon.prototype.updateRequest = function (update) {
                    var _this = this;
                    return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(options); }, this._prior
                        ? function (request, options) { return _this._protocol.writeRequest(request, update(request, options)); }
                        : function (request, options) { return update(request, _this._protocol.writeRequest(request, options)); }, function (response) { return _this._protocol.readResponse(response); }, function (error) { return _this._protocol.handleError(error); });
                };
                CustomProtocolAddon.prototype.handleError = function (handle) {
                    var _this = this;
                    return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(options); }, function (request, options) { return _this._protocol.writeRequest(request, options); }, function (response) { return _this._protocol.readResponse(response); }, this._prior
                        ? function (error) { return _this._protocol.handleError(handle(error)); }
                        : function (error) { return handle(_this._protocol.handleError(error)); });
                };
                CustomProtocolAddon.prototype.apply = function (protocol) {
                    var _this = this;
                    if (this._prior) {
                        return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(protocol.prepareRequest(options)); }, function (request, options) { return _this._protocol.writeRequest(request, options); }, function (response) { return _this._protocol.readResponse(response); }, function (error) { return _this._protocol.handleError(protocol.handleError(error)); });
                    }
                    return new CustomProtocol(function (options) { return protocol.prepareRequest(_this._protocol.prepareRequest(options)); }, function (request, options) { return _this._protocol.writeRequest(request, options); }, function (response) { return _this._protocol.readResponse(response); }, function (error) { return protocol.handleError(_this._protocol.handleError(error)); });
                };
                return CustomProtocolAddon;
            }());
            CustomProtocolMod = (function () {
                function CustomProtocolMod(_protocol) {
                    this._protocol = _protocol;
                }
                CustomProtocolMod.prototype.prepareRequest = function (prepare) {
                    var _this = this;
                    return new CustomProtocol(prepare, function (request, options) { return _this._protocol.writeRequest(request, options); }, function (response) { return _this._protocol.readResponse(response); }, this._protocol.handleError);
                };
                CustomProtocolMod.prototype.writeRequest = function (write) {
                    var _this = this;
                    return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(options); }, write, function (response) { return _this._protocol.readResponse(response); }, this._protocol.handleError);
                };
                CustomProtocolMod.prototype.readResponse = function (read) {
                    var _this = this;
                    return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(options); }, function (request, options) { return _this._protocol.writeRequest(request, options); }, read, this._protocol.handleError);
                };
                CustomProtocolMod.prototype.handleError = function (handle) {
                    var _this = this;
                    return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(options); }, function (request, options) { return _this._protocol.writeRequest(request, options); }, function (response) { return _this._protocol.readResponse(response); }, handle);
                };
                return CustomProtocolMod;
            }());
            CustomProtocol = (function (_super) {
                __extends(CustomProtocol, _super);
                function CustomProtocol(_prepareRequest, _writeRequest, _readResponse, _handleError) {
                    _super.call(this);
                    this._prepareRequest = _prepareRequest;
                    this._writeRequest = _writeRequest;
                    this._readResponse = _readResponse;
                    this._handleError = _handleError;
                }
                CustomProtocol.prototype.prepareRequest = function (options) {
                    return this._prepareRequest(options);
                };
                CustomProtocol.prototype.writeRequest = function (request, options) {
                    return this._writeRequest(request, options);
                };
                CustomProtocol.prototype.readResponse = function (response) {
                    return this._readResponse(response);
                };
                CustomProtocol.prototype.handleError = function (error) {
                    return this._handleError(error);
                };
                return CustomProtocol;
            }(Protocol));
            JsonProtocol = (function (_super) {
                __extends(JsonProtocol, _super);
                function JsonProtocol() {
                    _super.apply(this, arguments);
                }
                JsonProtocol.prototype.writeRequest = function (request, options) {
                    var opts = new http_1.RequestOptions(options).merge({ body: JSON.stringify(request) });
                    var headers;
                    if (opts.headers) {
                        headers = opts.headers;
                    }
                    else {
                        opts.headers = headers = new http_1.Headers();
                    }
                    headers.set("Content-Type", "application/json");
                    return opts;
                };
                JsonProtocol.prototype.readResponse = function (response) {
                    return response.json();
                };
                return JsonProtocol;
            }(Protocol));
            /**
             * JSON protocol.
             *
             * Sends and receives arbitrary data as JSON over HTTP.
             *
             * @type {Protocol<any>}
             */
            exports_1("JSON_PROTOCOL", JSON_PROTOCOL = new JsonProtocol());
            /**
             * Returns JSON protocol.
             *
             * Sends and receives the data of the given type as JSON over HTTP.
             */
            exports_1("jsonProtocol", jsonProtocol = function () { return JSON_PROTOCOL; });
            HttpProtocol = (function (_super) {
                __extends(HttpProtocol, _super);
                function HttpProtocol() {
                    _super.apply(this, arguments);
                }
                HttpProtocol.prototype.writeRequest = function (request, options) {
                    return new http_1.RequestOptions(options).merge({ body: request });
                };
                HttpProtocol.prototype.readResponse = function (response) {
                    return response;
                };
                return HttpProtocol;
            }(Protocol));
            /**
             * HTTP protocol.
             *
             * The request type is any. It is used as request body.
             *
             * @type {Protocol<any, Response>}
             */
            exports_1("HTTP_PROTOCOL", HTTP_PROTOCOL = new HttpProtocol());
        }
    }
});
System.register("ng2rike/event", [], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var RikeEventSource, RikeEvent, RikeOperationEvent, RikeSuccessEvent, RikeErrorEvent, RikeExceptionEvent, RikeErrorResponseEvent, RikeCancelEvent;
    return {
        setters:[],
        execute: function() {
            /**
             * REST-like resource access event emitter.
             *
             * Multiple instances of this class could be injected into controller or service to listen for Rike events.
             *
             * Use [provideEventSource] function to register event sources.
             */
            RikeEventSource = (function () {
                function RikeEventSource() {
                }
                return RikeEventSource;
            }());
            exports_2("RikeEventSource", RikeEventSource);
            /**
             * Basic REST-like resource access event.
             *
             * Such events are emitted by [Rike event sources][RikeEventsSource].
             */
            RikeEvent = (function () {
                function RikeEvent() {
                }
                Object.defineProperty(RikeEvent.prototype, "target", {
                    /**
                     * Operation target.
                     */
                    get: function () {
                        return this.operation.target;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeEvent.prototype, "cancel", {
                    /**
                     * Whether this is an operation cancel.
                     *
                     * @return {boolean} `true` if operation cancelled, or `false` otherwise.
                     */
                    get: function () {
                        return false;
                    },
                    enumerable: true,
                    configurable: true
                });
                return RikeEvent;
            }());
            exports_2("RikeEvent", RikeEvent);
            /**
             * An event emitted when operation on a REST-like resource is started.
             */
            RikeOperationEvent = (function (_super) {
                __extends(RikeOperationEvent, _super);
                function RikeOperationEvent(_operation) {
                    _super.call(this);
                    this._operation = _operation;
                }
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
                Object.defineProperty(RikeOperationEvent.prototype, "errorResponse", {
                    get: function () {
                        return undefined;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeOperationEvent.prototype, "cancelledBy", {
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
            exports_2("RikeOperationEvent", RikeOperationEvent);
            /**
             * An event emitted when operation on a REST-like resource is successfully completed.
             */
            RikeSuccessEvent = (function (_super) {
                __extends(RikeSuccessEvent, _super);
                function RikeSuccessEvent(_operation, _result) {
                    _super.call(this);
                    this._operation = _operation;
                    this._result = _result;
                }
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
                Object.defineProperty(RikeSuccessEvent.prototype, "errorResponse", {
                    get: function () {
                        return undefined;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeSuccessEvent.prototype, "cancelledBy", {
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
            exports_2("RikeSuccessEvent", RikeSuccessEvent);
            /**
             * An event emitted when operation on a REST-like resource is failed.
             *
             * An object of this type is also reported as an error when some internal exception occurs.
             */
            RikeErrorEvent = (function (_super) {
                __extends(RikeErrorEvent, _super);
                function RikeErrorEvent(_operation, _error) {
                    _super.call(this);
                    this._operation = _operation;
                    this._error = _error;
                }
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
                Object.defineProperty(RikeErrorEvent.prototype, "errorResponse", {
                    get: function () {
                        return undefined;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeErrorEvent.prototype, "cancelledBy", {
                    get: function () {
                        return undefined;
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
            exports_2("RikeErrorEvent", RikeErrorEvent);
            /**
             * An event emitted when operation on a REST-like resource caused an exception.
             *
             * An object of this type is reported as an error.
             */
            RikeExceptionEvent = (function (_super) {
                __extends(RikeExceptionEvent, _super);
                function RikeExceptionEvent(operation, error, _errorResponse) {
                    _super.call(this, operation, error);
                    this._errorResponse = _errorResponse;
                }
                Object.defineProperty(RikeExceptionEvent.prototype, "errorResponse", {
                    get: function () {
                        return this._errorResponse;
                    },
                    enumerable: true,
                    configurable: true
                });
                return RikeExceptionEvent;
            }(RikeErrorEvent));
            exports_2("RikeExceptionEvent", RikeExceptionEvent);
            /**
             * An event emitted when operation on a REST-like resource returned error.
             */
            RikeErrorResponseEvent = (function (_super) {
                __extends(RikeErrorResponseEvent, _super);
                function RikeErrorResponseEvent(operation, _errorResponse) {
                    _super.call(this, operation, _errorResponse.error || _errorResponse);
                    this._errorResponse = _errorResponse;
                }
                Object.defineProperty(RikeErrorResponseEvent.prototype, "errorResponse", {
                    get: function () {
                        return this._errorResponse;
                    },
                    enumerable: true,
                    configurable: true
                });
                return RikeErrorResponseEvent;
            }(RikeErrorEvent));
            exports_2("RikeErrorResponseEvent", RikeErrorResponseEvent);
            /**
             * An event emitted when operation on a REST-like resource is cancelled.
             */
            RikeCancelEvent = (function (_super) {
                __extends(RikeCancelEvent, _super);
                function RikeCancelEvent(operation, _cancelledBy) {
                    _super.call(this, operation, _cancelledBy || "cancel");
                    this._cancelledBy = _cancelledBy;
                }
                Object.defineProperty(RikeCancelEvent.prototype, "error", {
                    get: function () {
                        return this.cancelledBy;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeCancelEvent.prototype, "cancel", {
                    get: function () {
                        return true;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeCancelEvent.prototype, "cancelledBy", {
                    get: function () {
                        return this._cancelledBy;
                    },
                    enumerable: true,
                    configurable: true
                });
                return RikeCancelEvent;
            }(RikeErrorEvent));
            exports_2("RikeCancelEvent", RikeCancelEvent);
        }
    }
});
System.register("ng2rike/status-collector", ["@angular/core", "ng2rike/event"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var core_1, event_1;
    var DEFAULT_STATUS_LABELS, StatusCollector, StatusViewImpl;
    function labelOf(status, labels) {
        if (!labels) {
            return undefined;
        }
        var end = status.end;
        if (!end) {
            var processing = evalLabel(status, labels.processing);
            return processing && { label: processing, processing: true };
        }
        if (end.cancel) {
            var cancelled = evalLabel(status, labels.cancelled);
            return cancelled && { label: cancelled, cancelled: true };
        }
        if (end.error) {
            var failed = evalLabel(status, labels.failed);
            return failed && { label: failed, failed: true };
        }
        var succeed = evalLabel(status, labels.succeed);
        return succeed && { label: succeed, succeed: true };
    }
    function evalLabel(status, label) {
        if (!label) {
            return undefined;
        }
        if (typeof label !== "function") {
            return label;
        }
        var labelFn = label;
        return labelFn(status.start.target);
    }
    function combineLabels(combined, label) {
        if (!label) {
            return combined;
        }
        var lbl = label.label;
        if (!combined) {
            return {
                labels: [lbl],
                processing: label.processing,
                failed: label.failed,
                cancelled: label.cancelled,
                succeed: label.succeed,
            };
        }
        combined.processing = combined.processing || label.processing;
        combined.failed = combined.failed || label.failed;
        combined.cancelled = combined.cancelled || label.cancelled;
        combined.succeed = combined.succeed || label.succeed;
        for (var _i = 0, _a = combined.labels; _i < _a.length; _i++) {
            var l = _a[_i];
            if (l === lbl) {
                return combined;
            }
        }
        combined.labels.push(lbl);
        return combined;
    }
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (event_1_1) {
                event_1 = event_1_1;
            }],
        execute: function() {
            /**
             * Default map of Rike operations status labels.
             *
             * Default status labels are strings.
             */
            exports_3("DEFAULT_STATUS_LABELS", DEFAULT_STATUS_LABELS = {
                "*": {
                    processing: {
                        id: "processing",
                        message: "Processing"
                    },
                    failed: {
                        id: "failed",
                        message: "Error"
                    },
                    cancelled: {
                        id: "cancelled",
                        message: "Cancelled"
                    }
                },
                "load": {
                    processing: {
                        id: "loading",
                        message: "Loading",
                    },
                },
                "send": {
                    processing: {
                        id: "sending",
                        message: "Sending"
                    },
                    succeed: {
                        id: "sent",
                        message: "Sent"
                    },
                },
                "read": {
                    processing: {
                        id: "loading",
                        message: "Loading"
                    },
                },
                "create": {
                    processing: {
                        id: "creating",
                        message: "Creating"
                    },
                    succeed: {
                        id: "created",
                        message: "Created"
                    },
                },
                "update": {
                    processing: {
                        id: "updating",
                        message: "Updating"
                    },
                    succeed: {
                        id: "updated",
                        message: "Updated"
                    }
                },
                "delete": {
                    processing: {
                        id: "deleting",
                        message: "Deleting"
                    },
                    succeed: {
                        id: "deleted",
                        message: "Deleted"
                    },
                },
            });
            /**
             * Rike operations status collecting service.
             *
             * It collects statuses of all available [Rike event sources][RikeEventSource].
             *
             * This service is registered automatically along with every event source by `provideEventSource()` method.
             * But unlike event sources it is not a multi-provider.
             *
             * An instance of this class could be created on its own. Then it is necessary to subscribe it on Rike events with
             * `subscribeOn` method.
             *
             * It is possible to read statuses and string labels from the service itself. Alternatively a view can be created
             * to read labels of arbitrary type.
             */
            StatusCollector = (function () {
                function StatusCollector(eventSources) {
                    this._views = {};
                    this._targetStatuses = {};
                    this._viewIdSeq = 0;
                    if (eventSources) {
                        for (var _i = 0, eventSources_1 = eventSources; _i < eventSources_1.length; _i++) {
                            var esrc = eventSources_1[_i];
                            this.subscribeOn(esrc.rikeEvents);
                        }
                    }
                }
                Object.defineProperty(StatusCollector.prototype, "labels", {
                    /**
                     * Current status labels.
                     *
                     * @return {DefaultStatusLabel[]} array of default labels.
                     */
                    get: function () {
                        return this._defaultView ? this._defaultView.labels : [];
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StatusCollector.prototype, "processing", {
                    /**
                     * Whether some operation is in process.
                     */
                    get: function () {
                        return this._defaultView && this._defaultView.processing || false;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StatusCollector.prototype, "failed", {
                    /**
                     * Whether some operation failed.
                     */
                    get: function () {
                        return this._defaultView && this._defaultView.failed || false;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StatusCollector.prototype, "cancelled", {
                    /**
                     * Whether some operation cancelled.
                     */
                    get: function () {
                        return this._defaultView && this._defaultView.cancelled || false;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StatusCollector.prototype, "succeed", {
                    /**
                     * Whether some operation succeed.
                     */
                    get: function () {
                        return this._defaultView && this._defaultView.succeed || false;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Subscribes this collector on the given Rike events emitter.
                 *
                 * @param events Rike events emitter to subscribe on.
                 */
                StatusCollector.prototype.subscribeOn = function (events) {
                    var _this = this;
                    events.subscribe(function (event) { return _this.applyEvent(event); });
                };
                /**
                 * Constructs a Rike operations status view.
                 *
                 * When the view is no longer needed a {{StatusView.close}} method should be called to release resources
                 * associated with it.
                 *
                 * @param <L> a type of status labels.
                 * @param labels a map of Rike operations status labels to use by this view.
                 *
                 * @return {StatusView<L>} new status view.
                 */
                StatusCollector.prototype.view = function (labels) {
                    return this.addView("" + ++this._viewIdSeq, labels);
                };
                StatusCollector.prototype.addView = function (id, labels) {
                    var view = new StatusViewImpl(this._views, this._targetStatuses, id).withLabels(labels);
                    this._views[id] = view;
                    return view;
                };
                StatusCollector.prototype.applyEvent = function (event) {
                    this.initDefaultView(event);
                    this.updateTargetStatuses(event);
                    this.resetViews();
                };
                StatusCollector.prototype.initDefaultView = function (event) {
                    if (!this._defaultView) {
                        this._defaultView = this.addView("default", event.target.rike.options.defaultStatusLabels);
                    }
                };
                StatusCollector.prototype.updateTargetStatuses = function (event) {
                    var uniqueId = event.target.uniqueId;
                    if (!event.complete) {
                        this._targetStatuses[uniqueId] = {
                            start: event,
                        };
                    }
                    else {
                        var targetStatus = this._targetStatuses[uniqueId];
                        if (!targetStatus) {
                            this._targetStatuses[uniqueId] = { start: event, end: event };
                        }
                        else {
                            targetStatus.end = event;
                        }
                    }
                };
                StatusCollector.prototype.resetViews = function () {
                    for (var id in this._views) {
                        if (this._views.hasOwnProperty(id)) {
                            this._views[id].reset();
                        }
                    }
                };
                StatusCollector = __decorate([
                    core_1.Injectable(),
                    __param(0, core_1.Inject(event_1.RikeEventSource)),
                    __param(0, core_1.Optional()), 
                    __metadata('design:paramtypes', [Array])
                ], StatusCollector);
                return StatusCollector;
            }());
            exports_3("StatusCollector", StatusCollector);
            StatusViewImpl = (function () {
                function StatusViewImpl(_views, _targetStatuses, _id) {
                    this._views = _views;
                    this._targetStatuses = _targetStatuses;
                    this._id = _id;
                    this._labels = {};
                }
                Object.defineProperty(StatusViewImpl.prototype, "labels", {
                    get: function () {
                        return this.combined && this.combined.labels || [];
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StatusViewImpl.prototype, "processing", {
                    get: function () {
                        return this.combined && this.combined.processing || false;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StatusViewImpl.prototype, "failed", {
                    get: function () {
                        return this.combined && this.combined.failed || false;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StatusViewImpl.prototype, "cancelled", {
                    get: function () {
                        return this.combined && this.combined.cancelled || false;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StatusViewImpl.prototype, "succeed", {
                    get: function () {
                        return this.combined && this.combined.succeed || false;
                    },
                    enumerable: true,
                    configurable: true
                });
                StatusViewImpl.prototype.withLabels = function (labels) {
                    for (var operation in labels) {
                        if (labels.hasOwnProperty(operation)) {
                            this.withOperationLabels(operation, labels[operation]);
                        }
                    }
                    return this;
                };
                StatusViewImpl.prototype.withOperationLabels = function (operation, labels) {
                    this._combined = undefined;
                    this._labels[operation] = labels;
                    return this;
                };
                StatusViewImpl.prototype.reset = function () {
                    this._combined = undefined;
                };
                StatusViewImpl.prototype.close = function () {
                    delete this._views[this._id];
                };
                Object.defineProperty(StatusViewImpl.prototype, "combined", {
                    get: function () {
                        if (this._combined) {
                            return this._combined;
                        }
                        var combined = undefined;
                        for (var targetId in this._targetStatuses) {
                            if (this._targetStatuses.hasOwnProperty(targetId)) {
                                var targetStatus = this._targetStatuses[targetId];
                                if (!targetStatus) {
                                    continue;
                                }
                                combined = combineLabels(combined, this.labelFor(targetStatus));
                            }
                        }
                        return this._combined = combined;
                    },
                    enumerable: true,
                    configurable: true
                });
                StatusViewImpl.prototype.labelFor = function (status) {
                    return labelOf(status, this._labels[status.start.operation.name]) || labelOf(status, this._labels["*"]);
                };
                return StatusViewImpl;
            }());
        }
    }
});
System.register("ng2rike/options", ["ng2rike/protocol", "ng2rike/status-collector"], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var protocol_1, status_collector_1;
    var RikeOptions, BaseRikeOptions, DEFAULT_RIKE_OPTIONS;
    /**
     * Constructs URL relative to base URL.
     *
     * @param baseUrl base URL.
     * @param url URL.
     *
     * @returns {string} If `baseUrl` is not specified, or empty string, or `url` is absolute, then returns unmodified `url`.
     * Otherwise concatenates `baseUrl` and `url` separating them by `/` sign.
     */
    function relativeUrl(baseUrl, url) {
        if (!baseUrl) {
            return url;
        }
        if (url[0] === "/") {
            return url; // Absolute URL
        }
        if (url.match(/^(\w*:)?\/\//)) {
            return url; // Full URL
        }
        return baseUrl + "/" + url;
    }
    exports_4("relativeUrl", relativeUrl);
    return {
        setters:[
            function (protocol_1_1) {
                protocol_1 = protocol_1_1;
            },
            function (status_collector_1_1) {
                status_collector_1 = status_collector_1_1;
            }],
        execute: function() {
            /**
             * Global Rike options.
             *
             * To overwrite global options add a provider for {{BaseRikeOptions}} instance with {{RikeOptions}} as token:
             * ```ts
             * bootstrap(AppComponent, {provide: RikeOptions, new BaseRikeOptions({baseUrl: "/rike"})});
             * ```
             */
            RikeOptions = (function () {
                function RikeOptions() {
                }
                /**
                 * Constructs URL relative to `baseUrl`.
                 *
                 * @param url URL
                 *
                 * @returns {string} resolved URL.
                 */
                RikeOptions.prototype.relativeUrl = function (url) {
                    return relativeUrl(this.baseUrl, url);
                };
                return RikeOptions;
            }());
            exports_4("RikeOptions", RikeOptions);
            /**
             * Basic [global resource options][RikeOptions] implementation.
             *
             * Can be used to override the global resource options.
             */
            BaseRikeOptions = (function (_super) {
                __extends(BaseRikeOptions, _super);
                function BaseRikeOptions(opts) {
                    _super.call(this);
                    this._defaultProtocol = protocol_1.HTTP_PROTOCOL;
                    this._defaultStatusLabels = status_collector_1.DEFAULT_STATUS_LABELS;
                    if (opts) {
                        this._baseUrl = opts.baseUrl;
                        if (opts.defaultProtocol) {
                            this._defaultProtocol = opts.defaultProtocol;
                        }
                        if (opts.defaultStatusLabels) {
                            this._defaultStatusLabels = opts.defaultStatusLabels;
                        }
                    }
                }
                Object.defineProperty(BaseRikeOptions.prototype, "baseUrl", {
                    get: function () {
                        return this._baseUrl;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BaseRikeOptions.prototype, "defaultProtocol", {
                    get: function () {
                        return this._defaultProtocol;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BaseRikeOptions.prototype, "defaultStatusLabels", {
                    get: function () {
                        return this._defaultStatusLabels;
                    },
                    enumerable: true,
                    configurable: true
                });
                return BaseRikeOptions;
            }(RikeOptions));
            exports_4("BaseRikeOptions", BaseRikeOptions);
            /**
             * Default resource options.
             *
             * @type {RikeOptions}
             */
            exports_4("DEFAULT_RIKE_OPTIONS", DEFAULT_RIKE_OPTIONS = new BaseRikeOptions());
        }
    }
});
System.register("ng2rike/rike", ["@angular/core", "@angular/http", "rxjs/Rx", "ng2rike/event", "ng2rike/options", "ng2rike/protocol"], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var core_2, http_2, Rx_1, event_2, options_1, protocol_2;
    var REQUEST_METHODS, Rike, RikeTarget, RikeOperation, RikeTargetImpl, RikeOperationImpl;
    function requestMethod(method) {
        if (typeof method !== "string") {
            return method;
        }
        var result = REQUEST_METHODS[method.toUpperCase()];
        if (result != null) {
            return result;
        }
        throw new Error("Unsupported HTTP request method: " + method);
    }
    exports_5("requestMethod", requestMethod);
    function toErrorResponse(error) {
        if (error instanceof http_2.Response) {
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
            response: new http_2.Response(new http_2.ResponseOptions({
                type: http_2.ResponseType.Error,
                status: 500,
                statusText: statusText || "Unknown error"
            })),
            error: error,
        };
    }
    return {
        setters:[
            function (core_2_1) {
                core_2 = core_2_1;
            },
            function (http_2_1) {
                http_2 = http_2_1;
            },
            function (Rx_1_1) {
                Rx_1 = Rx_1_1;
            },
            function (event_2_1) {
                event_2 = event_2_1;
            },
            function (options_1_1) {
                options_1 = options_1_1;
            },
            function (protocol_2_1) {
                protocol_2 = protocol_2_1;
            }],
        execute: function() {
            REQUEST_METHODS = {
                "GET": http_2.RequestMethod.Get,
                "POST": http_2.RequestMethod.Post,
                "PUT": http_2.RequestMethod.Put,
                "DELETE": http_2.RequestMethod.Delete,
                "OPTIONS": http_2.RequestMethod.Options,
                "HEAD": http_2.RequestMethod.Head,
                "PATCH": http_2.RequestMethod.Patch,
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
                    this._rikeEvents = new core_2.EventEmitter();
                    this._uniqueIdSeq = 0;
                    this._options = _options || options_1.DEFAULT_RIKE_OPTIONS;
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
                        return this.options.defaultProtocol || protocol_2.HTTP_PROTOCOL;
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
                    return this.target(target, protocol_2.jsonProtocol());
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
                    return new Rx_1.Observable(function (responseObserver) {
                        response.subscribe(function (httpResponse) { return responseObserver.next(httpResponse); }, function (error) { return responseObserver.error(_this.defaultProtocol.handleError(toErrorResponse(error))); }, function () { return responseObserver.complete(); });
                    });
                };
                Rike = __decorate([
                    core_2.Injectable(),
                    __param(2, core_2.Optional()), 
                    __metadata('design:paramtypes', [http_2.Http, http_2.RequestOptions, options_1.RikeOptions])
                ], Rike);
                return Rike;
            }());
            exports_5("Rike", Rike);
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
            RikeTarget = (function () {
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
                    return this.operation(name, protocol_2.jsonProtocol());
                };
                return RikeTarget;
            }());
            exports_5("RikeTarget", RikeTarget);
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
            RikeOperation = (function () {
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
            exports_5("RikeOperation", RikeOperation);
            RikeTargetImpl = (function (_super) {
                __extends(RikeTargetImpl, _super);
                function RikeTargetImpl(_rike, _internals, _target, _protocol) {
                    _super.call(this);
                    this._rike = _rike;
                    this._internals = _internals;
                    this._target = _target;
                    this._protocol = _protocol;
                    this._rikeEvents = new core_2.EventEmitter();
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
                                var cancel = new event_2.RikeCancelEvent(this._operation.operation, cause);
                                this._observer.error(cancel);
                                this._rikeEvents.error(cancel);
                            }
                            catch (e) {
                                this._rikeEvents.error(new event_2.RikeExceptionEvent(this._operation.operation, e));
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
                    var event = new event_2.RikeOperationEvent(operation);
                    this._cancel(event);
                    this._rikeEvents.emit(event);
                    this._operation = event;
                };
                RikeTargetImpl.prototype.wrapResponse = function (operation, response) {
                    var _this = this;
                    this._response = response;
                    return new Rx_1.Observable(function (responseObserver) {
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
                                _this._rikeEvents.emit(new event_2.RikeSuccessEvent(operation, response_1));
                            }
                            catch (e) {
                                _this._rikeEvents.error(new event_2.RikeExceptionEvent(operation, e, {
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
                                _this._rikeEvents.emit(new event_2.RikeErrorResponseEvent(operation, errorResponse));
                            }
                            catch (e) {
                                errorResponse.error = e;
                                _this._rikeEvents.error(new event_2.RikeExceptionEvent(operation, e, errorResponse));
                            }
                            finally {
                                cleanup();
                            }
                        }, function () {
                            try {
                                responseObserver.complete();
                            }
                            catch (e) {
                                _this._rikeEvents.error(new event_2.RikeExceptionEvent(operation, e));
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
            RikeOperationImpl = (function (_super) {
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
                        this.target.rikeEvents.error(new event_2.RikeExceptionEvent(this, e));
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
                        this.target.rikeEvents.error(new event_2.RikeExceptionEvent(this, e));
                        throw e;
                    }
                };
                RikeOperationImpl.prototype.get = function (url, options) {
                    try {
                        this.startOperation();
                        options = this.requestOptions(http_2.RequestMethod.Get, url, options);
                        return this.wrapResponse(this.internals.get(this.requestUrl(options), options));
                    }
                    catch (e) {
                        this.target.rikeEvents.error(new event_2.RikeExceptionEvent(this, e));
                        throw e;
                    }
                };
                RikeOperationImpl.prototype.post = function (request, url, options) {
                    try {
                        this.startOperation();
                        options = this.writeRequest(request, this.requestOptions(http_2.RequestMethod.Post, url, options));
                        return this.wrapResponse(this.internals.post(this.requestUrl(options), options.body, options));
                    }
                    catch (e) {
                        this.target.rikeEvents.error(new event_2.RikeExceptionEvent(this, e));
                        throw e;
                    }
                };
                RikeOperationImpl.prototype.put = function (request, url, options) {
                    try {
                        this.startOperation();
                        options = this.writeRequest(request, this.requestOptions(http_2.RequestMethod.Put, url, options));
                        return this.wrapResponse(this.internals.put(this.requestUrl(options), options.body, options));
                    }
                    catch (e) {
                        this.target.rikeEvents.error(new event_2.RikeExceptionEvent(this, e));
                        throw e;
                    }
                };
                //noinspection ReservedWordAsName
                RikeOperationImpl.prototype.delete = function (url, options) {
                    try {
                        this.startOperation();
                        options = this.requestOptions(http_2.RequestMethod.Delete, url, options);
                        return this.wrapResponse(this.internals.delete(this.requestUrl(options), options));
                    }
                    catch (e) {
                        this.target.rikeEvents.error(new event_2.RikeExceptionEvent(this, e));
                        throw e;
                    }
                };
                RikeOperationImpl.prototype.patch = function (request, url, options) {
                    try {
                        this.startOperation();
                        options = this.writeRequest(request, this.requestOptions(http_2.RequestMethod.Patch, url, options));
                        return this.wrapResponse(this.internals.patch(this.requestUrl(options), options.body, options));
                    }
                    catch (e) {
                        this.target.rikeEvents.error(new event_2.RikeExceptionEvent(this, e));
                        throw e;
                    }
                };
                RikeOperationImpl.prototype.head = function (url, options) {
                    try {
                        this.startOperation();
                        options = this.requestOptions(http_2.RequestMethod.Head, url, options);
                        return this.wrapResponse(this.internals.head(this.requestUrl(options), options));
                    }
                    catch (e) {
                        this.target.rikeEvents.error(new event_2.RikeExceptionEvent(this, e));
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
                        options = new http_2.RequestOptions(options).merge({ url: url, method: method });
                    }
                    options = this.options.merge(options);
                    if (options.url == null) {
                        options.url = this.target.baseUrl;
                    }
                    else {
                        options.url = options_1.relativeUrl(this.target.baseUrl, options.url);
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
        }
    }
});
System.register("ng2rike/status.component", ["@angular/core", "ng2rike/status-collector"], function(exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var core_3, status_collector_2;
    var RikeStatusComponent;
    function defaultLabelText(label) {
        if (typeof label === "string") {
            return label;
        }
        var defaultLabel = label;
        if (defaultLabel.message) {
            return defaultLabel.message;
        }
        return label.toString();
    }
    function defaultStatusClass(status) {
        var labels = status.labels;
        if (!labels.length) {
            return "rike-status rike-status-hidden";
        }
        var result = processingTypeClass(status);
        for (var _i = 0, labels_1 = labels; _i < labels_1.length; _i++) {
            var label = labels_1[_i];
            var defaultLabel = label;
            var cssClass = defaultLabel.cssClass;
            if (cssClass) {
                result += " " + cssClass;
                continue;
            }
            var id = defaultLabel.id;
            if (id) {
                result += " rike-status-" + id;
            }
        }
        return result;
    }
    function processingTypeClass(status) {
        if (this.statusView.processing) {
            return "rike-status rike-status-processing";
        }
        if (this.statusView.cancelled) {
            return "rike-status rike-status-cancelled";
        }
        if (this.statusView.failed) {
            return "rike-status rike-status-failed";
        }
        if (this.statusView.succeed) {
            return "rike-status rike-status-succeed";
        }
        return "rike-status rike-status-hidden";
    }
    return {
        setters:[
            function (core_3_1) {
                core_3 = core_3_1;
            },
            function (status_collector_2_1) {
                status_collector_2 = status_collector_2_1;
            }],
        execute: function() {
            RikeStatusComponent = (function () {
                function RikeStatusComponent(_collector) {
                    this._collector = _collector;
                    this._ownStatusView = false;
                    this._labelText = defaultLabelText;
                    this._labelClass = defaultStatusClass;
                }
                Object.defineProperty(RikeStatusComponent.prototype, "collector", {
                    get: function () {
                        return this._collector;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeStatusComponent.prototype, "statusView", {
                    get: function () {
                        if (this._statusView) {
                            return this._statusView;
                        }
                        this._statusView = this.createStatusView();
                        this._ownStatusView = true;
                        return this._statusView;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeStatusComponent.prototype, "rikeStatus", {
                    get: function () {
                        return this._statusView;
                    },
                    set: function (status) {
                        if (status === this._statusView) {
                            return;
                        }
                        this.releaseStatusView();
                        this._statusView = status;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeStatusComponent.prototype, "rikeStatusLabels", {
                    get: function () {
                        return this._statusLabels;
                    },
                    set: function (labels) {
                        this._statusView = undefined;
                        this._statusLabels = labels;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeStatusComponent.prototype, "rikeStatusLabelText", {
                    get: function () {
                        return this._labelText;
                    },
                    set: function (value) {
                        this._labelText = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeStatusComponent.prototype, "rikeStatusLabelClass", {
                    get: function () {
                        return this._labelClass;
                    },
                    set: function (value) {
                        this._labelClass = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeStatusComponent.prototype, "cssClass", {
                    get: function () {
                        return this._labelClass(this.statusView);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeStatusComponent.prototype, "text", {
                    get: function () {
                        var labels = this.statusView.labels;
                        if (!labels.length) {
                            return undefined;
                        }
                        var text = "";
                        for (var _i = 0, labels_2 = labels; _i < labels_2.length; _i++) {
                            var label = labels_2[_i];
                            var t = this.rikeStatusLabelText(label);
                            if (text) {
                                text += ", ";
                            }
                            text += t;
                        }
                        if (this.statusView.processing) {
                            text += "...";
                        }
                        return text;
                    },
                    enumerable: true,
                    configurable: true
                });
                RikeStatusComponent.prototype.ngOnDestroy = function () {
                    this.releaseStatusView();
                };
                RikeStatusComponent.prototype.createStatusView = function () {
                    var labels = this.rikeStatusLabels
                        || status_collector_2.DEFAULT_STATUS_LABELS;
                    return this.collector.view(labels);
                };
                RikeStatusComponent.prototype.releaseStatusView = function () {
                    var statusView = this._statusView;
                    if (statusView) {
                        this._statusView = undefined;
                        if (this._ownStatusView) {
                            statusView.close();
                        }
                    }
                };
                __decorate([
                    core_3.Input(), 
                    __metadata('design:type', Object)
                ], RikeStatusComponent.prototype, "rikeStatus", null);
                __decorate([
                    core_3.Input(), 
                    __metadata('design:type', Object)
                ], RikeStatusComponent.prototype, "rikeStatusLabels", null);
                __decorate([
                    core_3.Input(), 
                    __metadata('design:type', Function)
                ], RikeStatusComponent.prototype, "rikeStatusLabelText", null);
                __decorate([
                    core_3.Input(), 
                    __metadata('design:type', Function)
                ], RikeStatusComponent.prototype, "rikeStatusLabelClass", null);
                RikeStatusComponent = __decorate([
                    core_3.Component({
                        selector: '[rikeStatus],[rikeStatusLabels],[rikeStatusLabelText],[rikeStatusLabelClass]',
                        template: "<span class=\"rike-status-icon\"></span> {{text}}",
                        host: {
                            "[class]": "cssClass",
                        }
                    }), 
                    __metadata('design:paramtypes', [status_collector_2.StatusCollector])
                ], RikeStatusComponent);
                return RikeStatusComponent;
            }());
            exports_6("RikeStatusComponent", RikeStatusComponent);
        }
    }
});
System.register("ng2rike/field-error", ["ng2rike/protocol"], function(exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    var protocol_3;
    var _Protocol_import;
    /**
     * Appends field errors to {{ErrorResponse}}.
     *
     * If field errors already present in `ErrorResponse` then does nothing.
     *
     * This function can be used as {{Protocol}} error handler error handler.
     *
     * @param error object to convert.
     *
     * @return {FieldErrorResponse} constructed error httpResponse.
     */
    function addFieldErrors(error) {
        var response = error;
        if (response.fieldErrors) {
            // Field errors already present.
            return response;
        }
        var httpResponse = error.response;
        var body = undefined;
        // Attempt to parse JSON body
        if (httpResponse.headers.get("Content-Type") === "application/json") {
            try {
                body = httpResponse.json();
            }
            catch (e) {
                console.error("Failed to parse JSON error response", e);
            }
        }
        var fieldErrors = toFieldErrors(body);
        if (fieldErrors) {
            response.fieldErrors = fieldErrors;
            return response;
        }
        return defaultFieldErrors(response);
    }
    exports_7("addFieldErrors", addFieldErrors);
    function defaultFieldErrors(response) {
        var httpResponse = response.response;
        var message = "ERROR " + httpResponse.status;
        if (httpResponse.statusText && httpResponse.statusText.toLowerCase() != "ok") {
            message += ": " + httpResponse.statusText;
        }
        response.fieldErrors = { "*": [{ code: "HTTP" + httpResponse.status, message: message }] };
        return response;
    }
    function toFieldErrors(data) {
        if (data == null) {
            return;
        }
        if (Array.isArray(data)) {
            var fieldErrors = data.map(toFieldError).filter(notEmptyError);
            return fieldErrors.length ? { "*": fieldErrors } : undefined;
        }
        if (typeof data !== "object") {
            var fieldErrors = [{ message: data.toString() }].filter(notEmptyError);
            return fieldErrors.length ? { "*": fieldErrors } : undefined;
        }
        var errors = data;
        var result = {};
        var hasErrors = false;
        for (var field in errors) {
            if (errors.hasOwnProperty(field)) {
                var errorArray = toFieldErrorArray(errors[field]);
                if (errorArray.length) {
                    result[field] = errorArray;
                    hasErrors = true;
                }
            }
        }
        return hasErrors ? result : undefined;
    }
    function toFieldErrorArray(data) {
        if (data == null) {
            return [];
        }
        if (Array.isArray(data)) {
            return data.map(toFieldError).filter(notEmptyError);
        }
        return [toFieldError(data)].filter(notEmptyError);
    }
    function toFieldError(data) {
        if (data == null) {
            return { message: "" };
        }
        var fieldError = data;
        if (typeof fieldError.message === "string" && (fieldError.code == null || fieldError.code === "string")) {
            return fieldError;
        }
        if (fieldError.message != null) {
            return {
                code: fieldError.code != null ? fieldError.code.toString() : undefined,
                message: fieldError.message.toString(),
            };
        }
        return { message: fieldError.toString() };
    }
    function notEmptyError(item) {
        return !!item && (!!item.message || !!item.code);
    }
    return {
        setters:[
            function (protocol_3_1) {
                protocol_3 = protocol_3_1;
            }],
        execute: function() {
            //noinspection JSUnusedLocalSymbols
            _Protocol_import = protocol_3.Protocol;
        }
    }
});
System.register("ng2rike/error-collector", ["@angular/core", "ng2rike/field-error", "ng2rike/event"], function(exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    var core_4, field_error_1, event_3;
    var ErrorCollector, FieldEmitter, ErrorSubscr, TargetErrors;
    function appendErrorsTo(field, fieldErrors, errors) {
        if (!errors || !errors.length) {
            return;
        }
        var errs = fieldErrors[field];
        if (errs) {
            errs.push.apply(errs, errors);
        }
        else {
            fieldErrors[field] = errors;
        }
    }
    return {
        setters:[
            function (core_4_1) {
                core_4 = core_4_1;
            },
            function (field_error_1_1) {
                field_error_1 = field_error_1_1;
            },
            function (event_3_1) {
                event_3 = event_3_1;
            }],
        execute: function() {
            /**
             * An error collecting service.
             *
             * It collects errors from all available [Rike event sources][RikeEventSource]. It uses `fieldErrors()` method
             * to obtain a `FieldErrors` instance from {{RikeErrorEvent}}. Then it notifies all subscribers on when errors received
             * or removed.
             *
             * This service is registered automatically along with every event source by `provideEventSource()` function.
             * But unlike event sources it is not a multi-provider.
             *
             * An instance of this class could be created on its own. Then it is necessary to subscribe it on Rike events with
             * `subscribeOn` method.
             */
            ErrorCollector = (function () {
                function ErrorCollector(_eventSources) {
                    this._eventSources = _eventSources;
                    this._emitters = {};
                    this._targetErrors = {};
                    this._initialized = false;
                }
                /**
                 * Subscribes this collector on the given Rike events emitter.
                 *
                 * @param events Rike events emitter to subscribe on.
                 */
                ErrorCollector.prototype.subscribeOn = function (events) {
                    var _this = this;
                    return events.subscribe(function (event) { return _this.handleEvent(event); }, function (error) { return _this.handleError(error); });
                };
                /**
                 * Adds subscription for errors corresponding to the given field.
                 *
                 * If the field name is `"*"`, then subscriber will be notified on error changes for all fields except those ones
                 * with existing subscriptions.
                 *
                 * @param field target field name.
                 * @param next function that will be called on every target field errors update.
                 * @param error function that will be called on errors.
                 * @param complete function that will be called when no more errors will be reported.
                 *
                 * @return {ErrorSubscription} subscription.
                 */
                ErrorCollector.prototype.subscribe = function (field, next, error, complete) {
                    this.init();
                    return this.fieldEmitter(field).subscribe(next, error, complete);
                };
                /**
                 * Adds subscription for errors corresponding to all fields except those ones with existing subscriptions.
                 *
                 * Calling this method is the same as calling `subscribe("*", next, error, complete);`.
                 *
                 * @param next function that will be called on every errors update.
                 * @param error function that will be called on errors.
                 * @param complete function that will be called when no more errors will be reported.
                 *
                 * @return {ErrorSubscription} subscription.
                 */
                ErrorCollector.prototype.subscribeForRest = function (next, error, complete) {
                    return this.subscribe("*", next, error, complete);
                };
                //noinspection JSMethodCanBeStatic
                /**
                 * Converts error to `FieldErrors`.
                 *
                 * This method uses `addFieldErrors` function by default. Override it if you are using custom error handler.
                 *
                 * @param error arbitrary error passed in [RikeEvent.error] field.
                 *
                 * @return {FieldErrors} field errors.
                 */
                ErrorCollector.prototype.fieldErrors = function (error) {
                    var errorResponse = error.errorResponse;
                    if (errorResponse) {
                        return field_error_1.addFieldErrors(errorResponse).fieldErrors;
                    }
                    return {
                        "*": [
                            { message: error.error.toString() }
                        ]
                    };
                };
                ErrorCollector.prototype.fieldEmitter = function (field) {
                    return this._emitters[field] || (this._emitters[field] = new FieldEmitter(field, this._emitters, this._targetErrors));
                };
                ErrorCollector.prototype.init = function () {
                    if (this._initialized) {
                        return;
                    }
                    this._initialized = true;
                    if (this._eventSources) {
                        for (var _i = 0, _a = this._eventSources; _i < _a.length; _i++) {
                            var src = _a[_i];
                            this.subscribeOn(src.rikeEvents);
                        }
                    }
                };
                ErrorCollector.prototype.handleEvent = function (event) {
                    var affectedFields;
                    if (!event.error) {
                        affectedFields = this.clearTargetErrors(event.target);
                    }
                    else {
                        affectedFields = this.targetErrors(event.target)
                            .addAll(this.fieldErrors(event));
                    }
                    for (var field in affectedFields) {
                        if (affectedFields.hasOwnProperty(field)) {
                            this.notify(field);
                        }
                    }
                };
                ErrorCollector.prototype.handleError = function (error) {
                    this.targetErrors(error.target).add("*", { message: error.error.toString() });
                    this.notify("*");
                };
                ErrorCollector.prototype.targetErrors = function (target) {
                    var id = target.uniqueId;
                    return this._targetErrors[id] || (this._targetErrors[id] = new TargetErrors(target, this._emitters));
                };
                ErrorCollector.prototype.clearTargetErrors = function (target) {
                    var id = target.uniqueId;
                    var targetErrors = this._targetErrors[id];
                    if (!targetErrors) {
                        return [];
                    }
                    delete this._targetErrors[id];
                    return targetErrors.fieldsWithErrors;
                };
                ErrorCollector.prototype.notify = function (field) {
                    var emitter = this._emitters[field];
                    if (emitter) {
                        emitter.notify();
                    }
                };
                ErrorCollector = __decorate([
                    core_4.Injectable(),
                    __param(0, core_4.Inject(event_3.RikeEventSource)),
                    __param(0, core_4.Optional()), 
                    __metadata('design:paramtypes', [Array])
                ], ErrorCollector);
                return ErrorCollector;
            }());
            exports_8("ErrorCollector", ErrorCollector);
            FieldEmitter = (function () {
                function FieldEmitter(_field, _emitters, _targetErrors) {
                    this._field = _field;
                    this._emitters = _emitters;
                    this._targetErrors = _targetErrors;
                    this._emitter = new core_4.EventEmitter();
                    this._counter = 0;
                }
                FieldEmitter.prototype.subscribe = function (next, error, complete) {
                    var subscr = this._emitter.subscribe(next, error, complete);
                    this._counter++;
                    return new ErrorSubscr(this, subscr).subscribe(next, error, complete);
                };
                FieldEmitter.prototype.notify = function (emitter) {
                    var errors = {};
                    for (var id in this._targetErrors) {
                        if (this._targetErrors.hasOwnProperty(id)) {
                            this._targetErrors[id].appendTo(this._field, errors);
                        }
                    }
                    (emitter || this._emitter).emit(errors);
                };
                FieldEmitter.prototype.unsubscribed = function () {
                    if (!--this._counter) {
                        delete this._emitters[this._field];
                    }
                };
                return FieldEmitter;
            }());
            ErrorSubscr = (function () {
                function ErrorSubscr(_fieldEmitter, _subscription) {
                    this._fieldEmitter = _fieldEmitter;
                    this._subscription = _subscription;
                    this._refreshEmitter = new core_4.EventEmitter();
                }
                ErrorSubscr.prototype.subscribe = function (next, error, complete) {
                    this._refreshSubscription = this._refreshEmitter.subscribe(next, error, complete);
                    return this;
                };
                ErrorSubscr.prototype.unsubscribe = function () {
                    if (!this._subscription) {
                        return;
                    }
                    try {
                        this._subscription.unsubscribe();
                        this._refreshSubscription.unsubscribe();
                    }
                    finally {
                        delete this._subscription;
                        this._fieldEmitter.unsubscribed();
                    }
                };
                ErrorSubscr.prototype.refresh = function () {
                    if (!this._subscription) {
                        return this;
                    }
                    this._fieldEmitter.notify(this._refreshEmitter);
                    return this;
                };
                return ErrorSubscr;
            }());
            TargetErrors = (function () {
                function TargetErrors(target, _emitters, errors) {
                    this.target = target;
                    this._emitters = _emitters;
                    this._errors = errors || {};
                }
                Object.defineProperty(TargetErrors.prototype, "fieldsWithErrors", {
                    get: function () {
                        return this._errors;
                    },
                    enumerable: true,
                    configurable: true
                });
                TargetErrors.prototype.add = function (field) {
                    var errors = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        errors[_i - 1] = arguments[_i];
                    }
                    var existing = this._errors[field];
                    if (!existing) {
                        this._errors[field] = existing;
                    }
                    else {
                        (_a = this._errors[field]).push.apply(_a, errors);
                    }
                    var _a;
                };
                TargetErrors.prototype.addAll = function (errors) {
                    for (var field in errors) {
                        if (errors.hasOwnProperty(field)) {
                            this.add.apply(this, [field].concat(errors[field]));
                        }
                    }
                    return errors;
                };
                TargetErrors.prototype.appendTo = function (field, out) {
                    if (field !== "*") {
                        // Append errors for the given field.
                        appendErrorsTo(field, out, this._errors[field]);
                        return;
                    }
                    // Append errors for all fields except the ones with subscribers.
                    for (var f in this._errors) {
                        if (this._errors.hasOwnProperty(f) && !this._emitters[f]) {
                            appendErrorsTo(f, out, this._errors[f]);
                        }
                    }
                };
                return TargetErrors;
            }());
        }
    }
});
System.register("ng2rike/errors.component", ["@angular/core", "ng2rike/error-collector"], function(exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    var core_5, error_collector_1;
    var RikeErrorsComponent;
    return {
        setters:[
            function (core_5_1) {
                core_5 = core_5_1;
            },
            function (error_collector_1_1) {
                error_collector_1 = error_collector_1_1;
            }],
        execute: function() {
            RikeErrorsComponent = (function () {
                function RikeErrorsComponent(_collector) {
                    this._collector = _collector;
                    this._rikeErrorsField = "*";
                    this._errors = [];
                    this._init = false;
                }
                Object.defineProperty(RikeErrorsComponent.prototype, "rikeErrorsField", {
                    get: function () {
                        return this._rikeErrorsField;
                    },
                    set: function (field) {
                        if (this._rikeErrorsField === field) {
                            return;
                        }
                        this._rikeErrorsField = field;
                        if (this._init) {
                            this.unsubscribe();
                            this.subscribe();
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeErrorsComponent.prototype, "rikeErrors", {
                    get: function () {
                        return this._collector || (this._collector = this.createCollector());
                    },
                    set: function (collector) {
                        this._collector = collector;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeErrorsComponent.prototype, "errors", {
                    get: function () {
                        return this._errors;
                    },
                    enumerable: true,
                    configurable: true
                });
                RikeErrorsComponent.prototype.ngOnInit = function () {
                    this._init = true;
                    this.subscribe();
                };
                RikeErrorsComponent.prototype.ngOnDestroy = function () {
                    this._init = false;
                    this.unsubscribe();
                };
                //noinspection JSMethodCanBeStatic
                RikeErrorsComponent.prototype.createCollector = function () {
                    return new error_collector_1.ErrorCollector();
                };
                RikeErrorsComponent.prototype.updateErrors = function (errors) {
                    var list = [];
                    for (var field in errors) {
                        if (errors.hasOwnProperty(field)) {
                            list.push.apply(list, errors[field]);
                        }
                    }
                    this._errors = list;
                };
                RikeErrorsComponent.prototype.subscribe = function () {
                    var _this = this;
                    if (this.rikeErrorsField) {
                        this._subscription =
                            this.rikeErrors.subscribe(this.rikeErrorsField, function (errors) { return _this.updateErrors(errors); }).refresh();
                    }
                };
                RikeErrorsComponent.prototype.unsubscribe = function () {
                    this._errors = [];
                    var subscription = this._subscription;
                    if (subscription) {
                        delete this._subscription;
                        subscription.unsubscribe();
                    }
                };
                __decorate([
                    core_5.Input(), 
                    __metadata('design:type', String)
                ], RikeErrorsComponent.prototype, "rikeErrorsField", null);
                __decorate([
                    core_5.Input(), 
                    __metadata('design:type', error_collector_1.ErrorCollector)
                ], RikeErrorsComponent.prototype, "rikeErrors", null);
                RikeErrorsComponent = __decorate([
                    core_5.Component({
                        selector: '[rikeErrors],[rikeErrorsField]',
                        template: "\n    <ul class=\"rike-error-list\" *ngIf=\"errors.length\">\n        <li class=\"rike-error\" *ngFor=\"let error of errors\">{{error.message}}</li>\n    </ul>\n    ",
                        host: {
                            "[class.rike-errors]": "true"
                        }
                    }),
                    __param(0, core_5.Optional()), 
                    __metadata('design:paramtypes', [error_collector_1.ErrorCollector])
                ], RikeErrorsComponent);
                return RikeErrorsComponent;
            }());
            exports_9("RikeErrorsComponent", RikeErrorsComponent);
        }
    }
});
System.register("ng2rike/event-source-provider", ["ng2rike/event", "ng2rike/status-collector", "ng2rike/error-collector"], function(exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    var event_4, status_collector_3, error_collector_2;
    /**
     * Constructs provider recipe for {{RikeEventSource}}.
     *
     * @param useClass
     * @param useValue
     * @param useExisting
     * @param useFactory
     * @param deps
     *
     * @return new provider recipe.
     */
    function provideEventSource(_a) {
        var useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps;
        return [
            status_collector_3.StatusCollector,
            error_collector_2.ErrorCollector,
            {
                provide: event_4.RikeEventSource,
                multi: true,
                useClass: useClass,
                useValue: useValue,
                useExisting: useExisting,
                useFactory: useFactory,
                deps: deps,
            },
        ];
    }
    exports_10("provideEventSource", provideEventSource);
    return {
        setters:[
            function (event_4_1) {
                event_4 = event_4_1;
            },
            function (status_collector_3_1) {
                status_collector_3 = status_collector_3_1;
            },
            function (error_collector_2_1) {
                error_collector_2 = error_collector_2_1;
            }],
        execute: function() {
            ;
        }
    }
});
System.register("ng2rike/resource", ["@angular/http", "rxjs/Rx", "ng2rike/protocol", "ng2rike/options"], function(exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    var http_3, Rx_2, protocol_4, options_2;
    var Resource, RikeResource, LoadableResource, CRUDResource;
    return {
        setters:[
            function (http_3_1) {
                http_3 = http_3_1;
            },
            function (Rx_2_1) {
                Rx_2 = Rx_2_1;
            },
            function (protocol_4_1) {
                protocol_4 = protocol_4_1;
            },
            function (options_2_1) {
                options_2 = options_2_1;
            }],
        execute: function() {
            /**
             * An interface of REST-like resources.
             *
             * An operations target is created per resource with a resource instance as target value. All operations on this
             * resource should be performed using this target.
             *
             * This class can be used as a token for resources. It can be registered as Angular service with {{provideResource}}.
             */
            Resource = (function () {
                function Resource() {
                }
                return Resource;
            }());
            exports_11("Resource", Resource);
            /**
             * Abstract implementation of REST-like resource.
             */
            RikeResource = (function () {
                function RikeResource(_rike) {
                    this._rike = _rike;
                }
                Object.defineProperty(RikeResource.prototype, "rike", {
                    /**
                     * Rike interface instance.
                     */
                    get: function () {
                        return this._rike;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RikeResource.prototype, "rikeTarget", {
                    /**
                     * Rike operations target for this resource.
                     *
                     * @return {RikeTarget<any, any>} the result of `this.getRikeTarget()` call.
                     */
                    get: function () {
                        return this.getRikeTarget();
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Rike operations target for this resource.
                 *
                 * Creates Rike target when needed by calling `createRikeTarget()` method.
                 *
                 * @return {RikeTarget<any, any>}
                 */
                RikeResource.prototype.getRikeTarget = function () {
                    return this._rikeTarget || (this._rikeTarget = this.createRikeTarget());
                };
                /**
                 * Creates Rike operation target for this resource.
                 *
                 * This method is called by `getRikeTarget()` method on demand.
                 *
                 * @return {RikeTarget<any, any>} new Rike target.
                 */
                RikeResource.prototype.createRikeTarget = function () {
                    return this.rike.target(this, protocol_4.JSON_PROTOCOL);
                };
                return RikeResource;
            }());
            exports_11("RikeResource", RikeResource);
            /**
             * Loadable resource.
             *
             * It is able to load arbitrary data from the server. By default expects a JSON data. Override `createRikeTarget()`
             * method to change it. When loaded the data will be cached. Call `reload()` method to reload it.
             *
             * @param <T> loaded data type.
             */
            LoadableResource = (function (_super) {
                __extends(LoadableResource, _super);
                function LoadableResource(rike) {
                    _super.call(this, rike);
                }
                Object.defineProperty(LoadableResource.prototype, "rikeTarget", {
                    get: function () {
                        return this.getRikeTarget();
                    },
                    enumerable: true,
                    configurable: true
                });
                LoadableResource.prototype.getRikeTarget = function () {
                    return _super.prototype.getRikeTarget.call(this);
                };
                Object.defineProperty(LoadableResource.prototype, "data", {
                    /**
                     * Loaded data.
                     *
                     * @return {T} `undefined` if data is not loaded yet.
                     */
                    get: function () {
                        return this._data;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Loads data from server if not loaded yet.
                 *
                 * @return {Observable<T>}
                 */
                LoadableResource.prototype.load = function () {
                    var _this = this;
                    var data = this.data;
                    if (data) {
                        return Rx_2.Observable.of(data);
                    }
                    return new Rx_2.Observable(function (observer) {
                        _this.rikeTarget
                            .operation("load")
                            .get()
                            .subscribe(function (data) {
                            _this._data = data;
                            observer.next(data);
                        }, function (error) { return observer.error(error); }, function () { return observer.complete(); });
                    });
                };
                /**
                 * Reloads data from server.
                 */
                LoadableResource.prototype.reload = function () {
                    this.reset();
                    return this.load();
                };
                /**
                 * Resets the resource by cleaning cached data.
                 */
                LoadableResource.prototype.reset = function () {
                    this._data = undefined;
                };
                LoadableResource.prototype.createRikeTarget = function () {
                    return this.rike.target(this, protocol_4.jsonProtocol());
                };
                return LoadableResource;
            }(RikeResource));
            exports_11("LoadableResource", LoadableResource);
            /**
             * CRUD (Create, Load, Update, Delete) resource.
             *
             * It is able to manipulate with server objects. By default it operates over JSON protocol.
             * Override `createRikeTarget()` method to change it.
             */
            CRUDResource = (function (_super) {
                __extends(CRUDResource, _super);
                function CRUDResource(rike) {
                    _super.call(this, rike);
                }
                Object.defineProperty(CRUDResource.prototype, "rikeTarget", {
                    get: function () {
                        return this.getRikeTarget();
                    },
                    enumerable: true,
                    configurable: true
                });
                CRUDResource.prototype.getRikeTarget = function () {
                    return _super.prototype.getRikeTarget.call(this);
                };
                /**
                 * Creates an object on the server.
                 *
                 * Sends `POST` HTTP request. Uses protocol returned from `this.objectCreateProtocol(object)` method.
                 *
                 * @param object an object to create.
                 *
                 * @return {Observable<O>}
                 */
                CRUDResource.prototype.create = function (object) {
                    return this.rikeTarget.operation("create", this.objectCreateProtocol(object)).post(object);
                };
                /**
                 * Reads an object from the server.
                 *
                 * Sends `GET` HTTP request. Uses protocol returned from `this.objectReadProtocol(id)` method call.
                 *
                 * @param id an identifier of object to read.
                 *
                 * @return {Observable<O>}
                 */
                CRUDResource.prototype.read = function (id) {
                    return this.rikeTarget.operation("read", this.objectReadProtocol(id)).get();
                };
                /**
                 * Updates an object on the server.
                 *
                 * Sends `POST` HTTP request. Uses protocol returned from `this.objectUpdateProtocol(object)` method call.
                 *
                 * @param object an object to update.
                 *
                 * @return {Observable<O>}
                 */
                CRUDResource.prototype.update = function (object) {
                    return this.rikeTarget.operation("update", this.objectUpdateProtocol(object)).put(object);
                };
                /**
                 * Deletes an object on the server.
                 *
                 * Sends `DELETE` HTTP request. Uses protocol returned from `this.objectDeleteProtocol(object)` method call.
                 *
                 * @param object an object to delete.
                 *
                 * @return {Observable<any>}
                 */
                //noinspection ReservedWordAsName
                CRUDResource.prototype.delete = function (object) {
                    return this.rikeTarget.operation("delete", this.objectDeleteProtocol(object)).delete();
                };
                CRUDResource.prototype.createRikeTarget = function () {
                    return this.rike.target(this, protocol_4.jsonProtocol());
                };
                /**
                 * Constructs object creation protocol.
                 *
                 * @param object an object to create.
                 *
                 * @return {Protocol<T, T>} creation protocol.
                 */
                CRUDResource.prototype.objectCreateProtocol = function (object) {
                    return this.rikeTarget.protocol.instead().readResponse(function (response) { return object; });
                };
                /**
                 * Constructs object read protocol.
                 *
                 * This protocol updates request URL with `objectUrl()` by default.
                 *
                 * @param id an identifier of object to read.
                 *
                 * @return {Protocol<T, T>} read protocol.
                 */
                CRUDResource.prototype.objectReadProtocol = function (id) {
                    var _this = this;
                    return this.rikeTarget.protocol.prior().prepareRequest(function (options) { return new http_3.RequestOptions(options).merge({
                        url: _this.objectUrl(options.url, id)
                    }); });
                };
                /**
                 * Constructs object update protocol.
                 *
                 * This protocol detects object identifier with `objectId()` method and updates request URL with `objectUrl()`
                 * by default.
                 *
                 * @param object an object to update.
                 *
                 * @return {Protocol<T, T>} update protocol.
                 */
                CRUDResource.prototype.objectUpdateProtocol = function (object) {
                    var _this = this;
                    return this.rikeTarget.protocol
                        .prior()
                        .updateRequest(function (object, options) { return new http_3.RequestOptions(options).merge({
                        url: _this.objectUrl(options.url, _this.objectId(object))
                    }); })
                        .instead()
                        .readResponse(function (response) { return object; });
                };
                /**
                 * Constructs object deletion protocol.
                 *
                 * This protocol detects object identifier with `objectId()` method and updates request URL with `objectUrl()`
                 * by default.
                 *
                 * @param object an object to delete.
                 *
                 * @return {Protocol<T, T>} deletion protocol.
                 */
                CRUDResource.prototype.objectDeleteProtocol = function (object) {
                    var _this = this;
                    return this.rikeTarget.protocol
                        .prior()
                        .updateRequest(function (object, options) { return new http_3.RequestOptions(options).merge({
                        url: _this.objectUrl(options.url, _this.objectId(object))
                    }); })
                        .instead()
                        .readResponse(function (response) { return object; });
                };
                //noinspection JSMethodCanBeStatic
                /**
                 * Updates base URL with object URL.
                 *
                 * By default append object identifier as URL-encoded string to the base URL.
                 *
                 * @param baseUrl base URL to update.
                 * @param id object identifier.
                 *
                 * @return {string} updated URL.
                 */
                CRUDResource.prototype.objectUrl = function (baseUrl, id) {
                    return options_2.relativeUrl(baseUrl, encodeURIComponent(id.toString()));
                };
                return CRUDResource;
            }(RikeResource));
            exports_11("CRUDResource", CRUDResource);
        }
    }
});
System.register("ng2rike/resource-provider", ["ng2rike/resource", "ng2rike/event-source-provider"], function(exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    var resource_1, event_source_provider_1;
    /**
     * Constructs provider recipe for {{Resource}}.
     *
     * Also registers the resource as source of Rike operation events.
     *
     * @param provide provider token. If not specified the `Resource` will be used.
     * @param useClass
     * @param useValue
     * @param useExisting
     * @param useFactory
     * @param deps
     *
     * @return new provider recipe.
     */
    function provideResource(_a) {
        var provide = _a.provide, useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps;
        var token = provide || resource_1.Resource;
        return [
            {
                provide: token,
                useClass: useClass,
                useValue: useValue,
                useExisting: useExisting,
                useFactory: useFactory,
                deps: deps,
            },
            event_source_provider_1.provideEventSource({
                useFactory: function (resource) { return resource.rikeTarget; },
                deps: [token],
            })
        ];
    }
    exports_12("provideResource", provideResource);
    return {
        setters:[
            function (resource_1_1) {
                resource_1 = resource_1_1;
            },
            function (event_source_provider_1_1) {
                event_source_provider_1 = event_source_provider_1_1;
            }],
        execute: function() {
        }
    }
});
System.register("ng2rike", ["@angular/core", "@angular/http", "@angular/common", "ng2rike/rike", "ng2rike/status.component", "ng2rike/errors.component", "ng2rike/event-source-provider", "ng2rike/error-collector", "ng2rike/event", "ng2rike/field-error", "ng2rike/options", "ng2rike/protocol", "ng2rike/resource", "ng2rike/resource-provider", "ng2rike/status-collector"], function(exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    var core_6, http_4, common_1, rike_1, status_component_1, errors_component_1, event_source_provider_2;
    var RikeModule;
    var exportedNames_1 = {
        'RikeModule': true
    };
    function exportStar_1(m) {
        var exports = {};
        for(var n in m) {
            if (n !== "default"&& !exportedNames_1.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_13(exports);
    }
    return {
        setters:[
            function (core_6_1) {
                core_6 = core_6_1;
            },
            function (http_4_1) {
                http_4 = http_4_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (rike_1_1) {
                rike_1 = rike_1_1;
                exportStar_1(rike_1_1);
            },
            function (status_component_1_1) {
                status_component_1 = status_component_1_1;
                exportStar_1(status_component_1_1);
            },
            function (errors_component_1_1) {
                errors_component_1 = errors_component_1_1;
                exportStar_1(errors_component_1_1);
            },
            function (event_source_provider_2_1) {
                event_source_provider_2 = event_source_provider_2_1;
                exportStar_1(event_source_provider_2_1);
            },
            function (error_collector_3_1) {
                exportStar_1(error_collector_3_1);
            },
            function (event_5_1) {
                exportStar_1(event_5_1);
            },
            function (field_error_2_1) {
                exportStar_1(field_error_2_1);
            },
            function (options_3_1) {
                exportStar_1(options_3_1);
            },
            function (protocol_5_1) {
                exportStar_1(protocol_5_1);
            },
            function (resource_2_1) {
                exportStar_1(resource_2_1);
            },
            function (resource_provider_1_1) {
                exportStar_1(resource_provider_1_1);
            },
            function (status_collector_4_1) {
                exportStar_1(status_collector_4_1);
            }],
        execute: function() {
            /**
             * REST-like services module.
             */
            RikeModule = (function () {
                function RikeModule() {
                }
                RikeModule = __decorate([
                    core_6.NgModule({
                        imports: [common_1.CommonModule, http_4.HttpModule],
                        providers: [
                            rike_1.Rike,
                            event_source_provider_2.provideEventSource({ useExisting: rike_1.Rike }),
                        ],
                        declarations: [
                            status_component_1.RikeStatusComponent,
                            errors_component_1.RikeErrorsComponent,
                        ],
                        exports: [
                            status_component_1.RikeStatusComponent,
                            errors_component_1.RikeErrorsComponent,
                        ],
                    }), 
                    __metadata('design:paramtypes', [])
                ], RikeModule);
                return RikeModule;
            }());
            exports_13("RikeModule", RikeModule);
        }
    }
});
System.register("ng2rike/options.spec", ["ng2rike/options"], function(exports_14, context_14) {
    "use strict";
    var __moduleName = context_14 && context_14.id;
    var options_4;
    return {
        setters:[
            function (options_4_1) {
                options_4 = options_4_1;
            }],
        execute: function() {
            describe("relativeUrl", function () {
                it("works without base URL", function () {
                    expect(options_4.relativeUrl(undefined, "url")).toBe("url");
                });
                it("handles empty base URL", function () {
                    expect(options_4.relativeUrl("", "url")).toBe("url");
                });
                it("resolves against base URL", function () {
                    expect(options_4.relativeUrl("base-url", "url")).toBe("base-url/url");
                });
                it("resolves absolute URL", function () {
                    expect(options_4.relativeUrl("/base-url", "/absolute-url")).toBe("/absolute-url");
                });
                it("resolves schema-qualified URL", function () {
                    expect(options_4.relativeUrl("/base-url", "https://some.host/path")).toBe("https://some.host/path");
                });
                it("resolves URL with default schema", function () {
                    expect(options_4.relativeUrl("/base-url", "//some.host/path")).toBe("//some.host/path");
                });
                it("resolves URL without schema", function () {
                    expect(options_4.relativeUrl("/base-url", "://some.host/path")).toBe("://some.host/path");
                });
                it("resolves URL which looks like schema-qualified", function () {
                    expect(options_4.relativeUrl("/base-url", "abc#http://some.host/path")).toBe("/base-url/abc#http://some.host/path");
                });
            });
        }
    }
});
System.register("ng2rike/protocol.spec", ["@angular/http", "ng2rike/protocol"], function(exports_15, context_15) {
    "use strict";
    var __moduleName = context_15 && context_15.id;
    var http_5, protocol_6;
    var TestProtocol;
    return {
        setters:[
            function (http_5_1) {
                http_5 = http_5_1;
            },
            function (protocol_6_1) {
                protocol_6 = protocol_6_1;
            }],
        execute: function() {
            TestProtocol = (function (_super) {
                __extends(TestProtocol, _super);
                function TestProtocol() {
                    _super.call(this);
                }
                TestProtocol.prototype.prepareRequest = function (options) {
                    return new http_5.RequestOptions(options).merge({ url: "/request", search: "prepared=true" });
                };
                TestProtocol.prototype.writeRequest = function (request, options) {
                    request.written = "written1";
                    return new http_5.RequestOptions(options).merge({ body: request });
                };
                TestProtocol.prototype.readResponse = function (response) {
                    return {
                        response: "response1"
                    };
                };
                return TestProtocol;
            }(protocol_6.Protocol));
            describe("Protocol", function () {
                var protocol = new TestProtocol();
                it("prepares request before", function () {
                    var proto = protocol.prior().prepareRequest(function (opts) { return new http_5.RequestOptions(opts).merge({ search: "updated=true" }); });
                    var opts = proto.prepareRequest({});
                    expect(opts.url).toBe("/request");
                    expect(opts.search && opts.search.toString()).toEqual("prepared=true");
                });
                it("prepares request after", function () {
                    var proto = protocol.then().prepareRequest(function (opts) { return new http_5.RequestOptions(opts).merge({ search: "updated=true" }); });
                    var opts = proto.prepareRequest({});
                    expect(opts.url).toBe("/request");
                    expect(opts.search && opts.search.toString()).toEqual("updated=true");
                });
                it("writes request", function () {
                    var proto = protocol.instead().writeRequest(function (request, opts) {
                        return new http_5.RequestOptions(opts).merge({ body: request.request2 });
                    });
                    var opts = proto.writeRequest({ request2: "request2" }, {});
                    expect(opts.body).toBe("request2");
                });
                it("updates request before it is written", function () {
                    var proto = protocol.prior().updateRequest(function (request, opts) {
                        request.update = "update1";
                        request.written = "rewritten1";
                        return new http_5.RequestOptions(opts).merge({ body: request });
                    });
                    var opts = proto.writeRequest({ request: "request1" }, {});
                    var body = opts.body;
                    expect(body.request).toBe("request1");
                    expect(body.update).toBe("update1");
                    expect(body.written).toBe("written1");
                });
                it("updates request after it is written", function () {
                    var proto = protocol.then().updateRequest(function (request, opts) {
                        request.update = "update1";
                        request.written = "rewritten1";
                        return new http_5.RequestOptions(opts).merge({ body: request });
                    });
                    var opts = proto.writeRequest({ request: "request1" }, {});
                    var body = opts.body;
                    expect(body.request).toBe("request1");
                    expect(body.update).toBe("update1");
                    expect(body.written).toBe("rewritten1");
                });
                it("reads response", function () {
                    var proto = protocol.instead().readResponse(function () {
                        return {
                            response2: "response2"
                        };
                    });
                    var response = proto.readResponse(new http_5.Response(new http_5.ResponseOptions()));
                    expect(response.response2).toBe("response2");
                });
                it("handles error", function () {
                    var proto = protocol.then().handleError(function (error) {
                        var err = error;
                        err.test = "error1";
                        return err;
                    });
                    var error = proto.handleError({ response: new http_5.Response(new http_5.ResponseOptions()) });
                    expect(error.test).toBe("error1");
                });
            });
            describe("JSON protocol", function () {
                var protocol = protocol_6.JSON_PROTOCOL;
                it("writes request", function () {
                    var request = { request: "some value", numeric: 13 };
                    var opts = protocol.writeRequest(request, {});
                    var response = JSON.parse(opts.body);
                    expect(opts.headers.get("Content-Type")).toBe("application/json");
                    expect(response.request).toBe(request.request);
                    expect(response.numeric).toBe(request.numeric);
                });
                it("reads response", function () {
                    var value = {
                        request: "Request1",
                        numeric: 333,
                    };
                    var read = protocol.readResponse(new http_5.Response(new http_5.ResponseOptions({
                        body: JSON.stringify(value),
                    })));
                    expect(read.request).toBe(value.request);
                    expect(read.numeric).toBe(value.numeric);
                });
            });
        }
    }
});
System.register("ng2rike/rike.spec", ["@angular/core", "@angular/http", "@angular/core/testing", "@angular/http/testing", "@angular/platform-browser-dynamic/testing", "ng2rike", "ng2rike/rike", "ng2rike/options", "ng2rike/protocol"], function(exports_16, context_16) {
    "use strict";
    var __moduleName = context_16 && context_16.id;
    var core_7, http_6, testing_1, testing_2, testing_3, ng2rike_1, rike_3, options_5, protocol_7;
    var initialized, RikeTestModule;
    function addRikeProviders() {
        if (initialized) {
            return;
        }
        initialized = true;
        testing_1.TestBed.initTestEnvironment(RikeTestModule, testing_3.platformBrowserDynamicTesting());
    }
    exports_16("addRikeProviders", addRikeProviders);
    function requestMethodTest(method, value) {
        return function () { return expect(rike_3.requestMethod(value)).toBe(method); };
    }
    function expectJsonProtocol(protocol) {
        var value = {
            a: "test",
            b: 13,
            c: ["foo", "bar", "baz"]
        };
        var written = protocol.writeRequest(value, {}).body;
        var restored = JSON.parse(written);
        expect(restored.a).toBe(value.a, "Invalid data restored from JSON");
        expect(restored.b).toBe(value.b, "Invalid data restored from JSON");
        expect(restored.c).toEqual(value.c, "Invalid data restored from JSON");
    }
    exports_16("expectJsonProtocol", expectJsonProtocol);
    return {
        setters:[
            function (core_7_1) {
                core_7 = core_7_1;
            },
            function (http_6_1) {
                http_6 = http_6_1;
            },
            function (testing_1_1) {
                testing_1 = testing_1_1;
            },
            function (testing_2_1) {
                testing_2 = testing_2_1;
            },
            function (testing_3_1) {
                testing_3 = testing_3_1;
            },
            function (ng2rike_1_1) {
                ng2rike_1 = ng2rike_1_1;
            },
            function (rike_3_1) {
                rike_3 = rike_3_1;
            },
            function (options_5_1) {
                options_5 = options_5_1;
            },
            function (protocol_7_1) {
                protocol_7 = protocol_7_1;
            }],
        execute: function() {
            initialized = false;
            RikeTestModule = (function () {
                function RikeTestModule() {
                }
                RikeTestModule = __decorate([
                    core_7.NgModule({
                        imports: [testing_3.BrowserDynamicTestingModule, ng2rike_1.RikeModule],
                        providers: [
                            testing_2.MockBackend,
                            {
                                provide: http_6.ConnectionBackend,
                                useExisting: testing_2.MockBackend
                            },
                            http_6.Http,
                            {
                                provide: options_5.RikeOptions,
                                useValue: new options_5.BaseRikeOptions({ baseUrl: "/test-root" })
                            },
                        ]
                    }), 
                    __metadata('design:paramtypes', [])
                ], RikeTestModule);
                return RikeTestModule;
            }());
            exports_16("RikeTestModule", RikeTestModule);
            describe("Rike", function () {
                var rike;
                var back;
                beforeEach(function () { return addRikeProviders(); });
                beforeEach(testing_1.inject([testing_2.MockBackend, rike_3.Rike], function (_be, _rike) {
                    back = _be;
                    rike = _rike;
                }));
                it("is initialized", function () {
                    expect(rike.options.baseUrl).toBe("/test-root");
                });
                function loadRequestTest(method, read) {
                    return function (done) {
                        back.connections.subscribe(function (connection) {
                            expect(connection.request.method).toBe(method);
                            expect(connection.request.url).toBe("/test-root/request-url");
                            connection.mockRespond(new http_6.Response(new http_6.ResponseOptions({
                                body: "response1",
                            })));
                        });
                        var succeed = false;
                        read(rike).call(rike, "request-url").subscribe(function (response) {
                            expect(response.text()).toBe("response1");
                            succeed = true;
                        }, function (err) { return done.fail(err); }, function () {
                            expect(succeed).toBeTruthy("Response not received");
                            done();
                        });
                    };
                }
                it("processes GET request", loadRequestTest(http_6.RequestMethod.Get, function (rike) { return rike.get; }));
                it("processes DELETE request", loadRequestTest(http_6.RequestMethod.Delete, function (rike) { return rike.delete; }));
                it("processes HEAD request", loadRequestTest(http_6.RequestMethod.Head, function (rike) { return rike.head; }));
                function sendRequestTest(method, read) {
                    return function (done) {
                        back.connections.subscribe(function (connection) {
                            expect(connection.request.method).toBe(method);
                            expect(connection.request.url).toBe("/test-root/send-request-url");
                            expect(connection.request.text()).toBe("request2");
                            connection.mockRespond(new http_6.Response(new http_6.ResponseOptions({
                                body: "response1",
                            })));
                        });
                        read(rike).call(rike, "send-request-url", "request2").subscribe(function (response) {
                            expect(response.text()).toBe("response1");
                            done();
                        });
                    };
                }
                it("processes POST request", sendRequestTest(http_6.RequestMethod.Post, function (rike) { return rike.post; }));
                it("processes PUT request", sendRequestTest(http_6.RequestMethod.Put, function (rike) { return rike.put; }));
                it("processes PATCH request", sendRequestTest(http_6.RequestMethod.Patch, function (rike) { return rike.patch; }));
                it("processes HTTP error", function (done) {
                    back.connections.subscribe(function (connection) {
                        connection.mockError(new Error("Response error"));
                    });
                    rike.get("request-url").subscribe(function () {
                        done.fail("Response received");
                    }, function (error) {
                        var err = error.error;
                        expect(err.message).toBe("Response error");
                        done();
                    });
                });
                it("creates target with the protocol", function () {
                    var targetId = "target1";
                    var target = rike.target(targetId);
                    expect(target.target).toBe(targetId);
                    expect(target.protocol).toBe(protocol_7.HTTP_PROTOCOL);
                });
                it("creates JSON target", function () {
                    var targetId = "target1";
                    var target = rike.json(targetId);
                    expect(target.target).toBe(targetId);
                    expectJsonProtocol(target.protocol);
                });
                it("creates target with specified protocol", function () {
                    var protocol = protocol_7.jsonProtocol()
                        .instead()
                        .writeRequest(function (val, opts) {
                        return new http_6.RequestOptions(opts).merge({ body: val });
                    });
                    var targetId = "target1";
                    var target = rike.target(targetId, protocol);
                    expect(target.target).toBe(targetId);
                    expect(protocol.writeRequest(-5, {}).body).toBe(-5);
                });
            });
            describe("requestMethod", function () {
                it("GET", requestMethodTest(http_6.RequestMethod.Get, "GeT"));
                it("POST", requestMethodTest(http_6.RequestMethod.Post, "pOSt"));
                it("PUT", requestMethodTest(http_6.RequestMethod.Put, "put"));
                it("DELETE", requestMethodTest(http_6.RequestMethod.Delete, "deletE"));
                it("OPTIONS", requestMethodTest(http_6.RequestMethod.Options, "OPTIONS"));
                it("HEAD", requestMethodTest(http_6.RequestMethod.Head, "hEad"));
                it("PATCH", requestMethodTest(http_6.RequestMethod.Patch, "pAtch"));
                it("specified as is", requestMethodTest(http_6.RequestMethod.Post, http_6.RequestMethod.Post));
                it("rejects unknown method", function () {
                    expect(function () { return rike_3.requestMethod("some"); }).toThrow();
                });
                it("rejects empty method", function () {
                    expect(function () { return rike_3.requestMethod(""); }).toThrow();
                });
            });
        }
    }
});
System.register("ng2rike/rike-operation.spec", ["@angular/http", "@angular/core/testing", "@angular/http/testing", "ng2rike/rike", "ng2rike/rike.spec"], function(exports_17, context_17) {
    "use strict";
    var __moduleName = context_17 && context_17.id;
    var http_7, testing_4, testing_5, rike_4, rike_spec_1;
    return {
        setters:[
            function (http_7_1) {
                http_7 = http_7_1;
            },
            function (testing_4_1) {
                testing_4 = testing_4_1;
            },
            function (testing_5_1) {
                testing_5 = testing_5_1;
            },
            function (rike_4_1) {
                rike_4 = rike_4_1;
            },
            function (rike_spec_1_1) {
                rike_spec_1 = rike_spec_1_1;
            }],
        execute: function() {
            describe("RikeOperation", function () {
                var rike;
                var back;
                var target;
                beforeEach(function () { return rike_spec_1.addRikeProviders(); });
                beforeEach(testing_4.inject([testing_5.MockBackend, rike_4.Rike], function (_be, _rike) {
                    back = _be;
                    rike = _rike;
                    target = rike.target("target").withBaseUrl("target-url");
                }));
                function loadRequestTest(method, read) {
                    return function (done) {
                        back.connections.subscribe(function (connection) {
                            expect(connection.request.method).toBe(method);
                            expect(connection.request.url).toBe("/test-root/target-url/request-url");
                            connection.mockRespond(new http_7.Response(new http_7.ResponseOptions({
                                body: "response1",
                            })));
                        });
                        var op = target.operation("operation1");
                        read(op).call(op, "request-url").subscribe(function (response) {
                            expect(response.text()).toBe("response1");
                            done();
                        });
                    };
                }
                it("processes GET request", loadRequestTest(http_7.RequestMethod.Get, function (op) { return op.get; }));
                it("processes DELETE request", loadRequestTest(http_7.RequestMethod.Delete, function (op) { return op.delete; }));
                it("processes HEAD request", loadRequestTest(http_7.RequestMethod.Head, function (op) { return op.head; }));
                function sendRequestTest(method, read) {
                    return function (done) {
                        back.connections.subscribe(function (connection) {
                            expect(connection.request.method).toBe(method);
                            expect(connection.request.url).toBe("/test-root/target-url/send-request-url");
                            expect(connection.request.text()).toBe("request2");
                            connection.mockRespond(new http_7.Response(new http_7.ResponseOptions({
                                body: "response1",
                            })));
                        });
                        var op = target.operation("operation1");
                        var succeed = false;
                        read(op).call(op, "request2", "send-request-url").subscribe(function (response) {
                            expect(response.text()).toBe("response1");
                            succeed = true;
                        }, function (err) { return done.fail(err); }, function () {
                            expect(succeed).toBeTruthy("No response received");
                            done();
                        });
                    };
                }
                it("processes POST request", sendRequestTest(http_7.RequestMethod.Post, function (op) { return op.post; }));
                it("processes PUT request", sendRequestTest(http_7.RequestMethod.Put, function (op) { return op.put; }));
                it("processes PATCH request", sendRequestTest(http_7.RequestMethod.Patch, function (op) { return op.patch; }));
                it("loads with GET by default", loadRequestTest(http_7.RequestMethod.Get, function (op) { return op.load; }));
                it("loads with specified method", loadRequestTest(http_7.RequestMethod.Options, function (op) { return op.withMethod("options").load; }));
                it("loads from specified URL", function (done) {
                    back.connections.subscribe(function (connection) {
                        expect(connection.request.url).toBe("/test-root/target-url/load-url");
                        connection.mockRespond(new http_7.Response(new http_7.ResponseOptions()));
                    });
                    target.operation("operation1").withUrl("load-url").load().subscribe(done);
                });
                it("loads from target URL by default", function (done) {
                    back.connections.subscribe(function (connection) {
                        expect(connection.request.url).toBe("/test-root/target-url");
                        connection.mockRespond(new http_7.Response(new http_7.ResponseOptions()));
                    });
                    target.operation("operation1").load().subscribe(done);
                });
                it("sends with specified method", sendRequestTest(http_7.RequestMethod.Put, function (op) { return op.withMethod("put").send; }));
                it("sends to specified URL", function (done) {
                    back.connections.subscribe(function (connection) {
                        expect(connection.request.url).toBe("/test-root/target-url/send-url");
                        connection.mockRespond(new http_7.Response(new http_7.ResponseOptions()));
                    });
                    target.operation("operation1").withUrl("send-url").send("abc").subscribe(done);
                });
                it("sends to target URL by default", function (done) {
                    back.connections.subscribe(function (connection) {
                        expect(connection.request.url).toBe("/test-root/target-url");
                        connection.mockRespond(new http_7.Response(new http_7.ResponseOptions()));
                    });
                    target.operation("operation1").send("abc").subscribe(done);
                });
            });
            describe("RikeOperation event", function () {
                var rike;
                var back;
                var target;
                beforeEach(function () { return rike_spec_1.addRikeProviders(); });
                beforeEach(testing_4.inject([testing_5.MockBackend, rike_4.Rike], function (_be, _rike) {
                    back = _be;
                    rike = _rike;
                    target = rike.target("target").withBaseUrl("target-url");
                }));
                function mockRespond() {
                    back.connections.subscribe(function (connection) {
                        connection.mockRespond(new http_7.Response(new http_7.ResponseOptions({
                            body: "response1",
                        })));
                    });
                }
                it("start", function (done) {
                    mockRespond();
                    var op = target.operation("operation");
                    var complete = false;
                    target.rikeEvents.subscribe(function (ev) {
                        if (!complete) {
                            complete = true;
                            expect(ev.operation).toBe(op);
                            expect(ev.target).toBe(target);
                            expect(ev.complete).toBeFalsy();
                            done();
                        }
                    }, function (err) { return done.fail(err); });
                    op.load().subscribe();
                });
                it("complete", function (done) {
                    mockRespond();
                    var op = target.operation("operation");
                    var events = 0;
                    target.rikeEvents.subscribe(function (ev) {
                        expect(ev.operation).toBe(op);
                        expect(ev.target).toBe(target);
                        if (events++) {
                            expect(ev.complete).toBeTruthy();
                            expect(ev.error).toBeUndefined();
                            var result = ev.result;
                            expect(result.text()).toBe("response1");
                            done();
                        }
                    }, function (err) { return done.fail(err); });
                    op.load().subscribe();
                });
                it("error", function (done) {
                    back.connections.subscribe(function (connection) {
                        connection.mockError(new Error("error1"));
                    });
                    var op = target.operation("operation");
                    var events = 0;
                    target.rikeEvents.subscribe(function (ev) {
                        if (!events++) {
                            expect(ev.operation).toBe(op);
                            expect(ev.target).toBe(target);
                        }
                        else {
                            expect(events).toBe(2, "Start event not received yet");
                            expect(ev.complete).toBeTruthy();
                            var error = ev.error;
                            expect(error.message).toBe("error1");
                            done();
                        }
                    }, function (err) { return done.fail(err); });
                    op.load().subscribe();
                });
                it("exception", function (done) {
                    back.connections.subscribe(function () {
                        throw new Error("error1");
                    });
                    var op = target.operation("operation");
                    var events = 0;
                    target.rikeEvents.subscribe(function (ev) {
                        events++;
                        expect(ev.operation).toBe(op);
                        expect(ev.target).toBe(target);
                    }, function (ev) {
                        expect(events).toBe(1, "Start event not received yet");
                        expect(ev.complete).toBeTruthy();
                        var error = ev.error;
                        expect(error.message).toBe("error1");
                        done();
                    });
                    expect(function () { return op.load().subscribe(); }).toThrowError("error1");
                });
            });
        }
    }
});
System.register("ng2rike/rike-target.spec", ["@angular/core/testing", "@angular/http", "@angular/http/testing", "ng2rike/rike.spec", "ng2rike/rike", "ng2rike/protocol"], function(exports_18, context_18) {
    "use strict";
    var __moduleName = context_18 && context_18.id;
    var testing_6, http_8, testing_7, rike_spec_2, rike_5, protocol_8;
    return {
        setters:[
            function (testing_6_1) {
                testing_6 = testing_6_1;
            },
            function (http_8_1) {
                http_8 = http_8_1;
            },
            function (testing_7_1) {
                testing_7 = testing_7_1;
            },
            function (rike_spec_2_1) {
                rike_spec_2 = rike_spec_2_1;
            },
            function (rike_5_1) {
                rike_5 = rike_5_1;
            },
            function (protocol_8_1) {
                protocol_8 = protocol_8_1;
            }],
        execute: function() {
            describe("RikeTarget", function () {
                var rike;
                var back;
                var target;
                beforeEach(function () { return rike_spec_2.addRikeProviders(); });
                beforeEach(testing_6.inject([testing_7.MockBackend, rike_5.Rike], function (_be, _rike) {
                    back = _be;
                    rike = _rike;
                    target = rike.target("target");
                }));
                it("created", function () {
                    expect(target.baseUrl).toBeUndefined();
                });
                it("updated with base url", function () {
                    var t = target.withBaseUrl("target-url");
                    expect(t).toBe(target);
                    expect(t.baseUrl).toBe("target-url");
                });
                it("creates operation over the target protocol", function () {
                    var op = target.operation("operation1");
                    expect(op.target).toBe(target);
                    expect(op.name).toBe("operation1");
                    expect(op.protocol).toBe(target.protocol);
                });
                it("creates JSON operation", function () {
                    var op = target.json("jsonOperation");
                    expect(op.target).toBe(target);
                    expect(op.name).toBe("jsonOperation");
                    rike_spec_2.expectJsonProtocol(op.protocol);
                });
                it("creates operation over specified protocol", function () {
                    var proto = protocol_8.jsonProtocol()
                        .instead()
                        .writeRequest(function (val, opts) {
                        return new http_8.RequestOptions(opts).merge({ body: JSON.stringify(val) });
                    });
                    var op = target.operation("customOperation", proto);
                    expect(op.target).toBe(target);
                    expect(op.name).toBe("customOperation");
                    expect(JSON.parse(op.protocol.writeRequest(13, {}).body)).toBe(13);
                });
                it("current operation updated on request", function (done) {
                    back.connections.subscribe(function (connection) {
                        connection.mockRespond(new http_8.Response(new http_8.ResponseOptions({
                            body: "response1",
                        })));
                    });
                    var op = target.operation("operation").withUrl("/request-url");
                    op.load().subscribe(function () {
                        expect(target.currentOperation).toBe(op, "Current operation not set on response");
                    }, function (err) { return done.fail(err); }, function () {
                        expect(target.currentOperation).toBe(op, "Current operation not set when complete");
                        setTimeout(function () {
                            expect(target.currentOperation).toBeUndefined("Current operation not cleared");
                            done();
                        });
                    });
                });
                it("current operation updated on error", function (done) {
                    back.connections.subscribe(function (connection) {
                        connection.mockError(new Error("error1"));
                    });
                    var op = target.operation("operation").withUrl("/request-url");
                    op.load().subscribe(function () {
                        done.fail("Response received");
                    }, function () {
                        expect(target.currentOperation).toBe(op, "Current operation not set on error");
                        setTimeout(function () {
                            expect(target.currentOperation).toBeUndefined("Current operation not cleared");
                            done();
                        });
                    });
                });
            });
        }
    }
});
//# sourceMappingURL=ng2rike.all.js.map
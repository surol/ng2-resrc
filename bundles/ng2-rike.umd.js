(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/http'), require('@angular/common'), require('rxjs/util/isArray'), require('rxjs/Rx')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/http', '@angular/common', 'rxjs/util/isArray', 'rxjs/Rx'], factory) :
    (factory((global.ng2rike = global.ng2rike || {}),global._angular_core,global._angular_http,global._angular_common,global.rxjs_util_isArray,global.rxjs_Rx));
}(this, (function (exports,_angular_core,_angular_http,_angular_common,rxjs_util_isArray,rxjs_Rx) { 'use strict';

var __extends$1 = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * REST-like operations protocol.
 *
 * It is used by REST-like operations to encode operation requests to HTTP, decode operation responses from HTTP,
 * and handle errors.
 *
 * `IN` is operation request type.
 * `OUT` is operation response type.
 */
var Protocol = (function () {
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
     * @return {ProtocolPre<IN, OUT>} protocol addon.
     */
    Protocol.prototype.prior = function () {
        return new CustomProtocolPre(this);
    };
    /**
     * Creates protocol addon able to append specified functions to protocol actions.
     *
     * @return {ProtocolPost<IN, OUT>} protocol addon.
     */
    Protocol.prototype.then = function () {
        return new CustomProtocolPost(this);
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
var CustomProtocolAddon = (function () {
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
var CustomProtocolPre = (function (_super) {
    __extends$1(CustomProtocolPre, _super);
    function CustomProtocolPre(protocol) {
        _super.call(this, protocol, true);
    }
    CustomProtocolPre.prototype.input = function (convert) {
        var _this = this;
        return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(options); }, function (request, options) { return _this._protocol.writeRequest(convert(request), options); }, function (response) { return _this._protocol.readResponse(response); }, function (error) { return _this._protocol.handleError(error); });
    };
    return CustomProtocolPre;
}(CustomProtocolAddon));
var CustomProtocolPost = (function (_super) {
    __extends$1(CustomProtocolPost, _super);
    function CustomProtocolPost(protocol) {
        _super.call(this, protocol, false);
    }
    CustomProtocolPost.prototype.output = function (convert) {
        var _this = this;
        return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(options); }, function (request, options) { return _this._protocol.writeRequest(request, options); }, function (httpResponse) { return convert(_this._protocol.readResponse(httpResponse), httpResponse); }, function (error) { return _this._protocol.handleError(_this._protocol.handleError(error)); });
    };
    return CustomProtocolPost;
}(CustomProtocolAddon));
var CustomProtocolMod = (function () {
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
var CustomProtocol = (function (_super) {
    __extends$1(CustomProtocol, _super);
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
var JsonProtocol = (function (_super) {
    __extends$1(JsonProtocol, _super);
    function JsonProtocol() {
        _super.apply(this, arguments);
    }
    JsonProtocol.prototype.writeRequest = function (request, options) {
        var opts = new _angular_http.RequestOptions(options).merge({ body: JSON.stringify(request) });
        var headers;
        if (opts.headers) {
            headers = opts.headers;
        }
        else {
            opts.headers = headers = new _angular_http.Headers();
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
var JSON_PROTOCOL = new JsonProtocol();
/**
 * Returns JSON protocol.
 *
 * Sends and receives the data of the given type as JSON over HTTP.
 */
var jsonProtocol = function () { return JSON_PROTOCOL; };
var HttpProtocol = (function (_super) {
    __extends$1(HttpProtocol, _super);
    function HttpProtocol() {
        _super.apply(this, arguments);
    }
    HttpProtocol.prototype.writeRequest = function (request, options) {
        return new _angular_http.RequestOptions(options).merge({ body: request });
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
var HTTP_PROTOCOL = new HttpProtocol();

var __extends$2 = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * REST-like resource access event emitter.
 *
 * Multiple instances of this class could be injected into controller or service to listen for Rike events.
 *
 * Use [provideEventSource] function to register event sources.
 */
var RikeEventSource = (function () {
    function RikeEventSource() {
    }
    return RikeEventSource;
}());
/**
 * Basic REST-like resource access event.
 *
 * Such events are emitted by [Rike event sources][RikeEventsSource].
 */
var RikeEvent = (function () {
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
/**
 * An event emitted when operation on a REST-like resource is started.
 */
var RikeOperationEvent = (function (_super) {
    __extends$2(RikeOperationEvent, _super);
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
/**
 * An event emitted when operation on a REST-like resource is successfully completed.
 */
var RikeSuccessEvent = (function (_super) {
    __extends$2(RikeSuccessEvent, _super);
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
/**
 * An event emitted when operation on a REST-like resource is failed.
 *
 * An object of this type is also reported as an error when some internal exception occurs.
 */
var RikeErrorEvent = (function (_super) {
    __extends$2(RikeErrorEvent, _super);
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
/**
 * An event emitted when operation on a REST-like resource caused an exception.
 *
 * An object of this type is reported as an error.
 */
var RikeExceptionEvent = (function (_super) {
    __extends$2(RikeExceptionEvent, _super);
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
/**
 * An event emitted when operation on a REST-like resource returned error.
 */
var RikeErrorResponseEvent = (function (_super) {
    __extends$2(RikeErrorResponseEvent, _super);
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
/**
 * An event emitted when operation on a REST-like resource is cancelled.
 */
var RikeCancelEvent = (function (_super) {
    __extends$2(RikeCancelEvent, _super);
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

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$1 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/**
 * Default map of Rike operations status labels.
 *
 * Default status labels are strings.
 */
var DEFAULT_STATUS_LABELS = {
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
};
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
var StatusCollector = (function () {
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
     * @param labels a map(s) of Rike operations status labels to use by this view.
     *
     * @return {StatusView<L>} new status view.
     */
    StatusCollector.prototype.view = function () {
        var labels = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            labels[_i - 0] = arguments[_i];
        }
        return this.addView.apply(this, ["" + ++this._viewIdSeq].concat(labels));
    };
    StatusCollector.prototype.addView = function (id) {
        var labels = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            labels[_i - 1] = arguments[_i];
        }
        var view = (_a = new StatusViewImpl(this._views, this._targetStatuses, id)).withLabels.apply(_a, labels);
        this._views[id] = view;
        return view;
        var _a;
    };
    StatusCollector.prototype.applyEvent = function (event) {
        this.initDefaultView(event);
        this.updateTargetStatuses(event);
        this.resetViews();
    };
    StatusCollector.prototype.initDefaultView = function (event) {
        if (!this._defaultView) {
            var defaultStatusLabels = event.target.rike.options.defaultStatusLabels;
            if (rxjs_util_isArray.isArray(defaultStatusLabels)) {
                this._defaultView = this.addView.apply(this, ["default"].concat(defaultStatusLabels));
            }
            else {
                this._defaultView = this.addView("default", defaultStatusLabels);
            }
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
    StatusCollector = __decorate$1([
        _angular_core.Injectable(),
        __param(0, _angular_core.Inject(RikeEventSource)),
        __param(0, _angular_core.Optional()), 
        __metadata$1('design:paramtypes', [Array])
    ], StatusCollector);
    return StatusCollector;
}());
var StatusViewImpl = (function () {
    function StatusViewImpl(_views, _targetStatuses, _id) {
        this._views = _views;
        this._targetStatuses = _targetStatuses;
        this._id = _id;
        this._labels = [];
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
    StatusViewImpl.prototype.withLabels = function () {
        var labels = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            labels[_i - 0] = arguments[_i];
        }
        this._combined = undefined;
        (_a = this._labels).unshift.apply(_a, labels);
        return this;
        var _a;
    };
    StatusViewImpl.prototype.withOperationLabels = function (operation) {
        var labels = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            labels[_i - 1] = arguments[_i];
        }
        this._combined = undefined;
        for (var _a = 0, labels_1 = labels; _a < labels_1.length; _a++) {
            var l = labels_1[_a];
            this.withLabels((_b = {},
                _b[operation] = l,
                _b
            ));
        }
        return this;
        var _b;
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
        return this.operationLabel(status.start.operation.name, status) || this.operationLabel("*", status);
    };
    StatusViewImpl.prototype.operationLabel = function (operation, status) {
        for (var _i = 0, _a = this._labels; _i < _a.length; _i++) {
            var l = _a[_i];
            var label = labelOf(status, l[operation]);
            if (label) {
                return label;
            }
        }
        return undefined;
    };
    return StatusViewImpl;
}());
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

var __extends = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
/**
 * Global Rike options.
 *
 * To overwrite global options add a provider for {{BaseRikeOptions}} instance with {{RikeOptions}} as token:
 * ```ts
 * bootstrap(AppComponent, {provide: RikeOptions, new BaseRikeOptions({baseUrl: "/rike"})});
 * ```
 */
var RikeOptions = (function () {
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
/**
 * Basic [global resource options][RikeOptions] implementation.
 *
 * Can be used to override the global resource options.
 */
var BaseRikeOptions = (function (_super) {
    __extends(BaseRikeOptions, _super);
    function BaseRikeOptions(opts) {
        _super.call(this);
        this._defaultProtocol = HTTP_PROTOCOL;
        this._defaultStatusLabels = [DEFAULT_STATUS_LABELS];
        if (opts) {
            this._baseUrl = opts.baseUrl;
            if (opts.defaultProtocol) {
                this._defaultProtocol = opts.defaultProtocol;
            }
            var defaultStatusLabels = opts.defaultStatusLabels;
            if (defaultStatusLabels) {
                if (!rxjs_util_isArray.isArray(defaultStatusLabels)) {
                    this._defaultStatusLabels = [defaultStatusLabels];
                }
                else if (defaultStatusLabels.length) {
                    this._defaultStatusLabels = defaultStatusLabels;
                }
                else {
                    this._defaultStatusLabels = [DEFAULT_STATUS_LABELS];
                }
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
/**
 * Default resource options.
 *
 * @type {RikeOptions}
 */
var DEFAULT_RIKE_OPTIONS = new BaseRikeOptions();

var __extends$3 = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$2 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param$1 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var REQUEST_METHODS = {
    "GET": _angular_http.RequestMethod.Get,
    "POST": _angular_http.RequestMethod.Post,
    "PUT": _angular_http.RequestMethod.Put,
    "DELETE": _angular_http.RequestMethod.Delete,
    "OPTIONS": _angular_http.RequestMethod.Options,
    "HEAD": _angular_http.RequestMethod.Head,
    "PATCH": _angular_http.RequestMethod.Patch,
};
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
/**
 * REST-like resource operations service.
 *
 * This service can be injected to other services or components.
 *
 * It basically mimics the `Http` interface, but also honors [global Rike options][RikeOptions].
 *
 * It can also be used to perform operations on particular targets.
 */
var Rike = (function () {
    function Rike(_http, defaultHttpOptions, _options) {
        var _this = this;
        this._http = _http;
        this._rikeEvents = new _angular_core.EventEmitter();
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
        return new rxjs_Rx.Observable(function (responseObserver) {
            response.subscribe(function (httpResponse) { return responseObserver.next(httpResponse); }, function (error) { return responseObserver.error(_this.defaultProtocol.handleError(toErrorResponse(error))); }, function () { return responseObserver.complete(); });
        });
    };
    Rike = __decorate$2([
        _angular_core.Injectable(),
        __param$1(2, _angular_core.Optional()), 
        __metadata$2('design:paramtypes', [_angular_http.Http, _angular_http.RequestOptions, RikeOptions])
    ], Rike);
    return Rike;
}());
function toErrorResponse(error) {
    if (error instanceof _angular_http.Response) {
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
        response: new _angular_http.Response(new _angular_http.ResponseOptions({
            type: _angular_http.ResponseType.Error,
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
var RikeTarget = (function () {
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
var RikeOperation = (function () {
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
    __extends$3(RikeTargetImpl, _super);
    function RikeTargetImpl(_rike, _internals, _target, _protocol) {
        _super.call(this);
        this._rike = _rike;
        this._internals = _internals;
        this._target = _target;
        this._protocol = _protocol;
        this._rikeEvents = new _angular_core.EventEmitter();
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
                    this._rikeEvents.emit(cancel);
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
        return new rxjs_Rx.Observable(function (responseObserver) {
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
                var response = operation.protocol.readResponse(httpResponse);
                responseObserver.next(response);
                _this._rikeEvents.emit(new RikeSuccessEvent(operation, response));
            }, function (error) {
                console.error("[" + _this.target + "] " + operation.name + " failed", error);
                var errorResponse = toErrorResponse(error);
                try {
                    errorResponse = operation.protocol.handleError(errorResponse);
                    responseObserver.error(errorResponse);
                    _this._rikeEvents.emit(new RikeErrorResponseEvent(operation, errorResponse));
                }
                finally {
                    cleanup();
                }
            }, function () {
                try {
                    responseObserver.complete();
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
    __extends$3(RikeOperationImpl, _super);
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
            this.target.rikeEvents.emit(new RikeExceptionEvent(this, e));
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
            this.target.rikeEvents.emit(new RikeExceptionEvent(this, e));
            throw e;
        }
    };
    RikeOperationImpl.prototype.get = function (url, options) {
        try {
            this.startOperation();
            options = this.requestOptions(_angular_http.RequestMethod.Get, url, options);
            return this.wrapResponse(this.internals.get(this.requestUrl(options), options));
        }
        catch (e) {
            this.target.rikeEvents.emit(new RikeExceptionEvent(this, e));
            throw e;
        }
    };
    RikeOperationImpl.prototype.post = function (request, url, options) {
        try {
            this.startOperation();
            options = this.writeRequest(request, this.requestOptions(_angular_http.RequestMethod.Post, url, options));
            return this.wrapResponse(this.internals.post(this.requestUrl(options), options.body, options));
        }
        catch (e) {
            this.target.rikeEvents.emit(new RikeExceptionEvent(this, e));
            throw e;
        }
    };
    RikeOperationImpl.prototype.put = function (request, url, options) {
        try {
            this.startOperation();
            options = this.writeRequest(request, this.requestOptions(_angular_http.RequestMethod.Put, url, options));
            return this.wrapResponse(this.internals.put(this.requestUrl(options), options.body, options));
        }
        catch (e) {
            this.target.rikeEvents.emit(new RikeExceptionEvent(this, e));
            throw e;
        }
    };
    //noinspection ReservedWordAsName
    RikeOperationImpl.prototype.delete = function (url, options) {
        try {
            this.startOperation();
            options = this.requestOptions(_angular_http.RequestMethod.Delete, url, options);
            return this.wrapResponse(this.internals.delete(this.requestUrl(options), options));
        }
        catch (e) {
            this.target.rikeEvents.emit(new RikeExceptionEvent(this, e));
            throw e;
        }
    };
    RikeOperationImpl.prototype.patch = function (request, url, options) {
        try {
            this.startOperation();
            options = this.writeRequest(request, this.requestOptions(_angular_http.RequestMethod.Patch, url, options));
            return this.wrapResponse(this.internals.patch(this.requestUrl(options), options.body, options));
        }
        catch (e) {
            this.target.rikeEvents.emit(new RikeExceptionEvent(this, e));
            throw e;
        }
    };
    RikeOperationImpl.prototype.head = function (url, options) {
        try {
            this.startOperation();
            options = this.requestOptions(_angular_http.RequestMethod.Head, url, options);
            return this.wrapResponse(this.internals.head(this.requestUrl(options), options));
        }
        catch (e) {
            this.target.rikeEvents.emit(new RikeExceptionEvent(this, e));
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
            options = new _angular_http.RequestOptions(options).merge({ url: url, method: method });
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

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$3 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RikeStatusComponent = (function () {
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
        set: function (statusView) {
            if (statusView === this._statusView) {
                return;
            }
            this.releaseStatusView();
            this._statusView = statusView;
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
            for (var _i = 0, labels_1 = labels; _i < labels_1.length; _i++) {
                var label = labels_1[_i];
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
        var labels = this.rikeStatusLabels;
        if (labels) {
            if (!rxjs_util_isArray.isArray(labels)) {
                return this.collector.view(labels);
            }
            if (labels.length) {
                return (_a = this.collector).view.apply(_a, labels);
            }
        }
        return this.collector.view(DEFAULT_STATUS_LABELS);
        var _a;
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
    __decorate$3([
        _angular_core.Input(), 
        __metadata$3('design:type', Object)
    ], RikeStatusComponent.prototype, "rikeStatus", null);
    __decorate$3([
        _angular_core.Input(), 
        __metadata$3('design:type', Object)
    ], RikeStatusComponent.prototype, "rikeStatusLabels", null);
    __decorate$3([
        _angular_core.Input(), 
        __metadata$3('design:type', Function)
    ], RikeStatusComponent.prototype, "rikeStatusLabelText", null);
    __decorate$3([
        _angular_core.Input(), 
        __metadata$3('design:type', Function)
    ], RikeStatusComponent.prototype, "rikeStatusLabelClass", null);
    RikeStatusComponent = __decorate$3([
        _angular_core.Component({
            selector: 'rike-status,[rikeStatus],[rikeStatusLabels],[rikeStatusLabelText],[rikeStatusLabelClass]',
            template: "<span class=\"rike-status-icon\"></span> {{text}}",
            host: {
                "[class]": "cssClass",
            }
        }), 
        __metadata$3('design:paramtypes', [StatusCollector])
    ], RikeStatusComponent);
    return RikeStatusComponent;
}());
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
    for (var _i = 0, labels_2 = labels; _i < labels_2.length; _i++) {
        var label = labels_2[_i];
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
    if (status.processing) {
        return "rike-status rike-status-processing";
    }
    if (status.cancelled) {
        return "rike-status rike-status-cancelled";
    }
    if (status.failed) {
        return "rike-status rike-status-failed";
    }
    if (status.succeed) {
        return "rike-status rike-status-succeed";
    }
    return "rike-status rike-status-hidden";
}

function isJsonResponse(httpResponse) {
    var contentType = httpResponse.headers.get("Content-Type");
    if (!contentType) {
        return false;
    }
    var idx = contentType.indexOf(";");
    if (idx >= 0) {
        contentType = contentType.substring(0, idx);
    }
    return contentType.trim() === "application/json";
}
/**
 * Appends field errors to {{ErrorResponse}}.
 *
 * If field errors already present in `ErrorResponse` then does nothing.
 *
 * This function can be used as {{Protocol}} error handler.
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
    if (isJsonResponse(httpResponse)) {
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
        return undefined;
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

var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$5 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param$3 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
var ErrorCollector = (function () {
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
            return addFieldErrors(errorResponse).fieldErrors;
        }
        return {
            "*": [
                { message: errorEventMessage(error) }
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
            if (field !== "*" && affectedFields.hasOwnProperty(field)) {
                this.notify(field);
            }
        }
        this.notify("*"); // Always notify about common errors
    };
    ErrorCollector.prototype.handleError = function (error) {
        this.targetErrors(error.target).add("*", { message: errorEventMessage(error) });
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
            return {};
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
    ErrorCollector = __decorate$5([
        _angular_core.Injectable(),
        __param$3(0, _angular_core.Inject(RikeEventSource)),
        __param$3(0, _angular_core.Optional()), 
        __metadata$5('design:paramtypes', [Array])
    ], ErrorCollector);
    return ErrorCollector;
}());
function errorEventMessage(error) {
    if (error.cancel) {
        if (!error.cancelledBy) {
            return "Cancelled";
        }
        return "Cancelled by `" + error.cancelledBy.operation.name + "` operation";
    }
    return error.error.toString();
}
var FieldEmitter = (function () {
    function FieldEmitter(_field, _emitters, _targetErrors) {
        this._field = _field;
        this._emitters = _emitters;
        this._targetErrors = _targetErrors;
        this._emitter = new _angular_core.EventEmitter();
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
var ErrorSubscr = (function () {
    function ErrorSubscr(_fieldEmitter, _subscription) {
        this._fieldEmitter = _fieldEmitter;
        this._subscription = _subscription;
        this._refreshEmitter = new _angular_core.EventEmitter();
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
var TargetErrors = (function () {
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
            this._errors[field] = errors;
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
            if (f === "*" || this._errors.hasOwnProperty(f) && !this._emitters[f]) {
                appendErrorsTo(f, out, this._errors[f]);
            }
        }
    };
    return TargetErrors;
}());
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

var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$4 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param$2 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RikeErrorsComponent = (function () {
    function RikeErrorsComponent(_collector) {
        this._collector = _collector;
        this._errors = [];
        this._initialized = false;
    }
    Object.defineProperty(RikeErrorsComponent.prototype, "rikeErrors", {
        get: function () {
            return this._field;
        },
        set: function (field) {
            if (this._field === field) {
                return;
            }
            this._field = field;
            this.reinit();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeErrorsComponent.prototype, "errorCollector", {
        get: function () {
            return this._collector || (this._collector = this.createCollector());
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeErrorsComponent.prototype, "rikeErrorsOf", {
        get: function () {
            return this._collector;
        },
        set: function (collector) {
            if (this._collector === collector) {
                return;
            }
            this._collector = collector;
            this.reinit();
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
        this._initialized = true;
        this.subscribe();
    };
    RikeErrorsComponent.prototype.ngOnDestroy = function () {
        this._initialized = false;
        this.unsubscribe();
    };
    //noinspection JSMethodCanBeStatic
    RikeErrorsComponent.prototype.createCollector = function () {
        return new ErrorCollector();
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
    RikeErrorsComponent.prototype.reinit = function () {
        if (this._initialized) {
            this.unsubscribe();
            this.subscribe();
        }
    };
    RikeErrorsComponent.prototype.subscribe = function () {
        var _this = this;
        if (this._field) {
            this._subscription =
                this.errorCollector.subscribe(this._field, function (errors) { return _this.updateErrors(errors); }).refresh();
        }
        else {
            this._subscription =
                this.errorCollector.subscribeForRest(function (errors) { return _this.updateErrors(errors); }).refresh();
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
    __decorate$4([
        _angular_core.Input(), 
        __metadata$4('design:type', Object)
    ], RikeErrorsComponent.prototype, "rikeErrors", null);
    __decorate$4([
        _angular_core.Input(), 
        __metadata$4('design:type', Object)
    ], RikeErrorsComponent.prototype, "rikeErrorsOf", null);
    RikeErrorsComponent = __decorate$4([
        _angular_core.Component({
            selector: 'rike-errors,[rikeErrors],[rikeErrorsOf]',
            template: "\n    <ul class=\"rike-error-list\" *ngIf=\"errors.length\">\n        <li class=\"rike-error\" *ngFor=\"let error of errors\">{{error.message}}</li>\n    </ul>\n    ",
            host: {
                "[class.rike-errors]": "true",
                "[class.rike-no-errors]": "!errors.length"
            }
        }),
        __param$2(0, _angular_core.Optional()), 
        __metadata$4('design:paramtypes', [ErrorCollector])
    ], RikeErrorsComponent);
    return RikeErrorsComponent;
}());

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
        StatusCollector,
        ErrorCollector,
        {
            provide: RikeEventSource,
            multi: true,
            useClass: useClass,
            useValue: useValue,
            useExisting: useExisting,
            useFactory: useFactory,
            deps: deps,
        },
    ];
}

var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$6 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param$4 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RikeDisabledDirective = (function () {
    function RikeDisabledDirective(_rikeDisabledBy) {
        this._rikeDisabledBy = _rikeDisabledBy;
        this._disabledByDefault = false;
    }
    Object.defineProperty(RikeDisabledDirective.prototype, "disabled", {
        get: function () {
            return this.rikeDisabledBy.processing || this._disabledByDefault;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeDisabledDirective.prototype, "rikeDisabled", {
        set: function (disabled) {
            this._disabledByDefault = !!disabled;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeDisabledDirective.prototype, "rikeDisabledBy", {
        get: function () {
            return this._rikeDisabledBy;
        },
        set: function (collector) {
            this._rikeDisabledBy = collector;
        },
        enumerable: true,
        configurable: true
    });
    __decorate$6([
        _angular_core.HostBinding("disabled"),
        _angular_core.HostBinding("class.rike-disabled"), 
        __metadata$6('design:type', Boolean)
    ], RikeDisabledDirective.prototype, "disabled", null);
    __decorate$6([
        _angular_core.Input(), 
        __metadata$6('design:type', Object), 
        __metadata$6('design:paramtypes', [Object])
    ], RikeDisabledDirective.prototype, "rikeDisabled", null);
    __decorate$6([
        _angular_core.Input(), 
        __metadata$6('design:type', StatusCollector)
    ], RikeDisabledDirective.prototype, "rikeDisabledBy", null);
    RikeDisabledDirective = __decorate$6([
        _angular_core.Directive({
            selector: '[rikeDisabled],[rikeDisabledBy]',
            exportAs: 'rikeDisabled',
        }),
        __param$4(0, _angular_core.Optional()), 
        __metadata$6('design:paramtypes', [StatusCollector])
    ], RikeDisabledDirective);
    return RikeDisabledDirective;
}());

var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$7 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param$5 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RikeReadonlyDirective = (function () {
    function RikeReadonlyDirective(_rikeReadonlyBy) {
        this._rikeReadonlyBy = _rikeReadonlyBy;
        this._readonlyByDefault = false;
    }
    Object.defineProperty(RikeReadonlyDirective.prototype, "readonly", {
        get: function () {
            return this.rikeReadonlyBy.processing || this._readonlyByDefault;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeReadonlyDirective.prototype, "rikeReadonly", {
        set: function (disabled) {
            this._readonlyByDefault = !!disabled;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeReadonlyDirective.prototype, "rikeReadonlyBy", {
        get: function () {
            return this._rikeReadonlyBy;
        },
        set: function (collector) {
            this._rikeReadonlyBy = collector;
        },
        enumerable: true,
        configurable: true
    });
    __decorate$7([
        _angular_core.HostBinding("readonly"),
        _angular_core.HostBinding("class.rike-readonly"), 
        __metadata$7('design:type', Boolean)
    ], RikeReadonlyDirective.prototype, "readonly", null);
    __decorate$7([
        _angular_core.Input(), 
        __metadata$7('design:type', Object), 
        __metadata$7('design:paramtypes', [Object])
    ], RikeReadonlyDirective.prototype, "rikeReadonly", null);
    __decorate$7([
        _angular_core.Input(), 
        __metadata$7('design:type', StatusCollector)
    ], RikeReadonlyDirective.prototype, "rikeReadonlyBy", null);
    RikeReadonlyDirective = __decorate$7([
        _angular_core.Directive({
            selector: '[rikeReadonly],[rikeReadonlyBy]',
            exportAs: 'rikeReadonly',
        }),
        __param$5(0, _angular_core.Optional()), 
        __metadata$7('design:paramtypes', [StatusCollector])
    ], RikeReadonlyDirective);
    return RikeReadonlyDirective;
}());

var __extends$4 = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * An interface of REST-like resources.
 *
 * An operations target is created per resource with a resource instance as target value. All operations on this
 * resource should be performed using this target.
 *
 * This class can be used as a token for resources. It can be registered as Angular service with {{provideResource}}.
 */
var Resource = (function () {
    function Resource() {
    }
    return Resource;
}());
/**
 * Abstract implementation of REST-like resource.
 */
var RikeResource = (function () {
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
        return this.rike.target(this, JSON_PROTOCOL);
    };
    return RikeResource;
}());
/**
 * Loadable resource.
 *
 * It is able to load arbitrary data from the server. By default expects a JSON data. Override `createRikeTarget()`
 * method to change it. When loaded the data will be cached. Call `reload()` method to reload it.
 *
 * @param <T> loaded data type.
 */
var LoadableResource = (function (_super) {
    __extends$4(LoadableResource, _super);
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
            return rxjs_Rx.Observable.of(data);
        }
        return new rxjs_Rx.Observable(function (observer) {
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
        return this.rike.target(this, jsonProtocol());
    };
    return LoadableResource;
}(RikeResource));
/**
 * CRUD (Create, Load, Update, Delete) resource.
 *
 * It is able to manipulate with server objects. By default it operates over JSON protocol.
 * Override `createRikeTarget()` method to change it.
 */
var CRUDResource = (function (_super) {
    __extends$4(CRUDResource, _super);
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
        return this.rike.target(this, jsonProtocol());
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
        return this.rikeTarget.protocol.prior()
            .prepareRequest(function (options) { return _this.objectReadOptions(options, id); });
    };
    /**
     * Updates object read request options.
     *
     * By default returns the result of `objectOptions()` method call.
     *
     * This method is used by `objectReadProtocol()` method.
     *
     * @param options original request options.
     * @param id an identifier of object to read.
     *
     * @return {RequestOptionsArgs} updated request options.
     */
    CRUDResource.prototype.objectReadOptions = function (options, id) {
        return this.objectOptions(options, id);
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
            .updateRequest(function (object, options) { return _this.objectUpdateOptions(options, object); })
            .instead()
            .readResponse(function (response) { return object; });
    };
    //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
    /**
     * Updates the given object update request options.
     *
     * By default returns original options.
     *
     * This method is used by `objectUpdateProtocol()` method and can be overridden e.g. to call an
     * `objectOptions()` method.
     *
     * @param options original request options.
     * @param object object to update.
     *
     * @return {RequestOptionsArgs} updated request options.
     */
    CRUDResource.prototype.objectUpdateOptions = function (options, object) {
        return options;
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
            .updateRequest(function (object, options) { return _this.objectDeleteOptions(options, object); })
            .instead()
            .readResponse(function (response) { return object; });
    };
    /**
     * Updates object delete request options.
     *
     * By default returns the result of `objectOptions()` method call.
     *
     * This method is used by `objectDeleteProtocol()` method.
     *
     * @param options original request options.
     * @param object an object to delete.
     *
     * @return {RequestOptionsArgs} updated request options.
     */
    CRUDResource.prototype.objectDeleteOptions = function (options, object) {
        return this.objectOptions(options, this.objectId(object));
    };
    //noinspection JSMethodCanBeStatic
    /**
     * Updates request options for object with the given identifier.
     *
     * By default appends object identifier as URL-encoded string to the base URL.
     *
     * @param options original request options.
     * @param id object identifier.
     *
     * @return {RequestOptionsArgs} updated request options.
     */
    CRUDResource.prototype.objectOptions = function (options, id) {
        return new _angular_http.RequestOptions(options).merge({
            url: relativeUrl(options.url, encodeURIComponent(id.toString()))
        });
    };
    return CRUDResource;
}(RikeResource));

var resourceIdSeq = 0;
/**
 * Constructs provider recipe for {{Resource}}.
 *
 * Also registers the resource as source of Rike operation events.
 *
 * @return new provider recipe.
 */
function provideResource(_a) {
    var provide = _a.provide, useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps;
    var token = provide || new _angular_core.OpaqueToken("resource" + ++resourceIdSeq);
    return [
        {
            provide: token,
            useClass: useClass,
            useValue: useValue,
            useExisting: useExisting,
            useFactory: useFactory,
            deps: deps,
        },
        provideEventSource({
            useFactory: function (resource) { return resource.rikeTarget; },
            deps: [token],
        })
    ];
}

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/**
 * REST-like services module.
 */
var RikeModule = (function () {
    function RikeModule() {
    }
    /**
     * Configures Rike.
     *
     * Can be used in `@NgModule` as following:
     * ```typescript
     * @NgModule({
     *   imports: [
     *     RikeModule.configure({
     *       baseUrl: '/application/base',
     *       defaultProtocol: CUSTOM_PROTOCOL,
     *     })
     *   ]
     * })
     * export class MyModule {
     * }
     * ```
     *
     * @param options default Rike options.
     *
     * @return a value that can be inserted into `imports` section of `NgModule`
     */
    RikeModule.configure = function (options) {
        return {
            ngModule: RikeModule,
            providers: [
                {
                    provide: RikeOptions,
                    useValue: new BaseRikeOptions(options),
                }
            ]
        };
    };
    RikeModule = __decorate([
        _angular_core.NgModule({
            imports: [
                _angular_common.CommonModule,
                _angular_http.HttpModule,
            ],
            providers: [
                Rike,
                provideEventSource({ useExisting: Rike }),
            ],
            declarations: [
                RikeStatusComponent,
                RikeErrorsComponent,
                RikeDisabledDirective,
                RikeReadonlyDirective,
            ],
            exports: [
                RikeStatusComponent,
                RikeErrorsComponent,
                RikeDisabledDirective,
                RikeReadonlyDirective,
            ],
        }), 
        __metadata('design:paramtypes', [])
    ], RikeModule);
    return RikeModule;
}());

exports.RikeModule = RikeModule;
exports.RikeDisabledDirective = RikeDisabledDirective;
exports.ErrorCollector = ErrorCollector;
exports.RikeErrorsComponent = RikeErrorsComponent;
exports.RikeEventSource = RikeEventSource;
exports.RikeEvent = RikeEvent;
exports.RikeOperationEvent = RikeOperationEvent;
exports.RikeSuccessEvent = RikeSuccessEvent;
exports.RikeErrorEvent = RikeErrorEvent;
exports.RikeExceptionEvent = RikeExceptionEvent;
exports.RikeErrorResponseEvent = RikeErrorResponseEvent;
exports.RikeCancelEvent = RikeCancelEvent;
exports.provideEventSource = provideEventSource;
exports.addFieldErrors = addFieldErrors;
exports.relativeUrl = relativeUrl;
exports.RikeOptions = RikeOptions;
exports.BaseRikeOptions = BaseRikeOptions;
exports.DEFAULT_RIKE_OPTIONS = DEFAULT_RIKE_OPTIONS;
exports.Protocol = Protocol;
exports.JSON_PROTOCOL = JSON_PROTOCOL;
exports.jsonProtocol = jsonProtocol;
exports.HTTP_PROTOCOL = HTTP_PROTOCOL;
exports.RikeReadonlyDirective = RikeReadonlyDirective;
exports.Resource = Resource;
exports.RikeResource = RikeResource;
exports.LoadableResource = LoadableResource;
exports.CRUDResource = CRUDResource;
exports.provideResource = provideResource;
exports.requestMethod = requestMethod;
exports.Rike = Rike;
exports.RikeTarget = RikeTarget;
exports.RikeOperation = RikeOperation;
exports.DEFAULT_STATUS_LABELS = DEFAULT_STATUS_LABELS;
exports.StatusCollector = StatusCollector;
exports.RikeStatusComponent = RikeStatusComponent;

Object.defineProperty(exports, '__esModule', { value: true });

})));
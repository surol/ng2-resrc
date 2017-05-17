var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
export { RikeEventSource };
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
export { RikeEvent };
/**
 * An event emitted when operation on a REST-like resource is started.
 */
var RikeOperationEvent = (function (_super) {
    __extends(RikeOperationEvent, _super);
    function RikeOperationEvent(_operation) {
        var _this = _super.call(this) || this;
        _this._operation = _operation;
        return _this;
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
export { RikeOperationEvent };
/**
 * An event emitted when operation on a REST-like resource is successfully completed.
 */
var RikeSuccessEvent = (function (_super) {
    __extends(RikeSuccessEvent, _super);
    function RikeSuccessEvent(_operation, _result) {
        var _this = _super.call(this) || this;
        _this._operation = _operation;
        _this._result = _result;
        return _this;
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
export { RikeSuccessEvent };
/**
 * An event emitted when operation on a REST-like resource is failed.
 *
 * An object of this type is also reported as an error when some internal exception occurs.
 */
var RikeErrorEvent = (function (_super) {
    __extends(RikeErrorEvent, _super);
    function RikeErrorEvent(_operation, _error) {
        var _this = _super.call(this) || this;
        _this._operation = _operation;
        _this._error = _error;
        return _this;
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
export { RikeErrorEvent };
/**
 * An event emitted when operation on a REST-like resource caused an exception.
 *
 * An object of this type is reported as an error.
 */
var RikeExceptionEvent = (function (_super) {
    __extends(RikeExceptionEvent, _super);
    function RikeExceptionEvent(operation, error, _errorResponse) {
        var _this = _super.call(this, operation, error) || this;
        _this._errorResponse = _errorResponse;
        return _this;
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
export { RikeExceptionEvent };
/**
 * An event emitted when operation on a REST-like resource returned error.
 */
var RikeErrorResponseEvent = (function (_super) {
    __extends(RikeErrorResponseEvent, _super);
    function RikeErrorResponseEvent(operation, _errorResponse) {
        var _this = _super.call(this, operation, _errorResponse.error || _errorResponse) || this;
        _this._errorResponse = _errorResponse;
        return _this;
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
export { RikeErrorResponseEvent };
/**
 * An event emitted when operation on a REST-like resource is cancelled.
 */
var RikeCancelEvent = (function (_super) {
    __extends(RikeCancelEvent, _super);
    function RikeCancelEvent(operation, _cancelledBy) {
        var _this = _super.call(this, operation, _cancelledBy || "cancel") || this;
        _this._cancelledBy = _cancelledBy;
        return _this;
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
export { RikeCancelEvent };
//# sourceMappingURL=event.js.map
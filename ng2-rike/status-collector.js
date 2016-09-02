"use strict";
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
var core_1 = require("@angular/core");
var isArray_1 = require("rxjs/util/isArray");
var event_1 = require("./event");
/**
 * Default map of Rike operations status labels.
 *
 * Default status labels are strings.
 */
exports.DEFAULT_STATUS_LABELS = {
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
            if (isArray_1.isArray(defaultStatusLabels)) {
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
    StatusCollector = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(event_1.RikeEventSource)),
        __param(0, core_1.Optional()), 
        __metadata('design:paramtypes', [Array])
    ], StatusCollector);
    return StatusCollector;
}());
exports.StatusCollector = StatusCollector;
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

//# sourceMappingURL=status-collector.js.map

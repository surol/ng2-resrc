import { Component, Input } from "@angular/core";
import { StatusCollector, DEFAULT_STATUS_LABELS } from "./status-collector";
import { isArray } from "rxjs/util/isArray";
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
            if (!isArray(labels)) {
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
    return RikeStatusComponent;
}());
export { RikeStatusComponent };
RikeStatusComponent.decorators = [
    { type: Component, args: [{
                selector: 'rike-status,[rikeStatus],[rikeStatusLabels],[rikeStatusLabelText],[rikeStatusLabelClass]',
                template: "<span class=\"rike-status-icon\"></span> {{text}}",
                host: {
                    "[class]": "cssClass",
                }
            },] },
];
/** @nocollapse */
RikeStatusComponent.ctorParameters = function () { return [
    { type: StatusCollector, },
]; };
RikeStatusComponent.propDecorators = {
    'rikeStatus': [{ type: Input },],
    'rikeStatusLabels': [{ type: Input },],
    'rikeStatusLabelText': [{ type: Input },],
    'rikeStatusLabelClass': [{ type: Input },],
};
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
//# sourceMappingURL=status.component.js.map
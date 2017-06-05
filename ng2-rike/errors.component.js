import { Component, Input, Optional } from "@angular/core";
import { ErrorCollector } from "./error-collector";
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
                this.errorCollector.subscribe(this._field, function (errors) { return _this.updateErrors(errors); });
        }
        else {
            this._subscription =
                this.errorCollector.subscribeForRest(function (errors) { return _this.updateErrors(errors); });
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
    return RikeErrorsComponent;
}());
export { RikeErrorsComponent };
RikeErrorsComponent.decorators = [
    { type: Component, args: [{
                selector: 'rike-errors,[rikeErrors],[rikeErrorsOf]',
                template: "\n    <ul class=\"rike-error-list\" *ngIf=\"errors.length\">\n        <li class=\"rike-error\" *ngFor=\"let error of errors\">{{error.message}}</li>\n    </ul>\n    ",
                host: {
                    "[class.rike-errors]": "true",
                    "[class.rike-no-errors]": "!errors.length"
                }
            },] },
];
/** @nocollapse */
RikeErrorsComponent.ctorParameters = function () { return [
    { type: ErrorCollector, decorators: [{ type: Optional },] },
]; };
RikeErrorsComponent.propDecorators = {
    'rikeErrors': [{ type: Input },],
    'rikeErrorsOf': [{ type: Input },],
};
//# sourceMappingURL=errors.component.js.map
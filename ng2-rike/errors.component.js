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
var error_collector_1 = require("./error-collector");
var RikeErrorsComponent = (function () {
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
        core_1.Input(), 
        __metadata('design:type', String)
    ], RikeErrorsComponent.prototype, "rikeErrorsField", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', error_collector_1.ErrorCollector)
    ], RikeErrorsComponent.prototype, "rikeErrors", null);
    RikeErrorsComponent = __decorate([
        core_1.Component({
            selector: '[rikeErrors],[rikeErrorsField]',
            template: "\n    <ul class=\"rike-error-list\" *ngIf=\"errors.length\">\n        <li class=\"rike-error\" *ngFor=\"let error of errors\">{{error.message}}</li>\n    </ul>\n    ",
            host: {
                "[class.rike-errors]": "true"
            }
        }),
        __param(0, core_1.Optional()), 
        __metadata('design:paramtypes', [error_collector_1.ErrorCollector])
    ], RikeErrorsComponent);
    return RikeErrorsComponent;
}());
exports.RikeErrorsComponent = RikeErrorsComponent;

//# sourceMappingURL=errors.component.js.map

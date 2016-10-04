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
import { Directive, Optional, Input, HostBinding } from "@angular/core";
import { StatusCollector } from "./status-collector";
export var RikeDisabledDirective = (function () {
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
    __decorate([
        HostBinding("disabled"),
        HostBinding("class.rike-disabled"), 
        __metadata('design:type', Boolean)
    ], RikeDisabledDirective.prototype, "disabled", null);
    __decorate([
        Input(), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], RikeDisabledDirective.prototype, "rikeDisabled", null);
    __decorate([
        Input(), 
        __metadata('design:type', StatusCollector)
    ], RikeDisabledDirective.prototype, "rikeDisabledBy", null);
    RikeDisabledDirective = __decorate([
        Directive({
            selector: '[rikeDisabled],[rikeDisabledBy]',
            exportAs: 'rikeDisabled',
        }),
        __param(0, Optional()), 
        __metadata('design:paramtypes', [StatusCollector])
    ], RikeDisabledDirective);
    return RikeDisabledDirective;
}());
//# sourceMappingURL=disabled.directive.js.map
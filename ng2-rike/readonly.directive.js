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
export var RikeReadonlyDirective = (function () {
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
    __decorate([
        HostBinding("readonly"),
        HostBinding("class.rike-readonly"), 
        __metadata('design:type', Boolean)
    ], RikeReadonlyDirective.prototype, "readonly", null);
    __decorate([
        Input(), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], RikeReadonlyDirective.prototype, "rikeReadonly", null);
    __decorate([
        Input(), 
        __metadata('design:type', StatusCollector)
    ], RikeReadonlyDirective.prototype, "rikeReadonlyBy", null);
    RikeReadonlyDirective = __decorate([
        Directive({
            selector: '[rikeReadonly],[rikeReadonlyBy]',
            exportAs: 'rikeReadonly',
        }),
        __param(0, Optional()), 
        __metadata('design:paramtypes', [StatusCollector])
    ], RikeReadonlyDirective);
    return RikeReadonlyDirective;
}());
//# sourceMappingURL=readonly.directive.js.map
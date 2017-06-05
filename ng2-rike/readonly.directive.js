import { Directive, Optional, Input, HostBinding } from "@angular/core";
import { StatusCollector } from "./status-collector";
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
    return RikeReadonlyDirective;
}());
export { RikeReadonlyDirective };
RikeReadonlyDirective.decorators = [
    { type: Directive, args: [{
                selector: '[rikeReadonly],[rikeReadonlyBy]',
                exportAs: 'rikeReadonly',
            },] },
];
/** @nocollapse */
RikeReadonlyDirective.ctorParameters = function () { return [
    { type: StatusCollector, decorators: [{ type: Optional },] },
]; };
RikeReadonlyDirective.propDecorators = {
    'readonly': [{ type: HostBinding, args: ["readonly",] }, { type: HostBinding, args: ["class.rike-readonly",] },],
    'rikeReadonly': [{ type: Input },],
    'rikeReadonlyBy': [{ type: Input },],
};
//# sourceMappingURL=readonly.directive.js.map
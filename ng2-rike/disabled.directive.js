import { Directive, Optional, Input, HostBinding } from "@angular/core";
import { StatusCollector } from "./status-collector";
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
    return RikeDisabledDirective;
}());
export { RikeDisabledDirective };
RikeDisabledDirective.decorators = [
    { type: Directive, args: [{
                selector: '[rikeDisabled],[rikeDisabledBy]',
                exportAs: 'rikeDisabled',
            },] },
];
/** @nocollapse */
RikeDisabledDirective.ctorParameters = function () { return [
    { type: StatusCollector, decorators: [{ type: Optional },] },
]; };
RikeDisabledDirective.propDecorators = {
    'disabled': [{ type: HostBinding, args: ["disabled",] }, { type: HostBinding, args: ["class.rike-disabled",] },],
    'rikeDisabled': [{ type: Input },],
    'rikeDisabledBy': [{ type: Input },],
};
//# sourceMappingURL=disabled.directive.js.map
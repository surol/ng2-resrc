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
import { isArray } from "rxjs/util/isArray";
import { HTTP_PROTOCOL } from "./protocol";
import { DEFAULT_STATUS_LABELS } from "./status-collector";
/**
 * Constructs URL relative to base URL.
 *
 * @param baseUrl base URL.
 * @param url URL.
 *
 * @returns {string} If `baseUrl` is not specified, or empty string, or `url` is absolute, then returns unmodified `url`.
 * Otherwise concatenates `baseUrl` and `url` separating them by `/` sign.
 */
export function relativeUrl(baseUrl, url) {
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
export { RikeOptions };
/**
 * Basic [global resource options][RikeOptions] implementation.
 *
 * Can be used to override the global resource options.
 */
var BaseRikeOptions = (function (_super) {
    __extends(BaseRikeOptions, _super);
    function BaseRikeOptions(opts) {
        var _this = _super.call(this) || this;
        _this._defaultProtocol = HTTP_PROTOCOL;
        _this._defaultStatusLabels = [DEFAULT_STATUS_LABELS];
        if (opts) {
            _this._baseUrl = opts.baseUrl;
            if (opts.defaultProtocol) {
                _this._defaultProtocol = opts.defaultProtocol;
            }
            var defaultStatusLabels = opts.defaultStatusLabels;
            if (defaultStatusLabels) {
                if (!isArray(defaultStatusLabels)) {
                    _this._defaultStatusLabels = [defaultStatusLabels];
                }
                else if (defaultStatusLabels.length) {
                    _this._defaultStatusLabels = defaultStatusLabels;
                }
                else {
                    _this._defaultStatusLabels = [DEFAULT_STATUS_LABELS];
                }
            }
        }
        return _this;
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
export { BaseRikeOptions };
/**
 * Default resource options.
 *
 * @type {RikeOptions}
 */
export var DEFAULT_RIKE_OPTIONS = new BaseRikeOptions();
//# sourceMappingURL=options.js.map
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var protocol_1 = require("./protocol");
var status_collector_1 = require("./status-collector");
/**
 * Constructs URL relative to base URL.
 *
 * @param baseUrl base URL.
 * @param url URL.
 *
 * @returns {string} If `baseUrl` is not specified, or empty string, or `url` is absolute, then returns unmodified `url`.
 * Otherwise concatenates `baseUrl` and `url` separating them by `/` sign.
 */
function relativeUrl(baseUrl, url) {
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
exports.relativeUrl = relativeUrl;
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
exports.RikeOptions = RikeOptions;
/**
 * Basic [global resource options][RikeOptions] implementation.
 *
 * Can be used to override the global resource options.
 */
var BaseRikeOptions = (function (_super) {
    __extends(BaseRikeOptions, _super);
    function BaseRikeOptions(opts) {
        _super.call(this);
        this._defaultProtocol = protocol_1.HTTP_PROTOCOL;
        this._defaultStatusLabels = status_collector_1.DEFAULT_STATUS_LABELS;
        if (opts) {
            this._baseUrl = opts.baseUrl;
            if (opts.defaultProtocol) {
                this._defaultProtocol = opts.defaultProtocol;
            }
            if (opts.defaultStatusLabels) {
                this._defaultStatusLabels = opts.defaultStatusLabels;
            }
        }
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
exports.BaseRikeOptions = BaseRikeOptions;
/**
 * Default resource options.
 *
 * @type {RikeOptions}
 */
exports.DEFAULT_RIKE_OPTIONS = new BaseRikeOptions();

//# sourceMappingURL=options.js.map

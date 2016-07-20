var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
System.register("ng2-resrc/resrc-options", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ResrcOptions, BaseResrcOptions;
    return {
        setters:[],
        execute: function() {
            /**
             * Global resource options.
             *
             * To overwrite global options add a provider for [BaseResrcOptions] instance with [ResrcOptions] as a key:
             * ```ts
             * bootstrap(AppComponent, {provide: ResrcOptions, new BaseResrcOptions({baseDir: "/rest"})});
             * ```
             */
            ResrcOptions = (function () {
                function ResrcOptions() {
                }
                /**
                 * Constructs URL relative to _baseUrl_.
                 *
                 * @param url URL
                 *
                 * @returns {string} If _baseUrl_ is not set, or _url_ is absolute, then returns unmodified _url_.
                 * Otherwise concatenates _baseUrl_ and _url_ separating them by `/` sign.
                 */
                ResrcOptions.prototype.relativeUrl = function (url) {
                    if (this.baseUrl == null) {
                        return url;
                    }
                    if (url[0] === "/") {
                        return url; // Absolute URL
                    }
                    if (url.match(/^(\w*:)?\/\//)) {
                        return url; // Full URL
                    }
                    return this.baseUrl + "/";
                };
                return ResrcOptions;
            }());
            exports_1("ResrcOptions", ResrcOptions);
            /**
             * Basic [global resource options][ResrcOptions] implementation.
             *
             * Can be used to override the global resource options.
             */
            BaseResrcOptions = (function (_super) {
                __extends(BaseResrcOptions, _super);
                function BaseResrcOptions(opts) {
                    _super.call(this);
                    if (opts) {
                        this._baseUrl = opts.baseUrl;
                    }
                }
                Object.defineProperty(BaseResrcOptions.prototype, "baseUrl", {
                    get: function () {
                        return this._baseUrl;
                    },
                    enumerable: true,
                    configurable: true
                });
                return BaseResrcOptions;
            }(ResrcOptions));
            exports_1("BaseResrcOptions", BaseResrcOptions);
        }
    }
});
// Placeholder
//# sourceMappingURL=ng2-resrc.js.map
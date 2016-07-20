declare module "ng2-resrc/resrc-options" {
    /**
     * Global resource options.
     *
     * To overwrite global options add a provider for [BaseResrcOptions] instance with [ResrcOptions] as a key:
     * ```ts
     * bootstrap(AppComponent, {provide: ResrcOptions, new BaseResrcOptions({baseDir: "/rest"})});
     * ```
     */
    export abstract class ResrcOptions {
        /**
         * Base URL of all relative URLs
         */
        readonly abstract baseUrl?: string;
        /**
         * Constructs URL relative to _baseUrl_.
         *
         * @param url URL
         *
         * @returns {string} If _baseUrl_ is not set, or _url_ is absolute, then returns unmodified _url_.
         * Otherwise concatenates _baseUrl_ and _url_ separating them by `/` sign.
         */
        relativeUrl(url: string): string;
    }
    /**
     * Basic [global resource options][ResrcOptions] implementation.
     *
     * Can be used to override the global resource options.
     */
    export class BaseResrcOptions extends ResrcOptions {
        private _baseUrl?;
        constructor(opts?: ResrcOptions);
        readonly baseUrl: string | undefined;
    }
}

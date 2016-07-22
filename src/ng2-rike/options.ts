/**
 * Default resource options.
 *
 * @type {RikeOptions}
 */
export const DEFAULT_RIKE_OPTIONS: RikeOptions = new BaseRikeOptions();

/**
 * Global resource options.
 *
 * To overwrite global options add a provider for [BaseRikeOptions] instance with [RikeOptions] as a key:
 * ```ts
 * bootstrap(AppComponent, {provide: RikeOptions, new BaseRikeOptions({baseDir: "/rike"})});
 * ```
 */
export abstract class RikeOptions {

    /**
     * Base URL of all relative URLs
     */
    abstract readonly baseUrl?: string;

    /**
     * Constructs URL relative to _baseUrl_.
     *
     * @param url URL
     *
     * @returns {string} If _baseUrl_ is not set, or _url_ is absolute, then returns unmodified _url_.
     * Otherwise concatenates _baseUrl_ and _url_ separating them by `/` sign.
     */
    relativeUrl(url: string): string {
        if (this.baseUrl == null) {
            return url;
        }
        if (url[0] === "/") {
            return url;// Absolute URL
        }
        if (url.match(/^(\w*:)?\/\//)) {
            return url;// Full URL
        }
        return this.baseUrl + "/";
    }

}

/**
 * Basic [global resource options][RikeOptions] implementation.
 *
 * Can be used to override the global resource options.
 */
export class BaseRikeOptions extends RikeOptions {

    private _baseUrl?: string;

    constructor(opts?: RikeOptions) {
        super();
        if (opts) {
            this._baseUrl = opts.baseUrl;
        }
    }

    get baseUrl(): string | undefined {
        return this._baseUrl;
    }

}

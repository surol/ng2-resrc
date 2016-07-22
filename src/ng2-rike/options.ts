/**
 * Default resource options.
 *
 * @type {RikeOptions}
 */
export const DEFAULT_RIKE_OPTIONS: RikeOptions = new BaseRikeOptions();

/**
 * Constructs URL relative to base URL.
 *
 * @param baseUrl base URL.
 * @param url URL.
 *
 * @returns {string} If `baseUrl` is not specified, or empty string, or `url` is absolute, then returns unmodified `url`.
 * Otherwise concatenates `baseUrl` and `url` separating them by `/` sign.
 */
export function relativeUrl(baseUrl: string | undefined, url: string): string {
    if (!baseUrl) {
        return url;
    }
    if (url[0] === "/") {
        return url;// Absolute URL
    }
    if (url.match(/^(\w*:)?\/\//)) {
        return url;// Full URL
    }
    return baseUrl + "/";
}

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
     * Constructs URL relative to `baseUrl`.
     *
     * @param url URL
     *
     * @returns {string} resolved URL.
     */
    relativeUrl(url: string): string {
        return relativeUrl(this.baseUrl, url);
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

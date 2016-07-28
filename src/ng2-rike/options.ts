import {RikeStatusLabels, DEFAULT_STATUS_LABELS} from "./status";
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
    return baseUrl + "/" + url;
}

/**
 * Global Rike options interface.
 */
export interface RikeOptionsArgs {

    /**
     * Base URL of all relative URLs
     */
    readonly baseUrl?: string;

    /**
     * Rike operation status labels to use by default.
     */
    readonly defaultStatusLabels?: {[operation: string]: RikeStatusLabels<any>};

}

/**
 * Global Rike options.
 *
 * To overwrite global options add a provider for [BaseRikeOptions] instance with [RikeOptions] as a key:
 * ```ts
 * bootstrap(AppComponent, {provide: RikeOptions, new BaseRikeOptions({baseDir: "/rike"})});
 * ```
 */
export abstract class RikeOptions implements RikeOptionsArgs {

    abstract readonly baseUrl?: string;

    abstract defaultStatusLabels?: {[operation: string]: RikeStatusLabels<any>};

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
    private _defaultStatusLabels = DEFAULT_STATUS_LABELS;

    constructor(opts?: RikeOptionsArgs) {
        super();
        if (opts) {
            this._baseUrl = opts.baseUrl;
            if (opts.defaultStatusLabels) {
                this._defaultStatusLabels = opts.defaultStatusLabels;
            }
        }
    }

    get baseUrl(): string | undefined {
        return this._baseUrl;
    }

    get defaultStatusLabels():{[operation: string]: RikeStatusLabels<any>} | undefined {
        return this._defaultStatusLabels;
    }

}

/**
 * Default resource options.
 *
 * @type {RikeOptions}
 */
export const DEFAULT_RIKE_OPTIONS: RikeOptions = new BaseRikeOptions();

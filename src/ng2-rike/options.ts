import {Protocol, HTTP_PROTOCOL} from "./protocol";
import {StatusLabels, DEFAULT_STATUS_LABELS, DefaultStatusLabel} from "./status-collector";
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
     * Base URL of all relative URLs.
     *
     * All relative Rike request URLs will be resolved against this one.
     */
    readonly baseUrl?: string;

    /**
     * Default operations protocol.
     *
     * If not specified then `HTTP_PROTOCOL` will be used.
     */
    readonly defaultProtocol?: Protocol<any, any>;

    /**
     * A map of Rike operations status labels to use by default.
     *
     * If not specified the `DEFAULT_STATUS_LABELS` will be used.
     *
     * Default status labels are always of type {{DefaultStatusLabel}}.
     */
    readonly defaultStatusLabels?: {[operation: string]: StatusLabels<DefaultStatusLabel>};

}

/**
 * Global Rike options.
 *
 * To overwrite global options add a provider for {{BaseRikeOptions}} instance with {{RikeOptions}} as token:
 * ```ts
 * bootstrap(AppComponent, {provide: RikeOptions, new BaseRikeOptions({baseUrl: "/rike"})});
 * ```
 */
export abstract class RikeOptions implements RikeOptionsArgs {

    abstract readonly baseUrl?: string;

    abstract readonly defaultProtocol: Protocol<any, any>;

    abstract defaultStatusLabels: {[operation: string]: StatusLabels<DefaultStatusLabel>};

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
    private _defaultProtocol: Protocol<any, any> = HTTP_PROTOCOL;
    private _defaultStatusLabels = DEFAULT_STATUS_LABELS;

    constructor(opts?: RikeOptionsArgs) {
        super();
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

    get baseUrl(): string | undefined {
        return this._baseUrl;
    }

    get defaultProtocol(): Protocol<any, any> {
        return this._defaultProtocol;
    }

    get defaultStatusLabels(): {[operation: string]: StatusLabels<DefaultStatusLabel>} {
        return this._defaultStatusLabels;
    }

}

/**
 * Default resource options.
 *
 * @type {RikeOptions}
 */
export const DEFAULT_RIKE_OPTIONS: RikeOptions = new BaseRikeOptions();

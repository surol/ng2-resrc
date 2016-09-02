import { Protocol } from "./protocol";
import { DefaultStatusLabel, StatusLabelMap } from "./status-collector";
/**
 * Constructs URL relative to base URL.
 *
 * @param baseUrl base URL.
 * @param url URL.
 *
 * @returns {string} If `baseUrl` is not specified, or empty string, or `url` is absolute, then returns unmodified `url`.
 * Otherwise concatenates `baseUrl` and `url` separating them by `/` sign.
 */
export declare function relativeUrl(baseUrl: string | undefined, url: string): string;
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
    readonly defaultStatusLabels?: StatusLabelMap<DefaultStatusLabel> | StatusLabelMap<DefaultStatusLabel>[];
}
/**
 * Global Rike options.
 *
 * To overwrite global options add a provider for {{BaseRikeOptions}} instance with {{RikeOptions}} as token:
 * ```ts
 * bootstrap(AppComponent, {provide: RikeOptions, new BaseRikeOptions({baseUrl: "/rike"})});
 * ```
 */
export declare abstract class RikeOptions implements RikeOptionsArgs {
    readonly abstract baseUrl?: string;
    readonly abstract defaultProtocol: Protocol<any, any>;
    abstract defaultStatusLabels: StatusLabelMap<DefaultStatusLabel> | StatusLabelMap<DefaultStatusLabel>[];
    /**
     * Constructs URL relative to `baseUrl`.
     *
     * @param url URL
     *
     * @returns {string} resolved URL.
     */
    relativeUrl(url: string): string;
}
/**
 * Basic [global resource options][RikeOptions] implementation.
 *
 * Can be used to override the global resource options.
 */
export declare class BaseRikeOptions extends RikeOptions {
    private _baseUrl?;
    private _defaultProtocol;
    private _defaultStatusLabels;
    constructor(opts?: RikeOptionsArgs);
    readonly baseUrl: string | undefined;
    readonly defaultProtocol: Protocol<any, any>;
    readonly defaultStatusLabels: StatusLabelMap<DefaultStatusLabel>[];
}
/**
 * Default resource options.
 *
 * @type {RikeOptions}
 */
export declare const DEFAULT_RIKE_OPTIONS: RikeOptions;

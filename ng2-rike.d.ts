import { RikeOptionsArgs } from "./ng2-rike/options";
export * from "./ng2-rike/error-collector";
export * from "./ng2-rike/errors.component";
export * from "./ng2-rike/event";
export * from "./ng2-rike/event-source-provider";
export * from "./ng2-rike/field-error";
export * from "./ng2-rike/options";
export * from "./ng2-rike/protocol";
export * from "./ng2-rike/resource";
export * from "./ng2-rike/resource-provider";
export * from "./ng2-rike/rike";
export * from "./ng2-rike/status-collector";
export * from "./ng2-rike/status.component";
/**
 * REST-like services module.
 */
export declare class RikeModule {
    /**
     * Configures Rike.
     *
     * Can be used in `@NgModule` as following:
     * ```typescript
     * @NgModule({
     *   imports: [
     *     RikeModule.configure({
     *       baseUrl: '/application/base',
     *       defaultProtocol: CUSTOM_PROTOCOL,
     *     })
     *   ]
     * })
     * export class MyModule {
     * }
     * ```
     *
     * @param options default Rike options.
     *
     * @return a value that can be inserted into `imports` section of `NgModule`
     */
    static configure(options?: RikeOptionsArgs): any;
}

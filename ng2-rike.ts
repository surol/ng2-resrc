import {InjectionToken, NgModule} from "@angular/core";
import {HttpModule} from "@angular/http";
import {CommonModule} from "@angular/common";
import {BaseRikeOptions, RikeOptions, RikeOptionsArgs} from "./ng2-rike/options";
import {Rike} from "./ng2-rike/rike";
import {RikeStatusComponent} from "./ng2-rike/status.component";
import {RikeErrorsComponent} from "./ng2-rike/errors.component";
import {provideEventSource} from "./ng2-rike/event-source-provider";
import {RikeDisabledDirective} from "./ng2-rike/disabled.directive";
import {RikeReadonlyDirective} from "./ng2-rike/readonly.directive";
import {RikeEventSource} from "./ng2-rike/event";
import {StatusCollector} from "./ng2-rike/status-collector";
import {ErrorCollector} from "./ng2-rike/error-collector";

export * from "./ng2-rike/disabled.directive";
export * from "./ng2-rike/error-collector";
export * from "./ng2-rike/errors.component";
export * from "./ng2-rike/event";
export * from "./ng2-rike/event-source-provider";
export * from "./ng2-rike/field-error";
export * from "./ng2-rike/options";
export * from "./ng2-rike/protocol";
export * from "./ng2-rike/readonly.directive";
export * from "./ng2-rike/resource";
export * from "./ng2-rike/resource-provider";
export * from "./ng2-rike/rike";
export * from "./ng2-rike/status-collector";
export * from "./ng2-rike/status.component";

/**
 * REST-like services module.
 */
@NgModule({
    imports: [
        CommonModule,
        HttpModule,
    ],
    providers: [
        Rike,
        [
            StatusCollector,
            ErrorCollector,
            {
                provide: RikeEventSource,
                multi: true,
                useExisting: Rike,
            },
        ],
    ],
    declarations: [
        RikeStatusComponent,
        RikeErrorsComponent,
        RikeDisabledDirective,
        RikeReadonlyDirective,
    ],
    exports: [
        RikeStatusComponent,
        RikeErrorsComponent,
        RikeDisabledDirective,
        RikeReadonlyDirective,
    ],
})
export class RikeModule {

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
    static configure(options?: RikeOptionsArgs): any {
        return {
            ngModule: RikeModule,
            providers: [
                {
                    provide: RIKE_CONFIGURATION,
                    useValue: options,
                },
                {
                    provide: RikeOptions,
                    useFactory: provideRikeOptions,
                    deps: [RIKE_CONFIGURATION]
                }
            ]
        }
    }

}

export const RIKE_CONFIGURATION = new InjectionToken<RikeOptionsArgs>('RIKE_CONFIGURATION');

export function provideRikeOptions(options?: RikeOptionsArgs) {
    return new BaseRikeOptions(options);
}

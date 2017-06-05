import { NgModule } from "@angular/core";
import { HttpModule } from "@angular/http";
import { CommonModule } from "@angular/common";
import { BaseRikeOptions, RikeOptions } from "./ng2-rike/options";
import { Rike } from "./ng2-rike/rike";
import { RikeStatusComponent } from "./ng2-rike/status.component";
import { RikeErrorsComponent } from "./ng2-rike/errors.component";
import { RikeDisabledDirective } from "./ng2-rike/disabled.directive";
import { RikeReadonlyDirective } from "./ng2-rike/readonly.directive";
import { RikeEventSource } from "./ng2-rike/event";
import { StatusCollector } from "./ng2-rike/status-collector";
import { ErrorCollector } from "./ng2-rike/error-collector";
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
var RikeModule = (function () {
    function RikeModule() {
    }
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
    RikeModule.configure = function (options) {
        return {
            ngModule: RikeModule,
            providers: [
                {
                    provide: RikeOptions,
                    useValue: new BaseRikeOptions(options),
                }
            ]
        };
    };
    return RikeModule;
}());
export { RikeModule };
RikeModule.decorators = [
    { type: NgModule, args: [{
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
            },] },
];
/** @nocollapse */
RikeModule.ctorParameters = function () { return []; };
//# sourceMappingURL=ng2-rike.js.map
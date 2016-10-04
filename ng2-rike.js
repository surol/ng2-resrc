var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { NgModule } from "@angular/core";
import { HttpModule } from "@angular/http";
import { CommonModule } from "@angular/common";
import { RikeOptions, BaseRikeOptions } from "./ng2-rike/options";
import { Rike } from "./ng2-rike/rike";
import { RikeStatusComponent } from "./ng2-rike/status.component";
import { RikeErrorsComponent } from "./ng2-rike/errors.component";
import { provideEventSource } from "./ng2-rike/event-source-provider";
import { RikeDisabledDirective } from "./ng2-rike/disabled.directive";
import { RikeReadonlyDirective } from "./ng2-rike/readonly.directive";
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
export var RikeModule = (function () {
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
    RikeModule = __decorate([
        NgModule({
            imports: [
                CommonModule,
                HttpModule,
            ],
            providers: [
                Rike,
                provideEventSource({ useExisting: Rike }),
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
        }), 
        __metadata('design:paramtypes', [])
    ], RikeModule);
    return RikeModule;
}());
//# sourceMappingURL=ng2-rike.js.map
import {NgModule} from "@angular/core";
import {HttpModule} from "@angular/http";
import {CommonModule} from "@angular/common";
import {Rike} from "./ng2-rike/rike";
import {RikeStatusComponent} from "./ng2-rike/status.component";
import {RikeErrorsComponent} from "./ng2-rike/errors.component";
import {provideEventSource} from "./ng2-rike/event-source-provider";

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
@NgModule({
    imports: [CommonModule, HttpModule],
    providers: [
        Rike,
        provideEventSource({useExisting: Rike}),
    ],
    declarations: [
        RikeStatusComponent,
        RikeErrorsComponent,
    ],
    exports: [
        RikeStatusComponent,
        RikeErrorsComponent,
    ],
})
export class RikeModule {
}

import {NgModule} from "@angular/core";
import {HttpModule} from "@angular/http";
import {CommonModule} from "@angular/common";
import {Rike} from "./ng2rike/rike";
import {RikeStatusComponent} from "./ng2rike/status.component";
import {RikeErrorsComponent} from "./ng2rike/errors.component";
import {provideEventSource} from "./ng2rike/event-source-provider";

export * from "./ng2rike/error-collector";
export * from "./ng2rike/errors.component";
export * from "./ng2rike/event";
export * from "./ng2rike/event-source-provider";
export * from "./ng2rike/field-error";
export * from "./ng2rike/options";
export * from "./ng2rike/protocol";
export * from "./ng2rike/resource";
export * from "./ng2rike/resource-provider";
export * from "./ng2rike/rike";
export * from "./ng2rike/status-collector";
export * from "./ng2rike/status.component";

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

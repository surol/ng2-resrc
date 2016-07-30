///<reference types="core-js"/>
import {PLATFORM_DIRECTIVES} from "@angular/core";
import {Rike} from "./ng2-rike/rike";
import {RikeEventSource} from "./ng2-rike/event";
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
 * Provides a basic set of providers to use REST-like services in application.
 *
 * The `RIKE_PROVIDERS` should be included either in a component's injector, or in the root injector when bootstrapping
 * an application.
 *
 * @type {any[]}
 */
export const RIKE_PROVIDERS: any[] = [
    Rike,
    provideEventSource({useExisting: Rike}),
    {
        provide: PLATFORM_DIRECTIVES,
        useValue: RikeStatusComponent,
        multi: true,
    },
    {
        provide: PLATFORM_DIRECTIVES,
        useValue: RikeErrorsComponent,
        multi: true,
    }
];

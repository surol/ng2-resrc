///<reference types="core-js"/>
import {PLATFORM_DIRECTIVES} from "@angular/core";
import {Rike} from "./ng2-rike/rike";
import {RikeEventSource} from "./ng2-rike/event";
import {StatusComponent} from "./ng2-rike/status.component";

export * from "./ng2-rike/error";
export * from "./ng2-rike/error-collector";
export * from "./ng2-rike/event";
export * from "./ng2-rike/options";
export * from "./ng2-rike/protocol";
export * from "./ng2-rike/resource";
export * from "./ng2-rike/rike";
export * from "./ng2-rike/status";
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
    RikeEventSource.provide({useExisting: Rike}),
    {
        provide: PLATFORM_DIRECTIVES,
        useValue: StatusComponent,
        multi: true,
    }
];

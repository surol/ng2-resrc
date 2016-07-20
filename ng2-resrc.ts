import {Resrc} from "./ng2-resrc/resrc";
export * from './ng2-resrc/event';
export * from './ng2-resrc/options';
export * from './ng2-resrc/resrc';

/**
 * Provides a basic set of providers to use REST-like services in application.
 *
 * The RESRC_PROVIDERS should be included either in a component's injector, or in the root injector when bootstrapping
 * an application.
 *
 * @type {any[]}
 */
export const RESRC_PROVIDERS: any[] = [
    Resrc
];

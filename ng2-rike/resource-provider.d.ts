/// <reference types="core-js" />
import { Type } from "@angular/core";
/**
 * Constructs provider recipe for {{Resource}}.
 *
 * Also registers the resource as source of Rike operation events.
 *
 * @param provide provider token. If not specified the `Resource` will be used.
 * @param useClass
 * @param useValue
 * @param useExisting
 * @param useFactory
 * @param deps
 *
 * @return new provider recipe.
 */
export declare function provideResource({provide, useClass, useValue, useExisting, useFactory, deps}: {
    provide: any;
    useClass?: Type;
    useValue?: any;
    useExisting?: any;
    useFactory?: Function;
    deps?: Object[];
    multi?: boolean;
}): any;

/// <reference types="core-js" />
import { Type } from "@angular/core";
/**
 * Constructs provider recipe for {{Resource}}.
 *
 * Also registers the resource as source of Rike operation events.
 *
 * @return new provider recipe.
 */
export declare function provideResource({provide, useClass, useValue, useExisting, useFactory, deps}: {
    provide?: any;
    useClass?: Type<any>;
    useValue?: any;
    useExisting?: any;
    useFactory?: Function;
    deps?: Object[];
    multi?: boolean;
}): any;

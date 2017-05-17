import { Provider, Type } from "@angular/core";
/**
 * Constructs provider recipe for {{RikeEventSource}}.
 *
 * @param useClass
 * @param useValue
 * @param useExisting
 * @param useFactory
 * @param deps
 *
 * @return new provider recipe.
 */
export declare function provideEventSource({useClass, useValue, useExisting, useFactory, deps}: {
    useClass?: Type<any>;
    useValue?: any;
    useExisting?: any;
    useFactory?: Function;
    deps?: Object[];
    multi?: boolean;
}): Provider;

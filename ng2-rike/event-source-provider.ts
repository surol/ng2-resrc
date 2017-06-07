import {Provider, Type} from "@angular/core";
import {RikeEventSource} from "./event";
import {StatusCollector} from "./status-collector";
import {ErrorCollector} from "./error-collector";

/**
 * Constructs provider recipe for {{RikeEventSource}}.
 *
 * This function can not be used with AoT compilation. Specify providers explicitly instead, like this:
 * ```TypeScript
 * providers: [
 *   MyEventSource,
 *   StatusCollector,
 *   ErrorCollector,
 *   {
 *     provide: RikeEventSource,
 *     useExisting: MyEventSource,
 *     multi: true,
 *   }
 * ]
 * ```
 *
 * @param useClass
 * @param useValue
 * @param useExisting
 * @param useFactory
 * @param deps
 *
 * @return new provider recipe.
 */
export function provideEventSource({useClass, useValue, useExisting, useFactory, deps}: {
    useClass?: Type<any>;
    useValue?: any;
    useExisting?: any;
    useFactory?: Function;
    deps?: Object[];
    multi?: boolean;
}): Provider {
    return [
        StatusCollector,
        ErrorCollector,
        {
            provide: RikeEventSource,
            multi: true,
            useClass,
            useValue,
            useExisting,
            useFactory,
            deps,
        },
    ];
}

import {Type} from "@angular/core";
import {RikeEventSource} from "./event";
import {StatusCollector} from "./status-collector";
import {ErrorCollector} from "./error-collector";

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
export function provideEventSource({useClass, useValue, useExisting, useFactory, deps}: {
    useClass?: Type<any>;
    useValue?: any;
    useExisting?: any;
    useFactory?: Function;
    deps?: Object[];
    multi?: boolean;
}): any[] {
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

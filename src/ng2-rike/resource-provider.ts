import {Type} from "@angular/core";
import {Resource} from "./resource";
import {provideEventSource} from "./event-source-provider";

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
export function provideResource({provide, useClass, useValue, useExisting, useFactory, deps}: {
    provide?: any,
    useClass?: Type<any>;
    useValue?: any;
    useExisting?: any;
    useFactory?: Function;
    deps?: Object[];
    multi?: boolean;
}): any {

    const token = provide || Resource;

    return [
        {
            provide: token,
            useClass,
            useValue,
            useExisting,
            useFactory,
            deps,
        },
        provideEventSource({
            useFactory: (resource: Resource) => resource.rikeTarget,
            deps: [token],
        })
    ];
}

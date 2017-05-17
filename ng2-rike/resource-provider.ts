import {InjectionToken, Provider, Type} from "@angular/core";
import {Resource} from "./resource";
import {provideEventSource} from "./event-source-provider";

var resourceIdSeq = 0;

/**
 * Constructs provider recipe for {{Resource}}.
 *
 * Also registers the resource as source of Rike operation events.
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
}): Provider {

    const token = provide || new InjectionToken<any>("resource" + ++resourceIdSeq);

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

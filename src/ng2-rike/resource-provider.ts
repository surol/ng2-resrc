import {Type} from "@angular/core";
import {Resource} from "./resource";
import {provideEventSource} from "./event-source-provider";

export function provideResource({provide, useClass, useValue, useExisting, useFactory, deps}: {
    provide: any,
    useClass?: Type;
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

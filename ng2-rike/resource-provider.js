import { OpaqueToken } from "@angular/core";
import { provideEventSource } from "./event-source-provider";
var resourceIdSeq = 0;
/**
 * Constructs provider recipe for {{Resource}}.
 *
 * Also registers the resource as source of Rike operation events.
 *
 * @return new provider recipe.
 */
export function provideResource(_a) {
    var provide = _a.provide, useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps;
    var token = provide || new OpaqueToken("resource" + ++resourceIdSeq);
    return [
        {
            provide: token,
            useClass: useClass,
            useValue: useValue,
            useExisting: useExisting,
            useFactory: useFactory,
            deps: deps,
        },
        provideEventSource({
            useFactory: function (resource) { return resource.rikeTarget; },
            deps: [token],
        })
    ];
}
//# sourceMappingURL=resource-provider.js.map
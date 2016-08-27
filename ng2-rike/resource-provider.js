"use strict";
var resource_1 = require("./resource");
var event_source_provider_1 = require("./event-source-provider");
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
function provideResource(_a) {
    var provide = _a.provide, useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps;
    var token = provide || resource_1.Resource;
    return [
        {
            provide: token,
            useClass: useClass,
            useValue: useValue,
            useExisting: useExisting,
            useFactory: useFactory,
            deps: deps,
        },
        event_source_provider_1.provideEventSource({
            useFactory: function (resource) { return resource.rikeTarget; },
            deps: [token],
        })
    ];
}
exports.provideResource = provideResource;

//# sourceMappingURL=resource-provider.js.map

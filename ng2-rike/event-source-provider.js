"use strict";
var event_1 = require("./event");
var status_collector_1 = require("./status-collector");
var error_collector_1 = require("./error-collector");
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
function provideEventSource(_a) {
    var useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps;
    return [
        status_collector_1.StatusCollector,
        error_collector_1.ErrorCollector,
        {
            provide: event_1.RikeEventSource,
            multi: true,
            useClass: useClass,
            useValue: useValue,
            useExisting: useExisting,
            useFactory: useFactory,
            deps: deps,
        },
    ];
}
exports.provideEventSource = provideEventSource;

//# sourceMappingURL=event-source-provider.js.map

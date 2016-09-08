import { RikeEventSource } from "./event";
import { StatusCollector } from "./status-collector";
import { ErrorCollector } from "./error-collector";
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
export function provideEventSource(_a) {
    var useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps;
    return [
        StatusCollector,
        ErrorCollector,
        {
            provide: RikeEventSource,
            multi: true,
            useClass: useClass,
            useValue: useValue,
            useExisting: useExisting,
            useFactory: useFactory,
            deps: deps,
        },
    ];
}
//# sourceMappingURL=event-source-provider.js.map
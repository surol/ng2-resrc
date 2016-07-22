import {EventEmitter, Type} from "@angular/core";
import {RikeTarget, RikeOperation} from "./rike";

/**
 * REST-like resource access event emitter.
 *
 * Multiple instances of this class could be injected into controller or service to listen for Rike events.
 */
export abstract class RikeEventSource {

    /**
     * Constructs provider recipe for [RikeEventSource]
     *
     * @param useClass
     * @param useValue
     * @param useExisting
     * @param useFactory
     * @param deps
     *
     * @return new provider recipe.
     */
    static provide({useClass, useValue, useExisting, useFactory, deps}: {
        useClass?: Type;
        useValue?: any;
        useExisting?: any;
        useFactory?: Function;
        deps?: Object[];
        multi?: boolean;
    }): any {
        return {
            provide: RikeEventSource,
            multi: true,
            useClass,
            useValue,
            useExisting,
            useFactory,
            deps,
        };
    };

    /**
     * Rike events emitter.
     */
    abstract readonly rikeEvents: EventEmitter<RikeEvent>;

}

/**
 * Basic REST-like resource access event.
 *
 * Such events are emitted by [Rike event sources][RikeEventsSource].
 */
export abstract class RikeEvent {

    /**
     * Operation target.
     */
    get target(): RikeTarget<any, any> {
        return this.operation.target;
    }

    /**
     * Rike operation.
     */
    abstract readonly operation: RikeOperation<any, any>;

    /**
     * Whether an operation is complete.
     *
     * `true` on error or successful completion event.
     */
    abstract readonly complete: boolean;

    /**
     * The error occurred.
     *
     * `undefined` if this is not an error event.
     */
    abstract readonly error?: any;

    /**
     * Operation result, if any.
     */
    abstract readonly result?: any;

}

/**
 * An event emitted when operation on a REST-like resource is started.
 */
export class RikeOperationEvent extends RikeEvent {

    constructor(private _operation: RikeOperation<any, any>) {
        super();
    }

    get operation(): RikeOperation<any, any> {
        return this._operation;
    }

    get complete(): boolean {
        return false;
    }

    get error(): undefined {
        return undefined;
    }

    get result(): undefined {
        return undefined;
    }

}

/**
 * An event emitted when operation on a REST-like resource is successfully completed.
 */
export class RikeSuccessEvent extends RikeEvent {

    constructor(private _operation: RikeOperation<any, any>, private _result: any) {
        super();
    }

    get operation(): RikeOperation<any, any> {
        return this._operation;
    }

    get complete(): boolean {
        return true;
    }

    get error(): undefined {
        return undefined;
    }

    get result(): any {
        return this._result;
    }

}

/**
 * An event emitted when operation on a REST-like resource is failed.
 *
 * An object of this type is also reported as error when some internal exception occurs.
 */
export class RikeErrorEvent extends RikeEvent {

    constructor(private _operation: RikeOperation<any, any>, private _error: any) {
        super();
    }

    get operation(): RikeOperation<any, any> {
        return this._operation;
    }

    get complete(): boolean {
        return true;
    }

    get error(): any {
        return this._error;
    }

    get result(): undefined {
        return undefined;
    }

}

/**
 * An event emitted when operation on a REST-like resource is cancelled.
 */
export class RikeCancelEvent extends RikeErrorEvent {

    constructor(operation: RikeOperation<any, any>, private _cause?: RikeOperationEvent) {
        super(operation, _cause || "cancel");
    }

    get cause(): RikeOperationEvent | undefined {
        return this._cause;
    }

}

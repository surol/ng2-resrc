import { EventEmitter } from "@angular/core";
import { RikeTarget, RikeOperation } from "./rike";
import { ErrorResponse } from "./protocol";
/**
 * REST-like resource access event emitter.
 *
 * Multiple instances of this class could be injected into controller or service to listen for Rike events.
 *
 * Use [provideEventSource] function to register event sources.
 */
export declare abstract class RikeEventSource {
    /**
     * Rike events emitter.
     */
    readonly abstract rikeEvents: EventEmitter<RikeEvent>;
}
/**
 * Basic REST-like resource access event.
 *
 * Such events are emitted by [Rike event sources][RikeEventsSource].
 */
export declare abstract class RikeEvent {
    /**
     * Operation target.
     */
    readonly target: RikeTarget<any, any>;
    /**
     * Rike operation.
     */
    readonly abstract operation: RikeOperation<any, any>;
    /**
     * Whether an operation is complete.
     *
     * `true` on error or successful completion event.
     */
    readonly abstract complete: boolean;
    /**
     * The error occurred.
     *
     * `undefined` if this is not an error event.
     */
    readonly abstract error?: any;
    /**
     * Error response.
     */
    readonly abstract errorResponse?: ErrorResponse;
    /**
     * Whether this is an operation cancel.
     *
     * @return {boolean} `true` if operation cancelled, or `false` otherwise.
     */
    readonly cancel: boolean;
    /**
     * The operation that cancelled this operation.
     */
    readonly abstract cancelledBy?: RikeOperationEvent;
    /**
     * Operation result, if any.
     */
    readonly abstract result?: any;
}
/**
 * An event emitted when operation on a REST-like resource is started.
 */
export declare class RikeOperationEvent extends RikeEvent {
    private _operation;
    constructor(_operation: RikeOperation<any, any>);
    readonly operation: RikeOperation<any, any>;
    readonly complete: boolean;
    readonly error: undefined;
    readonly errorResponse: undefined;
    readonly cancelledBy: undefined;
    readonly result: undefined;
}
/**
 * An event emitted when operation on a REST-like resource is successfully completed.
 */
export declare class RikeSuccessEvent extends RikeEvent {
    private _operation;
    private _result;
    constructor(_operation: RikeOperation<any, any>, _result: any);
    readonly operation: RikeOperation<any, any>;
    readonly complete: boolean;
    readonly error: undefined;
    readonly errorResponse: undefined;
    readonly cancelledBy: undefined;
    readonly result: any;
}
/**
 * An event emitted when operation on a REST-like resource is failed.
 *
 * An object of this type is also reported as an error when some internal exception occurs.
 */
export declare abstract class RikeErrorEvent extends RikeEvent {
    private _operation;
    private _error;
    constructor(_operation: RikeOperation<any, any>, _error: any);
    readonly operation: RikeOperation<any, any>;
    readonly complete: boolean;
    readonly error: any;
    readonly errorResponse: ErrorResponse | undefined;
    readonly cancelledBy: RikeOperationEvent | undefined;
    readonly result: undefined;
}
/**
 * An event emitted when operation on a REST-like resource caused an exception.
 *
 * An object of this type is reported as an error.
 */
export declare class RikeExceptionEvent extends RikeErrorEvent {
    private _errorResponse;
    constructor(operation: RikeOperation<any, any>, error: any, _errorResponse?: ErrorResponse);
    readonly errorResponse: ErrorResponse | undefined;
}
/**
 * An event emitted when operation on a REST-like resource returned error.
 */
export declare class RikeErrorResponseEvent extends RikeErrorEvent {
    private _errorResponse;
    constructor(operation: RikeOperation<any, any>, _errorResponse: ErrorResponse);
    readonly errorResponse: ErrorResponse;
}
/**
 * An event emitted when operation on a REST-like resource is cancelled.
 */
export declare class RikeCancelEvent extends RikeErrorEvent {
    private _cancelledBy;
    constructor(operation: RikeOperation<any, any>, _cancelledBy?: RikeOperationEvent);
    readonly error: RikeOperationEvent | undefined;
    readonly cancel: boolean;
    readonly cancelledBy: RikeOperationEvent | undefined;
}

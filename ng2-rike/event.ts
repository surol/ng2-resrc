/**
 * Basic REST-like resource access event.
 *
 * Such events are emitted by [operations on REST-like resources][RikeOperation.events].
 */
export abstract class RikeEvent {

    /**
     * Operation target.
     *
     * This is the value passed to the [Rike.target] method.
     */
    abstract readonly target: any;

    /**
     * Operation name.
     *
     * This is the value passed to the [RikeTarget.operation] method
     */
    abstract readonly operation: string;

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

    constructor(private _target: any, private _operation: string) {
        super();
    }

    get target(): any {
        return this._target;
    }

    get operation(): string {
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

    constructor(private _target: any, private _operation: string, private _result: any) {
        super();
    }

    get target(): any {
        return this._target;
    }

    get operation(): string {
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

    constructor(private _target: any, private _operation: string, private _error: any) {
        super();
    }

    get target(): any {
        return this._target;
    }

    get operation(): string {
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

    constructor(target: any, operation: string, private _cause?: RikeOperationEvent) {
        super(target, operation, _cause || "cancel");
    }

    get cause(): RikeOperationEvent | undefined {
        return this._cause;
    }

}

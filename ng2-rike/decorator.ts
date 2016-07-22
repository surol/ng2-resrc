import {RikeTarget, RikeOperation, Rike, requestMethod} from "./rike";
import {DataType} from "./data";
import {Observable} from "rxjs/Rx";
import {RequestOptionsArgs, URLSearchParams, Headers, RequestOptions, RequestMethod} from "@angular/http";

class InjectableTarget extends RikeTarget<any, any> {

    private _wrapped?: RikeTarget<any, any>;
    private _stack: RikeTarget<any, any>[] = [];

    constructor(private _rike: Rike) {
        super();
    }

    get target() {
        return this.wrapped.target;
    }

    get currentOperation() {
        return this.wrapped.currentOperation;
    }

    get rikeEvents() {
        return this.wrapped.rikeEvents;
    }

    get dataType() {
        return this.wrapped.dataType;
    }

    operation<T>(name: string, dataType?: DataType<any, any>): RikeOperation<any, any> {
        if (!dataType) {
            return this.wrapped.operation(name);
        }
        return this.wrapped.operation(name, dataType);
    }

    cancel(): boolean {
        return this.wrapped.cancel();
    }

    get wrapped(): RikeTarget<any, any> {
        if (!this._wrapped) {
            throw new Error("No current operations target");
        }
        return this._wrapped;
    }

    pushTarget(target: Object, dataType?: DataType<any, any>) {
        if (this._wrapped) {
            this._stack.push(this._wrapped);
            if (this._wrapped.target === target) {
                return;
            }
        }

        if (dataType) {
            this._wrapped = this._rike.target(target, dataType);
        } else {
            this._wrapped = this._rike.target(target);
        }
    }

    popTarget() {
        this._wrapped = this._stack.pop();
    }

}

class InjectableOperation extends RikeOperation<any, any> {

    private _wrapped?: RikeOperation<any, any>;
    private _stack: RikeOperation<any, any>[] = [];

    constructor(private _target: InjectableTarget) {
        super();
    }

    get target(): InjectableTarget {
        return this._target;
    }

    get name() {
        return this.wrapped.name;
    }

    get dataType() {
        return this.wrapped.dataType;
    }

    get options(): RequestOptions {
        return this.wrapped.options;
    }

    withOptions(options?: RequestOptionsArgs): this {
        this.wrapped.withOptions(options);
        return this;
    }

    load(url?: string, options?: RequestOptionsArgs): Observable<any> {
        return this.wrapped.load(url, options);
    }

    send(request: any, url?: string, options?: RequestOptionsArgs): Observable<any> {
        return this.wrapped.send(request, url, options);
    }

    get(url?: string, options?: RequestOptionsArgs): Observable<any> {
        return this.wrapped.get(url, options);
    }

    post(request: any, url?: string, options?: RequestOptionsArgs): Observable<any> {
        return this.wrapped.post(request, url, options);
    }

    put(request: any, url?: string, options?: RequestOptionsArgs): Observable<any> {
        return this.wrapped.put(request, url, options);
    }

    //noinspection ReservedWordAsName
    delete(url?: string, options?: RequestOptionsArgs): Observable<any> {
        return this.wrapped.delete(url, options);
    }

    patch(request: any, url?: string, options?: RequestOptionsArgs): Observable<any> {
        return this.wrapped.patch(request, url, options);
    }

    head(url?: string, options?: RequestOptionsArgs): Observable<any> {
        return this.wrapped.head(url, options);
    }

    get wrapped(): RikeOperation<any, any> {
        if (!this._wrapped) {
            throw new Error("No current operation");
        }
        return this._wrapped;
    }

    pushOperation(target: Object, name: string, dataType?: DataType<any, any>) {
        this._target.pushTarget(target);
        if (this._wrapped) {
            this._stack.push(this._wrapped);
        }

        if (dataType) {
            this._wrapped = this._target.operation(name, dataType);
        } else {
            this._wrapped = this._target.operation(name);
        }
    }

    popOperation() {
        try {
            this._wrapped = this._stack.pop();
        } finally {
            this._target.popTarget();
        }
    }

}

var injectableTarget: InjectableTarget;
var injectableOperation: InjectableOperation;

export const RIKE_OPERATION_PROVIDERS: any[] = [
    {
        provide: InjectableTarget,
        useFactory: (rike: Rike) => injectableTarget = new InjectableTarget(rike),
        deps: [Rike],
    },
    {
        provide: InjectableOperation,
        useFactory: (target: InjectableTarget) => injectableOperation = new InjectableOperation(target),
        deps: [InjectableTarget],
    }
];


function operation(): InjectableOperation {
    if (!injectableOperation) {
        throw new Error("Rike is not initialized yet");
    }
    return injectableOperation;
}

export interface OperationMetadata {
    name?: string;
    dataType?: DataType<any, any>;
    url?: string;
    search?: string | URLSearchParams;
    headers?: Headers | {[key: string]: any};
    withCredentials?: boolean;
}

export interface OperationWithMethodMetadata extends OperationMetadata {
    method?: string | RequestMethod;
}

function opDecorator(method?: string | RequestMethod, meta?: OperationMetadata): MethodDecorator {
    return (
        target: Object,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) => {

        const originalMethod = descriptor.value!;

        descriptor.value = function (...args: any[]) {

            const op = operation();
            const name = meta && meta.name || propertyKey.toString();
            const dataType = meta && meta.dataType;

            op.pushOperation(this, name, dataType);
            try {
                if (meta) {
                    op.withOptions({
                        url: meta.url,
                        search: meta.search,
                        headers: meta.headers && new Headers(meta.headers),
                        withCredentials: meta.withCredentials,
                    });
                    if (method != null) {
                        op.withMethod(method);
                    }
                }

                return originalMethod.apply(this, args);
            } finally {
                op.popOperation();
            }
        };

        return descriptor;
    };
}

export function RIKE(meta?: OperationWithMethodMetadata): MethodDecorator {
    return opDecorator(meta && meta.method, meta);
}

export function GET(meta?: OperationMetadata): MethodDecorator {
    return opDecorator(RequestMethod.Get, meta);
}

export function POST(meta?: OperationMetadata): MethodDecorator {
    return opDecorator(RequestMethod.Post, meta);
}

export function PUT(meta?: OperationMetadata): MethodDecorator {
    return opDecorator(RequestMethod.Put, meta);
}

export function DELETE(meta?: OperationMetadata): MethodDecorator {
    return opDecorator(RequestMethod.Delete, meta);
}

export function OPTIONS(meta?: OperationMetadata): MethodDecorator {
    return opDecorator(RequestMethod.Options, meta);
}

export function HEAD(opts?: OperationMetadata): MethodDecorator {
    return opDecorator(RequestMethod.Head, opts);
}

export function PATCH(opts?: OperationMetadata): MethodDecorator {
    return opDecorator(RequestMethod.Patch, opts);
}





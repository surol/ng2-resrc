import {Type} from "@angular/core";
import {URLSearchParams, Headers, RequestMethod} from "@angular/http";
import {DataType, JSON_DATA_TYPE, jsonDataType} from "./data";
import {RikeTarget, Rike, RikeOperation} from "./rike";
import {RikeEventSource} from "./event";

export abstract class Resource {

    static provide({provide, useClass, useValue, useExisting, useFactory, deps}: {
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
            RikeEventSource.provide({
                useFactory: (resource: Resource) => resource.rikeTarget,
                deps: [token],
            })
        ];
    }

    abstract readonly rikeTarget: RikeTarget<any, any>;

}

export interface LoadFn<OUT> {

    (): OUT;

}

export interface SendFn<IN, OUT> {

    (request: IN): OUT;

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

function opDecorator(method?: string | RequestMethod, meta?: OperationMetadata): PropertyDecorator {
    return function(target: Object, key: string | symbol) {

        const desc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(this, key);

        if (delete this[key]) {

            var fn: Function | undefined;

            const getter: () => Function = function() {
                if (fn) {
                    return fn;
                }

                const resource = this as Resource;
                const name = meta && meta.name || key.toString();
                let operation: RikeOperation<any, any>;

                if (meta && meta.dataType) {
                    operation = resource.rikeTarget.operation(name, meta.dataType);
                } else {
                    operation = resource.rikeTarget.operation(name);
                }

                if (meta) {
                    operation.withOptions({
                        url: meta.url,
                        search: meta.search,
                        headers: meta.headers && new Headers(meta.headers),
                        withCredentials: meta.withCredentials,
                    });
                }
                if (method != null) {
                    operation.withMethod(method);
                }

                switch (operation.method) {
                case RequestMethod.Post:
                case RequestMethod.Put:
                case RequestMethod.Patch:
                    return fn = (request: any) => operation.send(request);
                default:
                    return fn = () => operation.load();
                }
            };

            Object.defineProperty(target, key, {
                get: getter,
                writable: desc && desc.writable || false,
                enumerable: desc && desc.enumerable || true,
                configurable: desc && desc.configurable || true,
            });
        }
    };
}

export function RIKE(meta?: OperationWithMethodMetadata): PropertyDecorator {
    return opDecorator(meta && meta.method, meta);
}

export function GET(meta?: OperationMetadata): PropertyDecorator {
    return opDecorator(RequestMethod.Get, meta);
}

export function POST(meta?: OperationMetadata): PropertyDecorator {
    return opDecorator(RequestMethod.Post, meta);
}

export function PUT(meta?: OperationMetadata): PropertyDecorator {
    return opDecorator(RequestMethod.Put, meta);
}

export function DELETE(meta?: OperationMetadata): PropertyDecorator {
    return opDecorator(RequestMethod.Delete, meta);
}

export function OPTIONS(meta?: OperationMetadata): PropertyDecorator {
    return opDecorator(RequestMethod.Options, meta);
}

export function HEAD(opts?: OperationMetadata): PropertyDecorator {
    return opDecorator(RequestMethod.Head, opts);
}

export function PATCH(opts?: OperationMetadata): PropertyDecorator {
    return opDecorator(RequestMethod.Patch, opts);
}

export abstract class RikeResource implements Resource {

    private _rikeTarget?: RikeTarget<any, any>;

    constructor(private _rike: Rike) {
    }

    get rike(): Rike {
        return this._rike;
    }

    get rikeTarget(): RikeTarget<any, any> {
        return this.getRikeTarget();
    }

    getRikeTarget(): RikeTarget<any, any> {
        return this._rikeTarget || (this._rikeTarget = this.createRikeTarget());
    }

    protected createRikeTarget(): RikeTarget<any, any> {
        return this.rike.target(this, JSON_DATA_TYPE);
    }

}

export abstract class CRUDResource<T> extends RikeResource {

    constructor(rike: Rike) {
        super(rike);
    }

    get rikeTarget(): RikeTarget<T, T> {
        return this.getRikeTarget();
    }

    getRikeTarget(): RikeTarget<T, T> {
        return super.getRikeTarget();
    }

    protected createRikeTarget(): RikeTarget<T, T> {
        return this.rike.target(this, jsonDataType<T>());
    }

}

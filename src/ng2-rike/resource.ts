import {Type} from "@angular/core";
import {URLSearchParams, Headers, RequestMethod} from "@angular/http";
import {DataType} from "./data";
import {RikeTarget, Rike} from "./rike";
import {RikeEventSource} from "./event";

export abstract class Resource<IN, OUT> {

    static provide({provide, useClass, useValue, useExisting, useFactory, deps}: {
        provide: any,
        useClass?: Type;
        useValue?: any;
        useExisting?: any;
        useFactory?: Function;
        deps?: Object[];
        multi?: boolean;
    }): any {
        return [
            {
                provide: provide || Resource,
                useClass,
                useValue,
                useExisting,
                useFactory,
                deps,
            },
            RikeEventSource.provide({
                useFactory: (resource: Resource<any, any>) => resource.rikeTarget,
                deps: [Resource],
            })
        ];
    }

    abstract readonly rikeTarget: RikeTarget<IN, OUT>;

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

            const getter: () => Function = function() {

                const resource = this as Resource<any, any>;
                const operation = resource.rikeTarget.operation(meta && meta.name || key.toString());

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
                    return (request: any) => operation.send(request);
                default:
                    return () => operation.load();
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

export abstract class RikeResource<IN, OUT> implements Resource<IN, OUT> {

    private _rikeTarget?: RikeTarget<IN, OUT>;

    constructor(protected _rike: Rike) {
    }

    abstract getDataType(): DataType<IN, OUT>;

    get rikeTarget(): RikeTarget<IN, OUT> {
        return this._rikeTarget || (this._rikeTarget = this._rike.target(this, this.getDataType()));
    }

}

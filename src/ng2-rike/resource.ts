import {Type} from "@angular/core";
import {Response, RequestOptions} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {DataType, JSON_DATA_TYPE, jsonDataType} from "./data";
import {RikeEventSource} from "./event";
import {relativeUrl} from "./options";
import {RikeTarget, Rike} from "./rike";

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

    create(object: T): Observable<T> {
        return this.rikeTarget.operation(
            "create",
            this.rikeTarget.dataType.readResponseWith((response: Response) => this.objectCreated(object, response)))
            .post(object);
    }

    read(id: any): Observable<T> {
        return this.rikeTarget.operation("read", this.readDataType(id)).get();
    }

    update(object: T): Observable<T> {
        return this.rikeTarget.operation("update", this.updateDataType(object)).put(object);
    }

    //noinspection ReservedWordAsName
    delete(object: T): Observable<any> {
        return this.rikeTarget.operation("delete", this.deleteDataType(object)).delete();
    }

    protected createRikeTarget(): RikeTarget<T, T> {
        return this.rike.target(this, jsonDataType<T>());
    }

    //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
    protected objectCreated(object: T, _response: Response): T {
        return object;
    }

    protected readDataType(id: any): DataType<any, T> {
        return this.rikeTarget.dataType.prepareRequestWith(
            options => new RequestOptions(options).merge({
                url: this.objectUrl(options.url, id)
            }));
    }

    protected updateDataType(object: T): DataType<T, T> {
        return this.rikeTarget.dataType
            .prepareRequestWith(options => new RequestOptions(options).merge({
                url: this.objectUrl(options.url, this.objectId(object))
            }))
            .readResponseWith(response => object);
    }

    protected deleteDataType(object: T): DataType<T, any> {
        return this.rikeTarget.dataType
            .prepareRequestWith(options => new RequestOptions(options).merge({
                url: this.objectUrl(options.url, this.objectId(object))
            }))
            .readResponseWith(response => object)
    }

    protected abstract objectId(object: T): any;

    //noinspection JSMethodCanBeStatic
    protected objectUrl(baseUrl: string | undefined, id: any): string {
        return relativeUrl(baseUrl, id.toString());
    }

}

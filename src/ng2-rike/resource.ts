import {RequestOptions} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {Protocol, JSON_PROTOCOL, jsonProtocol} from "./protocol";
import {relativeUrl} from "./options";
import {RikeTarget, Rike} from "./rike";

export abstract class Resource {

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
        return this.rike.target(this, JSON_PROTOCOL);
    }

}

export abstract class LoadableResource<T> extends RikeResource {

    constructor(rike: Rike) {
        super(rike);
    }

    get rikeTarget(): RikeTarget<T, T> {
        return this.getRikeTarget();
    }

    getRikeTarget(): RikeTarget<T, T> {
        return super.getRikeTarget();
    }

    load(): Observable<T> {
        return this.rikeTarget.operation("load").get();
    }

    protected createRikeTarget(): RikeTarget<T, T> {
        return this.rike.target(this, jsonProtocol<T, T>());
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
        return this.rikeTarget.operation("create", this.objectCreateProtocol(object)).post(object);
    }

    read(id: any): Observable<T> {
        return this.rikeTarget.operation("read", this.objectReadProtocol(id)).get();
    }

    update(object: T): Observable<T> {
        return this.rikeTarget.operation("update", this.objectUpdateProtocol(object)).put(object);
    }

    //noinspection ReservedWordAsName
    delete(object: T): Observable<any> {
        return this.rikeTarget.operation("delete", this.objectDeleteProtocol(object)).delete();
    }

    protected createRikeTarget(): RikeTarget<T, T> {
        return this.rike.target(this, jsonProtocol<T, T>());
    }

    protected objectCreateProtocol(object: T): Protocol<any, T> {
        return this.rikeTarget.protocol.instead().readResponse(response => object);
    }

    protected objectReadProtocol(id: any): Protocol<any, T> {
        return this.rikeTarget.protocol.prior().prepareRequest(
            options => new RequestOptions(options).merge({
                url: this.objectUrl(options.url, id)
            }));
    }

    protected objectUpdateProtocol(object: T): Protocol<T, T> {
        return this.rikeTarget.protocol
            .prior()
            .updateRequest((object, options) => new RequestOptions(options).merge({
                url: this.objectUrl(options.url, this.objectId(object))
            }))
            .instead()
            .readResponse(response => object);
    }

    protected objectDeleteProtocol(object: T): Protocol<T, any> {
        return this.rikeTarget.protocol
            .prior()
            .updateRequest((object, options) => new RequestOptions(options).merge({
                url: this.objectUrl(options.url, this.objectId(object))
            }))
            .instead()
            .readResponse(response => object)
    }

    protected abstract objectId(object: T): any;

    //noinspection JSMethodCanBeStatic
    protected objectUrl(baseUrl: string | undefined, id: any): string {
        return relativeUrl(baseUrl, id.toString());
    }

}

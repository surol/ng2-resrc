import {RequestOptions, RequestOptionsArgs} from "@angular/http";
import {Observable, Observer} from "rxjs/Rx";
import {Protocol, JSON_PROTOCOL, jsonProtocol} from "./protocol";
import {relativeUrl} from "./options";
import {RikeTarget, Rike} from "./rike";

/**
 * An interface of REST-like resources.
 *
 * An operations target is created per resource with a resource instance as target value. All operations on this
 * resource should be performed using this target.
 *
 * This class can be used as a token for resources. It can be registered as Angular service with {{provideResource}}.
 */
export abstract class Resource {

    /**
     * Rike operations target for this resource.
     *
     * @return {RikeTarget<any, any>}
     */
    abstract readonly rikeTarget: RikeTarget<any, any>;

}

/**
 * Abstract implementation of REST-like resource.
 */
export abstract class RikeResource implements Resource {

    private _rikeTarget?: RikeTarget<any, any>;

    constructor(private _rike: Rike) {
    }

    /**
     * Rike interface instance.
     */
    get rike(): Rike {
        return this._rike;
    }

    /**
     * Rike operations target for this resource.
     *
     * @return {RikeTarget<any, any>} the result of `this.getRikeTarget()` call.
     */
    get rikeTarget(): RikeTarget<any, any> {
        return this.getRikeTarget();
    }

    /**
     * Rike operations target for this resource.
     *
     * Creates Rike target when needed by calling `createRikeTarget()` method.
     *
     * @return {RikeTarget<any, any>}
     */
    getRikeTarget(): RikeTarget<any, any> {
        return this._rikeTarget || (this._rikeTarget = this.createRikeTarget());
    }

    /**
     * Creates Rike operation target for this resource.
     *
     * This method is called by `getRikeTarget()` method on demand.
     *
     * @return {RikeTarget<any, any>} new Rike target.
     */
    protected createRikeTarget(): RikeTarget<any, any> {
        return this.rike.target(this, JSON_PROTOCOL);
    }

}

/**
 * Loadable resource.
 *
 * It is able to load arbitrary data from the server. By default expects a JSON data. Override `createRikeTarget()`
 * method to change it. When loaded the data will be cached. Call `reload()` method to reload it.
 *
 * @param <T> loaded data type.
 */
export abstract class LoadableResource<T> extends RikeResource {

    private _data?: T;

    constructor(rike: Rike) {
        super(rike);
    }

    get rikeTarget(): RikeTarget<T, T> {
        return this.getRikeTarget();
    }

    getRikeTarget(): RikeTarget<T, T> {
        return super.getRikeTarget();
    }

    /**
     * Loaded data.
     *
     * @return {T} `undefined` if data is not loaded yet.
     */
    get data(): T | undefined {
        return this._data;
    }

    /**
     * Loads data from server if not loaded yet.
     *
     * @return {Observable<T>}
     */
    load(): Observable<T> {

        const data = this.data;

        if (data) {
            return Observable.of<T>(data);
        }

        return new Observable<T>((observer: Observer<T>) => {
            this.rikeTarget
                .operation("load")
                .get()
                .subscribe(
                    (data: T) => {
                        this._data = data;
                        observer.next(data);
                    },
                    error => observer.error(error),
                    () => observer.complete());
        });
    }

    /**
     * Reloads data from server.
     */
    reload(): Observable<T> {
        this.reset();
        return this.load();
    }

    /**
     * Resets the resource by cleaning cached data.
     */
    reset() {
        this._data = undefined;
    }

    protected createRikeTarget(): RikeTarget<T, T> {
        return this.rike.target(this, jsonProtocol<T, T>());
    }

}

/**
 * CRUD (Create, Load, Update, Delete) resource.
 *
 * It is able to manipulate with server objects. By default it operates over JSON protocol.
 * Override `createRikeTarget()` method to change it.
 */
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

    /**
     * Creates an object on the server.
     *
     * Sends `POST` HTTP request. Uses protocol returned from `this.objectCreateProtocol(object)` method.
     *
     * @param object an object to create.
     *
     * @return {Observable<O>}
     */
    create(object: T): Observable<T> {
        return this.rikeTarget.operation("create", this.objectCreateProtocol(object)).post(object);
    }

    /**
     * Reads an object from the server.
     *
     * Sends `GET` HTTP request. Uses protocol returned from `this.objectReadProtocol(id)` method call.
     *
     * @param id an identifier of object to read.
     *
     * @return {Observable<O>}
     */
    read(id: any): Observable<T> {
        return this.rikeTarget.operation("read", this.objectReadProtocol(id)).get();
    }

    /**
     * Updates an object on the server.
     *
     * Sends `POST` HTTP request. Uses protocol returned from `this.objectUpdateProtocol(object)` method call.
     *
     * @param object an object to update.
     *
     * @return {Observable<O>}
     */
    update(object: T): Observable<T> {
        return this.rikeTarget.operation("update", this.objectUpdateProtocol(object)).put(object);
    }

    /**
     * Deletes an object on the server.
     *
     * Sends `DELETE` HTTP request. Uses protocol returned from `this.objectDeleteProtocol(object)` method call.
     *
     * @param object an object to delete.
     *
     * @return {Observable<any>}
     */
    //noinspection ReservedWordAsName
    delete(object: T): Observable<any> {
        return this.rikeTarget.operation("delete", this.objectDeleteProtocol(object)).delete();
    }

    protected createRikeTarget(): RikeTarget<T, T> {
        return this.rike.target(this, jsonProtocol<T, T>());
    }

    /**
     * Constructs object creation protocol.
     *
     * @param object an object to create.
     *
     * @return {Protocol<T, T>} creation protocol.
     */
    protected objectCreateProtocol(object: T): Protocol<any, T> {
        return this.rikeTarget.protocol.instead().readResponse(response => object);
    }

    /**
     * Constructs object read protocol.
     *
     * This protocol updates request URL with `objectUrl()` by default.
     *
     * @param id an identifier of object to read.
     *
     * @return {Protocol<T, T>} read protocol.
     */
    protected objectReadProtocol(id: any): Protocol<any, T> {
        return this.rikeTarget.protocol.prior()
            .prepareRequest(options => this.objectReadOptions(options, id));
    }

    /**
     * Updates object read request options.
     *
     * By default returns the result of `objectOptions()` method call.
     *
     * This method is used by `objectReadProtocol()` method.
     *
     * @param options original request options.
     * @param id an identifier of object to read.
     *
     * @return {RequestOptionsArgs} updated request options.
     */
    protected objectReadOptions(options: RequestOptionsArgs, id: any): RequestOptionsArgs {
        return this.objectOptions(options, id);
    }

    /**
     * Constructs object update protocol.
     *
     * This protocol detects object identifier with `objectId()` method and updates request URL with `objectUrl()`
     * by default.
     *
     * @param object an object to update.
     *
     * @return {Protocol<T, T>} update protocol.
     */
    protected objectUpdateProtocol(object: T): Protocol<T, T> {
        return this.rikeTarget.protocol
            .prior()
            .updateRequest((object, options) => this.objectUpdateOptions(options, object))
            .instead()
            .readResponse(response => object);
    }

    //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
    /**
     * Updates the given object update request options.
     *
     * By default returns original options.
     *
     * This method is used by `objectUpdateProtocol()` method and can be overridden e.g. to call an
     * `objectOptions()` method.
     *
     * @param options original request options.
     * @param object object to update.
     *
     * @return {RequestOptionsArgs} updated request options.
     */
    protected objectUpdateOptions(options: RequestOptionsArgs, object: T): RequestOptionsArgs {
        return options;
    }

    /**
     * Constructs object deletion protocol.
     *
     * This protocol detects object identifier with `objectId()` method and updates request URL with `objectUrl()`
     * by default.
     *
     * @param object an object to delete.
     *
     * @return {Protocol<T, T>} deletion protocol.
     */
    protected objectDeleteProtocol(object: T): Protocol<T, any> {
        return this.rikeTarget.protocol
            .prior()
            .updateRequest((object, options) => this.objectDeleteOptions(options, object))
            .instead()
            .readResponse(response => object)
    }

    /**
     * Updates object delete request options.
     *
     * By default returns the result of `objectOptions()` method call.
     *
     * This method is used by `objectDeleteProtocol()` method.
     *
     * @param options original request options.
     * @param object an object to delete.
     *
     * @return {RequestOptionsArgs} updated request options.
     */
    protected objectDeleteOptions(options: RequestOptionsArgs, object: T): RequestOptionsArgs {
        return this.objectOptions(options, this.objectId(object));
    }

    /**
     * Detects object identifier.
     *
     * @param object target object.
     *
     * @returns target object's identifier.
     */
    protected abstract objectId(object: T): any;

    //noinspection JSMethodCanBeStatic
    /**
     * Updates request options for object with the given identifier.
     *
     * By default appends object identifier as URL-encoded string to the base URL.
     *
     * @param options original request options.
     * @param id object identifier.
     *
     * @return {RequestOptionsArgs} updated request options.
     */
    protected objectOptions(options: RequestOptionsArgs, id: any): RequestOptionsArgs {
        return new RequestOptions(options).merge({
            url: relativeUrl(options.url, encodeURIComponent(id.toString()))
        });
    }

}

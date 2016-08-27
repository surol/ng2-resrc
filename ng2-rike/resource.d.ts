import { Observable } from "rxjs/Rx";
import { Protocol } from "./protocol";
import { RikeTarget, Rike } from "./rike";
/**
 * An interface of REST-like resources.
 *
 * An operations target is created per resource with a resource instance as target value. All operations on this
 * resource should be performed using this target.
 *
 * This class can be used as a token for resources. It can be registered as Angular service with {{provideResource}}.
 */
export declare abstract class Resource {
    /**
     * Rike operations target for this resource.
     *
     * @return {RikeTarget<any, any>}
     */
    readonly abstract rikeTarget: RikeTarget<any, any>;
}
/**
 * Abstract implementation of REST-like resource.
 */
export declare abstract class RikeResource implements Resource {
    private _rike;
    private _rikeTarget?;
    constructor(_rike: Rike);
    /**
     * Rike interface instance.
     */
    readonly rike: Rike;
    /**
     * Rike operations target for this resource.
     *
     * @return {RikeTarget<any, any>} the result of `this.getRikeTarget()` call.
     */
    readonly rikeTarget: RikeTarget<any, any>;
    /**
     * Rike operations target for this resource.
     *
     * Creates Rike target when needed by calling `createRikeTarget()` method.
     *
     * @return {RikeTarget<any, any>}
     */
    getRikeTarget(): RikeTarget<any, any>;
    /**
     * Creates Rike operation target for this resource.
     *
     * This method is called by `getRikeTarget()` method on demand.
     *
     * @return {RikeTarget<any, any>} new Rike target.
     */
    protected createRikeTarget(): RikeTarget<any, any>;
}
/**
 * Loadable resource.
 *
 * It is able to load arbitrary data from the server. By default expects a JSON data. Override `createRikeTarget()`
 * method to change it. When loaded the data will be cached. Call `reload()` method to reload it.
 *
 * @param <T> loaded data type.
 */
export declare abstract class LoadableResource<T> extends RikeResource {
    private _data?;
    constructor(rike: Rike);
    readonly rikeTarget: RikeTarget<T, T>;
    getRikeTarget(): RikeTarget<T, T>;
    /**
     * Loaded data.
     *
     * @return {T} `undefined` if data is not loaded yet.
     */
    readonly data: T | undefined;
    /**
     * Loads data from server if not loaded yet.
     *
     * @return {Observable<T>}
     */
    load(): Observable<T>;
    /**
     * Reloads data from server.
     */
    reload(): Observable<T>;
    /**
     * Resets the resource by cleaning cached data.
     */
    reset(): void;
    protected createRikeTarget(): RikeTarget<T, T>;
}
/**
 * CRUD (Create, Load, Update, Delete) resource.
 *
 * It is able to manipulate with server objects. By default it operates over JSON protocol.
 * Override `createRikeTarget()` method to change it.
 */
export declare abstract class CRUDResource<T> extends RikeResource {
    constructor(rike: Rike);
    readonly rikeTarget: RikeTarget<T, T>;
    getRikeTarget(): RikeTarget<T, T>;
    /**
     * Creates an object on the server.
     *
     * Sends `POST` HTTP request. Uses protocol returned from `this.objectCreateProtocol(object)` method.
     *
     * @param object an object to create.
     *
     * @return {Observable<O>}
     */
    create(object: T): Observable<T>;
    /**
     * Reads an object from the server.
     *
     * Sends `GET` HTTP request. Uses protocol returned from `this.objectReadProtocol(id)` method call.
     *
     * @param id an identifier of object to read.
     *
     * @return {Observable<O>}
     */
    read(id: any): Observable<T>;
    /**
     * Updates an object on the server.
     *
     * Sends `POST` HTTP request. Uses protocol returned from `this.objectUpdateProtocol(object)` method call.
     *
     * @param object an object to update.
     *
     * @return {Observable<O>}
     */
    update(object: T): Observable<T>;
    /**
     * Deletes an object on the server.
     *
     * Sends `DELETE` HTTP request. Uses protocol returned from `this.objectDeleteProtocol(object)` method call.
     *
     * @param object an object to delete.
     *
     * @return {Observable<any>}
     */
    delete(object: T): Observable<any>;
    protected createRikeTarget(): RikeTarget<T, T>;
    /**
     * Constructs object creation protocol.
     *
     * @param object an object to create.
     *
     * @return {Protocol<T, T>} creation protocol.
     */
    protected objectCreateProtocol(object: T): Protocol<any, T>;
    /**
     * Constructs object read protocol.
     *
     * This protocol updates request URL with `objectUrl()` by default.
     *
     * @param id an identifier of object to read.
     *
     * @return {Protocol<T, T>} read protocol.
     */
    protected objectReadProtocol(id: any): Protocol<any, T>;
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
    protected objectUpdateProtocol(object: T): Protocol<T, T>;
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
    protected objectDeleteProtocol(object: T): Protocol<T, any>;
    /**
     * Detects object identifier.
     *
     * @param object target object.
     *
     * @returns target object's identifier.
     */
    protected abstract objectId(object: T): any;
    /**
     * Updates base URL with object URL.
     *
     * By default append object identifier as URL-encoded string to the base URL.
     *
     * @param baseUrl base URL to update.
     * @param id object identifier.
     *
     * @return {string} updated URL.
     */
    protected objectUrl(baseUrl: string | undefined, id: any): string;
}

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Rx";
import { JSON_PROTOCOL, jsonProtocol } from "./protocol";
import { relativeUrl } from "./options";
/**
 * An interface of REST-like resources.
 *
 * An operations target is created per resource with a resource instance as target value. All operations on this
 * resource should be performed using this target.
 *
 * This class can be used as a token for resources. It can be registered as Angular service with {{provideResource}}.
 */
var Resource = (function () {
    function Resource() {
    }
    Object.defineProperty(Resource.prototype, "rikeEvents", {
        get: function () {
            return this.rikeTarget.rikeEvents;
        },
        enumerable: true,
        configurable: true
    });
    return Resource;
}());
export { Resource };
/**
 * Abstract implementation of REST-like resource.
 */
var RikeResource = (function (_super) {
    __extends(RikeResource, _super);
    function RikeResource(_rike) {
        var _this = _super.call(this) || this;
        _this._rike = _rike;
        return _this;
    }
    Object.defineProperty(RikeResource.prototype, "rike", {
        /**
         * Rike interface instance.
         */
        get: function () {
            return this._rike;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RikeResource.prototype, "rikeTarget", {
        /**
         * Rike operations target for this resource.
         *
         * @return {RikeTarget<any, any>} the result of `this.getRikeTarget()` call.
         */
        get: function () {
            return this.getRikeTarget();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Rike operations target for this resource.
     *
     * Creates Rike target when needed by calling `createRikeTarget()` method.
     *
     * @return {RikeTarget<any, any>}
     */
    RikeResource.prototype.getRikeTarget = function () {
        return this._rikeTarget || (this._rikeTarget = this.createRikeTarget());
    };
    /**
     * Creates Rike operation target for this resource.
     *
     * This method is called by `getRikeTarget()` method on demand.
     *
     * @return {RikeTarget<any, any>} new Rike target.
     */
    RikeResource.prototype.createRikeTarget = function () {
        return this.rike.target(this, JSON_PROTOCOL);
    };
    return RikeResource;
}(Resource));
export { RikeResource };
/**
 * Loadable resource.
 *
 * It is able to load arbitrary data from the server. By default expects a JSON data. Override `createRikeTarget()`
 * method to change it. When loaded the data will be cached. Call `reload()` method to reload it.
 *
 * @param <T> loaded data type.
 */
var LoadableResource = (function (_super) {
    __extends(LoadableResource, _super);
    function LoadableResource(rike) {
        return _super.call(this, rike) || this;
    }
    Object.defineProperty(LoadableResource.prototype, "rikeTarget", {
        get: function () {
            return this.getRikeTarget();
        },
        enumerable: true,
        configurable: true
    });
    LoadableResource.prototype.getRikeTarget = function () {
        return _super.prototype.getRikeTarget.call(this);
    };
    Object.defineProperty(LoadableResource.prototype, "data", {
        /**
         * Loaded data.
         *
         * @return {T} `undefined` if data is not loaded yet.
         */
        get: function () {
            return this._data;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Loads data from server if not loaded yet.
     *
     * @return {Observable<T>}
     */
    LoadableResource.prototype.load = function () {
        var _this = this;
        var data = this.data;
        if (data) {
            return Observable.of(data);
        }
        return new Observable(function (observer) {
            var subscription = _this.rikeTarget
                .operation("load")
                .get()
                .subscribe(function (data) {
                _this._data = data;
                observer.next(data);
            }, function (error) { return observer.error(error); }, function () { return observer.complete(); });
            return function () { return subscription.unsubscribe(); };
        });
    };
    /**
     * Reloads data from server.
     */
    LoadableResource.prototype.reload = function () {
        this.reset();
        return this.load();
    };
    /**
     * Resets the resource by cleaning cached data.
     */
    LoadableResource.prototype.reset = function () {
        this._data = undefined;
    };
    LoadableResource.prototype.createRikeTarget = function () {
        return this.rike.target(this, jsonProtocol());
    };
    return LoadableResource;
}(RikeResource));
export { LoadableResource };
/**
 * CRUD (Create, Load, Update, Delete) resource.
 *
 * It is able to manipulate with server objects. By default it operates over JSON protocol.
 * Override `createRikeTarget()` method to change it.
 */
var CRUDResource = (function (_super) {
    __extends(CRUDResource, _super);
    function CRUDResource(rike) {
        return _super.call(this, rike) || this;
    }
    Object.defineProperty(CRUDResource.prototype, "rikeTarget", {
        get: function () {
            return this.getRikeTarget();
        },
        enumerable: true,
        configurable: true
    });
    CRUDResource.prototype.getRikeTarget = function () {
        return _super.prototype.getRikeTarget.call(this);
    };
    /**
     * Creates an object on the server.
     *
     * Sends `POST` HTTP request. Uses protocol returned from `this.objectCreateProtocol(object)` method.
     *
     * @param object an object to create.
     *
     * @return {Observable<O>}
     */
    CRUDResource.prototype.create = function (object) {
        return this.rikeTarget.operation("create", this.objectCreateProtocol(object)).post(object);
    };
    /**
     * Reads an object from the server.
     *
     * Sends `GET` HTTP request. Uses protocol returned from `this.objectReadProtocol(id)` method call.
     *
     * @param id an identifier of object to read.
     *
     * @return {Observable<O>}
     */
    CRUDResource.prototype.read = function (id) {
        return this.rikeTarget.operation("read", this.objectReadProtocol(id)).get();
    };
    /**
     * Updates an object on the server.
     *
     * Sends `POST` HTTP request. Uses protocol returned from `this.objectUpdateProtocol(object)` method call.
     *
     * @param object an object to update.
     *
     * @return {Observable<O>}
     */
    CRUDResource.prototype.update = function (object) {
        return this.rikeTarget.operation("update", this.objectUpdateProtocol(object)).put(object);
    };
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
    CRUDResource.prototype.delete = function (object) {
        return this.rikeTarget.operation("delete", this.objectDeleteProtocol(object)).delete();
    };
    CRUDResource.prototype.createRikeTarget = function () {
        return this.rike.target(this, jsonProtocol());
    };
    /**
     * Constructs object creation protocol.
     *
     * @param object an object to create.
     *
     * @return {Protocol<T, T>} creation protocol.
     */
    CRUDResource.prototype.objectCreateProtocol = function (object) {
        return this.rikeTarget.protocol.instead().readResponse(function (response) { return object; });
    };
    /**
     * Constructs object read protocol.
     *
     * This protocol updates request URL with `objectUrl()` by default.
     *
     * @param id an identifier of object to read.
     *
     * @return {Protocol<T, T>} read protocol.
     */
    CRUDResource.prototype.objectReadProtocol = function (id) {
        var _this = this;
        return this.rikeTarget.protocol.prior()
            .prepareRequest(function (options) { return _this.objectReadOptions(options, id); });
    };
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
    CRUDResource.prototype.objectReadOptions = function (options, id) {
        return this.objectOptions(options, id);
    };
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
    CRUDResource.prototype.objectUpdateProtocol = function (object) {
        var _this = this;
        return this.rikeTarget.protocol
            .prior()
            .updateRequest(function (object, options) { return _this.objectUpdateOptions(options, object); })
            .instead()
            .readResponse(function (response) { return object; });
    };
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
    CRUDResource.prototype.objectUpdateOptions = function (options, object) {
        return options;
    };
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
    CRUDResource.prototype.objectDeleteProtocol = function (object) {
        var _this = this;
        return this.rikeTarget.protocol
            .prior()
            .updateRequest(function (object, options) { return _this.objectDeleteOptions(options, object); })
            .instead()
            .readResponse(function (response) { return object; });
    };
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
    CRUDResource.prototype.objectDeleteOptions = function (options, object) {
        return this.objectOptions(options, this.objectId(object));
    };
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
    CRUDResource.prototype.objectOptions = function (options, id) {
        return new RequestOptions(options).merge({
            url: relativeUrl(options.url || undefined, encodeURIComponent(id.toString()))
        });
    };
    return CRUDResource;
}(RikeResource));
export { CRUDResource };
//# sourceMappingURL=resource.js.map
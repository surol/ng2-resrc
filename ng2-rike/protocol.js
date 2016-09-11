var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { RequestOptions, Headers } from "@angular/http";
/**
 * REST-like operations protocol.
 *
 * It is used by REST-like operations to encode operation requests to HTTP, decode operation responses from HTTP,
 * and handle errors.
 *
 * `IN` is operation request type.
 * `OUT` is operation response type.
 */
export var Protocol = (function () {
    function Protocol() {
    }
    //noinspection JSMethodCanBeStatic
    /**
     * Prepares HTTP request.
     *
     * The `options` passed have at least `url` and `method` fields set.
     *
     * This method is called for each HTTP request before _writeRequest_ method. When default protocol is set for
     * operation target, this method is called first on the default protocol, and then - on the operation protocol.
     *
     * @param options original HTTP request options.
     *
     * @returns modified HTTP request options to use further instead of original ones. Returns unmodified request
     * `options` by default.
     */
    Protocol.prototype.prepareRequest = function (options) {
        return options;
    };
    //noinspection JSMethodCanBeStatic
    /**
     * Handles HTTP error.
     *
     * Does not modify error response by default.
     *
     * @param error error response to handle.
     *
     * @returns error processing result.
     */
    Protocol.prototype.handleError = function (error) {
        return error;
    };
    /**
     * Creates protocol addon able to prepend protocol actions with specified functions.
     *
     * @return {ProtocolPre<IN, OUT>} protocol addon.
     */
    Protocol.prototype.prior = function () {
        return new CustomProtocolPre(this);
    };
    /**
     * Creates protocol addon able to append specified functions to protocol actions.
     *
     * @return {ProtocolPost<IN, OUT>} protocol addon.
     */
    Protocol.prototype.then = function () {
        return new CustomProtocolPost(this);
    };
    /**
     * Creates protocol modifier able to replace protocol actions with specified functions.
     *
     * @return {ProtocolMod<IN, OUT>} protocol modifier.
     */
    Protocol.prototype.instead = function () {
        return new CustomProtocolMod(this);
    };
    return Protocol;
}());
var CustomProtocolAddon = (function () {
    function CustomProtocolAddon(_protocol, _prior) {
        this._protocol = _protocol;
        this._prior = _prior;
    }
    CustomProtocolAddon.prototype.prepareRequest = function (prepare) {
        var _this = this;
        return new CustomProtocol(this._prior
            ? function (options) { return _this._protocol.prepareRequest(prepare(options)); }
            : function (options) { return prepare(_this._protocol.prepareRequest(options)); }, function (request, options) { return _this._protocol.writeRequest(request, options); }, function (response) { return _this._protocol.readResponse(response); }, function (error) { return _this._protocol.handleError(error); });
    };
    CustomProtocolAddon.prototype.updateRequest = function (update) {
        var _this = this;
        return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(options); }, this._prior
            ? function (request, options) { return _this._protocol.writeRequest(request, update(request, options)); }
            : function (request, options) { return update(request, _this._protocol.writeRequest(request, options)); }, function (response) { return _this._protocol.readResponse(response); }, function (error) { return _this._protocol.handleError(error); });
    };
    CustomProtocolAddon.prototype.handleError = function (handle) {
        var _this = this;
        return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(options); }, function (request, options) { return _this._protocol.writeRequest(request, options); }, function (response) { return _this._protocol.readResponse(response); }, this._prior
            ? function (error) { return _this._protocol.handleError(handle(error)); }
            : function (error) { return handle(_this._protocol.handleError(error)); });
    };
    CustomProtocolAddon.prototype.apply = function (protocol) {
        var _this = this;
        if (this._prior) {
            return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(protocol.prepareRequest(options)); }, function (request, options) { return _this._protocol.writeRequest(request, options); }, function (response) { return _this._protocol.readResponse(response); }, function (error) { return _this._protocol.handleError(protocol.handleError(error)); });
        }
        return new CustomProtocol(function (options) { return protocol.prepareRequest(_this._protocol.prepareRequest(options)); }, function (request, options) { return _this._protocol.writeRequest(request, options); }, function (response) { return _this._protocol.readResponse(response); }, function (error) { return protocol.handleError(_this._protocol.handleError(error)); });
    };
    return CustomProtocolAddon;
}());
var CustomProtocolPre = (function (_super) {
    __extends(CustomProtocolPre, _super);
    function CustomProtocolPre(protocol) {
        _super.call(this, protocol, true);
    }
    CustomProtocolPre.prototype.input = function (convert) {
        var _this = this;
        return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(options); }, function (request, options) { return _this._protocol.writeRequest(convert(request), options); }, function (response) { return _this._protocol.readResponse(response); }, function (error) { return _this._protocol.handleError(error); });
    };
    return CustomProtocolPre;
}(CustomProtocolAddon));
var CustomProtocolPost = (function (_super) {
    __extends(CustomProtocolPost, _super);
    function CustomProtocolPost(protocol) {
        _super.call(this, protocol, false);
    }
    CustomProtocolPost.prototype.output = function (convert) {
        var _this = this;
        return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(options); }, function (request, options) { return _this._protocol.writeRequest(request, options); }, function (httpResponse) { return convert(_this._protocol.readResponse(httpResponse), httpResponse); }, function (error) { return _this._protocol.handleError(_this._protocol.handleError(error)); });
    };
    return CustomProtocolPost;
}(CustomProtocolAddon));
var CustomProtocolMod = (function () {
    function CustomProtocolMod(_protocol) {
        this._protocol = _protocol;
    }
    CustomProtocolMod.prototype.prepareRequest = function (prepare) {
        var _this = this;
        return new CustomProtocol(prepare, function (request, options) { return _this._protocol.writeRequest(request, options); }, function (response) { return _this._protocol.readResponse(response); }, this._protocol.handleError);
    };
    CustomProtocolMod.prototype.writeRequest = function (write) {
        var _this = this;
        return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(options); }, write, function (response) { return _this._protocol.readResponse(response); }, this._protocol.handleError);
    };
    CustomProtocolMod.prototype.readResponse = function (read) {
        var _this = this;
        return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(options); }, function (request, options) { return _this._protocol.writeRequest(request, options); }, read, this._protocol.handleError);
    };
    CustomProtocolMod.prototype.handleError = function (handle) {
        var _this = this;
        return new CustomProtocol(function (options) { return _this._protocol.prepareRequest(options); }, function (request, options) { return _this._protocol.writeRequest(request, options); }, function (response) { return _this._protocol.readResponse(response); }, handle);
    };
    return CustomProtocolMod;
}());
var CustomProtocol = (function (_super) {
    __extends(CustomProtocol, _super);
    function CustomProtocol(_prepareRequest, _writeRequest, _readResponse, _handleError) {
        _super.call(this);
        this._prepareRequest = _prepareRequest;
        this._writeRequest = _writeRequest;
        this._readResponse = _readResponse;
        this._handleError = _handleError;
    }
    CustomProtocol.prototype.prepareRequest = function (options) {
        return this._prepareRequest(options);
    };
    CustomProtocol.prototype.writeRequest = function (request, options) {
        return this._writeRequest(request, options);
    };
    CustomProtocol.prototype.readResponse = function (response) {
        return this._readResponse(response);
    };
    CustomProtocol.prototype.handleError = function (error) {
        return this._handleError(error);
    };
    return CustomProtocol;
}(Protocol));
var JsonProtocol = (function (_super) {
    __extends(JsonProtocol, _super);
    function JsonProtocol() {
        _super.apply(this, arguments);
    }
    JsonProtocol.prototype.writeRequest = function (request, options) {
        var opts = new RequestOptions(options).merge({ body: JSON.stringify(request) });
        var headers;
        if (opts.headers) {
            headers = opts.headers;
        }
        else {
            opts.headers = headers = new Headers();
        }
        headers.set("Content-Type", "application/json");
        return opts;
    };
    JsonProtocol.prototype.readResponse = function (response) {
        return response.json();
    };
    return JsonProtocol;
}(Protocol));
/**
 * JSON protocol.
 *
 * Sends and receives arbitrary data as JSON over HTTP.
 *
 * @type {Protocol<any>}
 */
export var JSON_PROTOCOL = new JsonProtocol();
/**
 * Returns JSON protocol.
 *
 * Sends and receives the data of the given type as JSON over HTTP.
 */
export var jsonProtocol = function () { return JSON_PROTOCOL; };
var HttpProtocol = (function (_super) {
    __extends(HttpProtocol, _super);
    function HttpProtocol() {
        _super.apply(this, arguments);
    }
    HttpProtocol.prototype.writeRequest = function (request, options) {
        return new RequestOptions(options).merge({ body: request });
    };
    HttpProtocol.prototype.readResponse = function (response) {
        return response;
    };
    return HttpProtocol;
}(Protocol));
/**
 * HTTP protocol.
 *
 * The request type is any. It is used as request body.
 *
 * @type {Protocol<any, Response>}
 */
export var HTTP_PROTOCOL = new HttpProtocol();
//# sourceMappingURL=protocol.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Response, RequestOptions, ResponseOptions } from "@angular/http";
import { Protocol, JSON_PROTOCOL } from "./protocol";
var TestProtocol = (function (_super) {
    __extends(TestProtocol, _super);
    function TestProtocol() {
        _super.call(this);
    }
    TestProtocol.prototype.prepareRequest = function (options) {
        return new RequestOptions(options).merge({ url: "/request", search: "prepared=true" });
    };
    TestProtocol.prototype.writeRequest = function (request, options) {
        request.written = "written1";
        return new RequestOptions(options).merge({ body: request });
    };
    TestProtocol.prototype.readResponse = function (response) {
        return {
            response: "response1"
        };
    };
    return TestProtocol;
}(Protocol));
describe("Protocol", function () {
    var protocol = new TestProtocol();
    it("prepares request before", function () {
        var proto = protocol.prior().prepareRequest(function (opts) { return new RequestOptions(opts).merge({ search: "updated=true" }); });
        var opts = proto.prepareRequest({});
        expect(opts.url).toBe("/request");
        expect(opts.search && opts.search.toString()).toEqual("prepared=true");
    });
    it("prepares request after", function () {
        var proto = protocol.then().prepareRequest(function (opts) { return new RequestOptions(opts).merge({ search: "updated=true" }); });
        var opts = proto.prepareRequest({});
        expect(opts.url).toBe("/request");
        expect(opts.search && opts.search.toString()).toEqual("updated=true");
    });
    it("writes request", function () {
        var proto = protocol.instead().writeRequest(function (request, opts) {
            return new RequestOptions(opts).merge({ body: request.request2 });
        });
        var opts = proto.writeRequest({ request2: "request2" }, {});
        expect(opts.body).toBe("request2");
    });
    it("updates request before it is written", function () {
        var proto = protocol.prior().updateRequest(function (request, opts) {
            request.update = "update1";
            request.written = "rewritten1";
            return new RequestOptions(opts).merge({ body: request });
        });
        var opts = proto.writeRequest({ request: "request1" }, {});
        var body = opts.body;
        expect(body.request).toBe("request1");
        expect(body.update).toBe("update1");
        expect(body.written).toBe("written1");
    });
    it("updates request after it is written", function () {
        var proto = protocol.then().updateRequest(function (request, opts) {
            request.update = "update1";
            request.written = "rewritten1";
            return new RequestOptions(opts).merge({ body: request });
        });
        var opts = proto.writeRequest({ request: "request1" }, {});
        var body = opts.body;
        expect(body.request).toBe("request1");
        expect(body.update).toBe("update1");
        expect(body.written).toBe("rewritten1");
    });
    it("reads response", function () {
        var proto = protocol.instead().readResponse(function () {
            return {
                response2: "response2"
            };
        });
        var response = proto.readResponse(new Response(new ResponseOptions()));
        expect(response.response2).toBe("response2");
    });
    it("handles error", function () {
        var proto = protocol.then().handleError(function (error) {
            var err = error;
            err.test = "error1";
            return err;
        });
        var error = proto.handleError({ response: new Response(new ResponseOptions()) });
        expect(error.test).toBe("error1");
    });
});
describe("JSON protocol", function () {
    var protocol = JSON_PROTOCOL;
    it("writes request", function () {
        var request = { request: "some value", numeric: 13 };
        var opts = protocol.writeRequest(request, {});
        var response = JSON.parse(opts.body);
        expect(opts.headers.get("Content-Type")).toBe("application/json");
        expect(response.request).toBe(request.request);
        expect(response.numeric).toBe(request.numeric);
    });
    it("reads response", function () {
        var value = {
            request: "Request1",
            numeric: 333,
        };
        var read = protocol.readResponse(new Response(new ResponseOptions({
            body: JSON.stringify(value),
        })));
        expect(read.request).toBe(value.request);
        expect(read.numeric).toBe(value.numeric);
    });
});
//# sourceMappingURL=protocol.spec.js.map
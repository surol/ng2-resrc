var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { NgModule } from "@angular/core";
import { Http, ConnectionBackend, Response, ResponseOptions, RequestOptions, RequestMethod } from "@angular/http";
import { inject, TestBed } from "@angular/core/testing";
import { MockBackend } from "@angular/http/testing";
import { platformBrowserDynamicTesting, BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { RikeModule } from "../ng2-rike";
import { Rike, requestMethod } from "./rike";
import { RikeOptions, BaseRikeOptions } from "./options";
import { HTTP_PROTOCOL, jsonProtocol } from "./protocol";
var initialized = false;
export function addRikeProviders() {
    if (initialized) {
        return;
    }
    initialized = true;
    TestBed.initTestEnvironment(RikeTestModule, platformBrowserDynamicTesting());
}
export var RikeTestModule = (function () {
    function RikeTestModule() {
    }
    RikeTestModule = __decorate([
        NgModule({
            imports: [BrowserDynamicTestingModule, RikeModule],
            providers: [
                MockBackend,
                {
                    provide: ConnectionBackend,
                    useExisting: MockBackend
                },
                Http,
                {
                    provide: RikeOptions,
                    useValue: new BaseRikeOptions({ baseUrl: "/test-root" })
                },
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], RikeTestModule);
    return RikeTestModule;
}());
describe("Rike", function () {
    var rike;
    var back;
    beforeEach(function () { return addRikeProviders(); });
    beforeEach(inject([MockBackend, Rike], function (_be, _rike) {
        back = _be;
        rike = _rike;
    }));
    it("is initialized", function () {
        expect(rike.options.baseUrl).toBe("/test-root");
    });
    function loadRequestTest(method, read) {
        return function (done) {
            back.connections.subscribe(function (connection) {
                expect(connection.request.method).toBe(method);
                expect(connection.request.url).toBe("/test-root/request-url");
                connection.mockRespond(new Response(new ResponseOptions({
                    body: "response1",
                })));
            });
            var succeed = false;
            read(rike).call(rike, "request-url").subscribe(function (response) {
                expect(response.text()).toBe("response1");
                succeed = true;
            }, function (err) { return done.fail(err); }, function () {
                expect(succeed).toBeTruthy("Response not received");
                done();
            });
        };
    }
    it("processes GET request", loadRequestTest(RequestMethod.Get, function (rike) { return rike.get; }));
    it("processes DELETE request", loadRequestTest(RequestMethod.Delete, function (rike) { return rike.delete; }));
    it("processes HEAD request", loadRequestTest(RequestMethod.Head, function (rike) { return rike.head; }));
    function sendRequestTest(method, read) {
        return function (done) {
            back.connections.subscribe(function (connection) {
                expect(connection.request.method).toBe(method);
                expect(connection.request.url).toBe("/test-root/send-request-url");
                expect(connection.request.text()).toBe("request2");
                connection.mockRespond(new Response(new ResponseOptions({
                    body: "response1",
                })));
            });
            read(rike).call(rike, "send-request-url", "request2").subscribe(function (response) {
                expect(response.text()).toBe("response1");
                done();
            });
        };
    }
    it("processes POST request", sendRequestTest(RequestMethod.Post, function (rike) { return rike.post; }));
    it("processes PUT request", sendRequestTest(RequestMethod.Put, function (rike) { return rike.put; }));
    it("processes PATCH request", sendRequestTest(RequestMethod.Patch, function (rike) { return rike.patch; }));
    it("processes HTTP error", function (done) {
        back.connections.subscribe(function (connection) {
            connection.mockError(new Error("Response error"));
        });
        rike.get("request-url").subscribe(function () {
            done.fail("Response received");
        }, function (error) {
            var err = error.error;
            expect(err.message).toBe("Response error");
            done();
        });
    });
    it("creates target with the protocol", function () {
        var targetId = "target1";
        var target = rike.target(targetId);
        expect(target.target).toBe(targetId);
        expect(target.protocol).toBe(HTTP_PROTOCOL);
    });
    it("creates JSON target", function () {
        var targetId = "target1";
        var target = rike.json(targetId);
        expect(target.target).toBe(targetId);
        expectJsonProtocol(target.protocol);
    });
    it("creates target with specified protocol", function () {
        var protocol = jsonProtocol()
            .instead()
            .writeRequest(function (val, opts) {
            return new RequestOptions(opts).merge({ body: val });
        });
        var targetId = "target1";
        var target = rike.target(targetId, protocol);
        expect(target.target).toBe(targetId);
        expect(protocol.writeRequest(-5, {}).body).toBe(-5);
    });
});
function requestMethodTest(method, value) {
    return function () { return expect(requestMethod(value)).toBe(method); };
}
describe("requestMethod", function () {
    it("GET", requestMethodTest(RequestMethod.Get, "GeT"));
    it("POST", requestMethodTest(RequestMethod.Post, "pOSt"));
    it("PUT", requestMethodTest(RequestMethod.Put, "put"));
    it("DELETE", requestMethodTest(RequestMethod.Delete, "deletE"));
    it("OPTIONS", requestMethodTest(RequestMethod.Options, "OPTIONS"));
    it("HEAD", requestMethodTest(RequestMethod.Head, "hEad"));
    it("PATCH", requestMethodTest(RequestMethod.Patch, "pAtch"));
    it("specified as is", requestMethodTest(RequestMethod.Post, RequestMethod.Post));
    it("rejects unknown method", function () {
        expect(function () { return requestMethod("some"); }).toThrow();
    });
    it("rejects empty method", function () {
        expect(function () { return requestMethod(""); }).toThrow();
    });
});
export function expectJsonProtocol(protocol) {
    var value = {
        a: "test",
        b: 13,
        c: ["foo", "bar", "baz"]
    };
    var written = protocol.writeRequest(value, {}).body;
    var restored = JSON.parse(written);
    expect(restored.a).toBe(value.a, "Invalid data restored from JSON");
    expect(restored.b).toBe(value.b, "Invalid data restored from JSON");
    expect(restored.c).toEqual(value.c, "Invalid data restored from JSON");
}
//# sourceMappingURL=rike.spec.js.map
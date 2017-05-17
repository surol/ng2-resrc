import { BaseRequestOptions, ConnectionBackend, Http, RequestMethod, RequestOptions, Response, ResponseOptions } from "@angular/http";
import { fakeAsync, inject, TestBed, tick } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";
import { MockBackend } from "@angular/http/testing";
import { requestMethod, Rike } from "./rike";
import { BaseRikeOptions, RikeOptions } from "./options";
import { HTTP_PROTOCOL, jsonProtocol } from "./protocol";
var testingSetupComplete = false;
export function setupTesting() {
    if (!testingSetupComplete) {
        testingSetupComplete = true;
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    }
}
export function configureHttpTesting() {
    setupTesting();
    TestBed.configureTestingModule({
        providers: [
            {
                provide: RequestOptions,
                useValue: new BaseRequestOptions(),
            },
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
    });
}
export function configureRikeTesting() {
    configureHttpTesting();
    TestBed.configureTestingModule({
        providers: [
            Rike,
        ]
    });
}
export function nextFrom(op) {
    var result = undefined;
    op.subscribe(function (res) { return result = res; });
    tick();
    return result;
}
export function recordTo(op, target) {
    op.subscribe(function (res) { return target.push(res); });
    return target;
}
describe("Rike", function () {
    var rike;
    var back;
    beforeEach(function () { return configureRikeTesting(); });
    beforeEach(inject([MockBackend, Rike], function (_be, _rike) {
        back = _be;
        rike = _rike;
    }));
    it("is initialized", function () {
        expect(rike.options.baseUrl).toBe("/test-root");
    });
    function loadRequestTest(method, read) {
        return fakeAsync(function () {
            back.connections.subscribe(function (connection) {
                expect(connection.request.method).toBe(method);
                expect(connection.request.url).toBe("/test-root/request-url");
                connection.mockRespond(new Response(new ResponseOptions({
                    body: "response1",
                })));
            });
            var response = nextFrom(read(rike).call(rike, "request-url"));
            expect(response).toBeDefined("Response not received");
            expect(response && response.text()).toBe("response1", "Wrong response");
        });
    }
    it("processes GET request", loadRequestTest(RequestMethod.Get, function (rike) { return rike.get; }));
    it("processes DELETE request", loadRequestTest(RequestMethod.Delete, function (rike) { return rike.delete; }));
    it("processes HEAD request", loadRequestTest(RequestMethod.Head, function (rike) { return rike.head; }));
    function sendRequestTest(method, read) {
        return fakeAsync(function () {
            back.connections.subscribe(function (connection) {
                expect(connection.request.method).toBe(method);
                expect(connection.request.url).toBe("/test-root/send-request-url");
                expect(connection.request.text()).toBe("request2");
                connection.mockRespond(new Response(new ResponseOptions({
                    body: "response1",
                })));
            });
            var response = nextFrom(read(rike).call(rike, "send-request-url", "request2"));
            expect(response).toBeDefined("Response not received");
            expect(response && response.text()).toBe("response1", "Wrong response");
        });
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
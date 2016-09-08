import { Response, RequestMethod, ResponseOptions } from "@angular/http";
import { inject } from "@angular/core/testing";
import { MockBackend } from "@angular/http/testing";
import { Rike } from "./rike";
import { addRikeProviders } from "./rike.spec";
describe("RikeOperation", function () {
    var rike;
    var back;
    var target;
    beforeEach(function () { return addRikeProviders(); });
    beforeEach(inject([MockBackend, Rike], function (_be, _rike) {
        back = _be;
        rike = _rike;
        target = rike.target("target").withBaseUrl("target-url");
    }));
    function loadRequestTest(method, read) {
        return function (done) {
            back.connections.subscribe(function (connection) {
                expect(connection.request.method).toBe(method);
                expect(connection.request.url).toBe("/test-root/target-url/request-url");
                connection.mockRespond(new Response(new ResponseOptions({
                    body: "response1",
                })));
            });
            var op = target.operation("operation1");
            read(op).call(op, "request-url").subscribe(function (response) {
                expect(response.text()).toBe("response1");
                done();
            });
        };
    }
    it("processes GET request", loadRequestTest(RequestMethod.Get, function (op) { return op.get; }));
    it("processes DELETE request", loadRequestTest(RequestMethod.Delete, function (op) { return op.delete; }));
    it("processes HEAD request", loadRequestTest(RequestMethod.Head, function (op) { return op.head; }));
    function sendRequestTest(method, read) {
        return function (done) {
            back.connections.subscribe(function (connection) {
                expect(connection.request.method).toBe(method);
                expect(connection.request.url).toBe("/test-root/target-url/send-request-url");
                expect(connection.request.text()).toBe("request2");
                connection.mockRespond(new Response(new ResponseOptions({
                    body: "response1",
                })));
            });
            var op = target.operation("operation1");
            var succeed = false;
            read(op).call(op, "request2", "send-request-url").subscribe(function (response) {
                expect(response.text()).toBe("response1");
                succeed = true;
            }, function (err) { return done.fail(err); }, function () {
                expect(succeed).toBeTruthy("No response received");
                done();
            });
        };
    }
    it("processes POST request", sendRequestTest(RequestMethod.Post, function (op) { return op.post; }));
    it("processes PUT request", sendRequestTest(RequestMethod.Put, function (op) { return op.put; }));
    it("processes PATCH request", sendRequestTest(RequestMethod.Patch, function (op) { return op.patch; }));
    it("loads with GET by default", loadRequestTest(RequestMethod.Get, function (op) { return op.load; }));
    it("loads with specified method", loadRequestTest(RequestMethod.Options, function (op) { return op.withMethod("options").load; }));
    it("loads from specified URL", function (done) {
        back.connections.subscribe(function (connection) {
            expect(connection.request.url).toBe("/test-root/target-url/load-url");
            connection.mockRespond(new Response(new ResponseOptions()));
        });
        target.operation("operation1").withUrl("load-url").load().subscribe(done);
    });
    it("loads from target URL by default", function (done) {
        back.connections.subscribe(function (connection) {
            expect(connection.request.url).toBe("/test-root/target-url");
            connection.mockRespond(new Response(new ResponseOptions()));
        });
        target.operation("operation1").load().subscribe(done);
    });
    it("sends with specified method", sendRequestTest(RequestMethod.Put, function (op) { return op.withMethod("put").send; }));
    it("sends to specified URL", function (done) {
        back.connections.subscribe(function (connection) {
            expect(connection.request.url).toBe("/test-root/target-url/send-url");
            connection.mockRespond(new Response(new ResponseOptions()));
        });
        target.operation("operation1").withUrl("send-url").send("abc").subscribe(done);
    });
    it("sends to target URL by default", function (done) {
        back.connections.subscribe(function (connection) {
            expect(connection.request.url).toBe("/test-root/target-url");
            connection.mockRespond(new Response(new ResponseOptions()));
        });
        target.operation("operation1").send("abc").subscribe(done);
    });
});
describe("RikeOperation event", function () {
    var rike;
    var back;
    var target;
    beforeEach(function () { return addRikeProviders(); });
    beforeEach(inject([MockBackend, Rike], function (_be, _rike) {
        back = _be;
        rike = _rike;
        target = rike.target("target").withBaseUrl("target-url");
    }));
    function mockRespond() {
        back.connections.subscribe(function (connection) {
            connection.mockRespond(new Response(new ResponseOptions({
                body: "response1",
            })));
        });
    }
    it("start", function (done) {
        mockRespond();
        var op = target.operation("operation");
        var complete = false;
        target.rikeEvents.subscribe(function (ev) {
            if (!complete) {
                complete = true;
                expect(ev.operation).toBe(op);
                expect(ev.target).toBe(target);
                expect(ev.complete).toBeFalsy();
                done();
            }
        }, function (err) { return done.fail(err); });
        op.load().subscribe();
    });
    it("complete", function (done) {
        mockRespond();
        var op = target.operation("operation");
        var events = 0;
        target.rikeEvents.subscribe(function (ev) {
            expect(ev.operation).toBe(op);
            expect(ev.target).toBe(target);
            if (events++) {
                expect(ev.complete).toBeTruthy();
                expect(ev.error).toBeUndefined();
                var result = ev.result;
                expect(result.text()).toBe("response1");
                done();
            }
        }, function (err) { return done.fail(err); });
        op.load().subscribe();
    });
    it("error", function (done) {
        back.connections.subscribe(function (connection) {
            connection.mockError(new Error("error1"));
        });
        var op = target.operation("operation");
        var events = 0;
        target.rikeEvents.subscribe(function (ev) {
            if (!events++) {
                expect(ev.operation).toBe(op);
                expect(ev.target).toBe(target);
            }
            else {
                expect(events).toBe(2, "Start event not received yet");
                expect(ev.complete).toBeTruthy();
                var error = ev.error;
                expect(error.message).toBe("error1");
                done();
            }
        }, function (err) { return done.fail(err); });
        op.load().subscribe(function () { }, function () { });
    });
    it("exception", function (done) {
        back.connections.subscribe(function () {
            throw new Error("error1");
        });
        var op = target.operation("operation");
        var events = 0;
        target.rikeEvents.subscribe(function (ev) {
            events++;
            expect(ev.operation).toBe(op);
            expect(ev.target).toBe(target);
        }, function (ev) {
            expect(events).toBe(1, "Start event not received yet");
            expect(ev.complete).toBeTruthy();
            var error = ev.error;
            expect(error.message).toBe("error1");
            done();
        });
        expect(function () { return op.load().subscribe(); }).toThrowError("error1");
    });
});
//# sourceMappingURL=rike-operation.spec.js.map
import { inject } from "@angular/core/testing";
import { Response, RequestOptions, ResponseOptions } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { addRikeProviders, expectJsonProtocol } from "./rike.spec";
import { Rike } from "./rike";
import { jsonProtocol } from "./protocol";
describe("RikeTarget", function () {
    var rike;
    var back;
    var target;
    beforeEach(function () { return addRikeProviders(); });
    beforeEach(inject([MockBackend, Rike], function (_be, _rike) {
        back = _be;
        rike = _rike;
        target = rike.target("target");
    }));
    it("created", function () {
        expect(target.baseUrl).toBeUndefined();
    });
    it("updated with base url", function () {
        var t = target.withBaseUrl("target-url");
        expect(t).toBe(target);
        expect(t.baseUrl).toBe("target-url");
    });
    it("creates operation over the target protocol", function () {
        var op = target.operation("operation1");
        expect(op.target).toBe(target);
        expect(op.name).toBe("operation1");
        expect(op.protocol).toBe(target.protocol);
    });
    it("creates JSON operation", function () {
        var op = target.json("jsonOperation");
        expect(op.target).toBe(target);
        expect(op.name).toBe("jsonOperation");
        expectJsonProtocol(op.protocol);
    });
    it("creates operation over specified protocol", function () {
        var proto = jsonProtocol()
            .instead()
            .writeRequest(function (val, opts) {
            return new RequestOptions(opts).merge({ body: JSON.stringify(val) });
        });
        var op = target.operation("customOperation", proto);
        expect(op.target).toBe(target);
        expect(op.name).toBe("customOperation");
        expect(JSON.parse(op.protocol.writeRequest(13, {}).body)).toBe(13);
    });
    it("current operation updated on request", function (done) {
        back.connections.subscribe(function (connection) {
            connection.mockRespond(new Response(new ResponseOptions({
                body: "response1",
            })));
        });
        var op = target.operation("operation").withUrl("/request-url");
        op.load().subscribe(function () {
            expect(target.currentOperation).toBe(op, "Current operation not set on response");
        }, function (err) { return done.fail(err); }, function () {
            expect(target.currentOperation).toBe(op, "Current operation not set when complete");
            setTimeout(function () {
                expect(target.currentOperation).toBeUndefined("Current operation not cleared");
                done();
            });
        });
    });
    it("current operation updated on error", function (done) {
        back.connections.subscribe(function (connection) {
            connection.mockError(new Error("error1"));
        });
        var op = target.operation("operation").withUrl("/request-url");
        op.load().subscribe(function () {
            done.fail("Response received");
        }, function () {
            expect(target.currentOperation).toBe(op, "Current operation not set on error");
            setTimeout(function () {
                expect(target.currentOperation).toBeUndefined("Current operation not cleared");
                done();
            });
        });
    });
});
//# sourceMappingURL=rike-target.spec.js.map
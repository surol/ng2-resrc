import {inject} from "@angular/core/testing";
import {Response, RequestOptionsArgs, RequestOptions, ResponseOptions} from "@angular/http";
import {MockBackend, MockConnection} from "@angular/http/testing";
import {addRikeProviders, expectJsonProtocol} from "./rike.spec";
import {Rike, RikeTarget} from "./rike";
import {jsonProtocol} from "./protocol";

describe("RikeTarget", () => {

    let rike: Rike;
    let back: MockBackend;
    let target: RikeTarget<any, Response>

    beforeEach(() => addRikeProviders());

    beforeEach(inject([MockBackend, Rike], (_be: MockBackend, _rike: Rike) => {
        back = _be;
        rike = _rike;
        target = rike.target("target");
    }));

    it("created", () => {
        expect(target.baseUrl).toBeUndefined();
    });

    it("updated with base url", () => {

        const t = target.withBaseUrl("target-url");

        expect(t).toBe(target);
        expect(t.baseUrl).toBe("target-url");
    });

    it("creates operation over the target protocol", () => {

        const op = target.operation("operation1");

        expect(op.target).toBe(target);
        expect(op.name).toBe("operation1");
        expect(op.protocol).toBe(target.protocol);
    });

    it("creates JSON operation", () => {

        const op = target.json("jsonOperation");

        expect(op.target).toBe(target);
        expect(op.name).toBe("jsonOperation");
        expectJsonProtocol(op.protocol);
    });

    it("creates operation over specified protocol", () => {

        const proto = jsonProtocol<string, string>()
            .instead()
            .writeRequest((val: number, opts: RequestOptionsArgs) =>
                new RequestOptions(opts).merge({body: JSON.stringify(val)}));
        const op = target.operation("customOperation", proto);

        expect(op.target).toBe(target);
        expect(op.name).toBe("customOperation");
        expect(JSON.parse(op.protocol.writeRequest(13, {}).body)).toBe(13);
    });

    it("current operation updated on request", done => {
        back.connections.subscribe((connection: MockConnection) => {
            connection.mockRespond(new Response(new ResponseOptions({
                body: "response1",
            })));
        });

        const op = target.operation("operation").withUrl("/request-url");

        op.load().subscribe(
            () => {
                expect(target.currentOperation).toBe(op, "Current operation not set on response");
            },
            (err: any) => done.fail(err),
            () => {
                expect(target.currentOperation).toBe(op, "Current operation not set when complete");
                setTimeout(() => {
                    expect(target.currentOperation).toBeUndefined("Current operation not cleared");
                    done();
                });
            })
    });

    it("current operation updated on error", done => {
        back.connections.subscribe((connection: MockConnection) => {
            connection.mockError(new Error("error1"));
        });

        const op = target.operation("operation").withUrl("/request-url");

        op.load().subscribe(
            () => {
                done.fail("Response received");
            },
            () => {
                expect(target.currentOperation).toBe(op, "Current operation not set on error");
                setTimeout(() => {
                    expect(target.currentOperation).toBeUndefined("Current operation not cleared");
                    done();
                });
            });
    });
});

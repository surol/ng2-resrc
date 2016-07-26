import {Response, RequestMethod, ResponseOptions} from "@angular/http";
import {inject} from "@angular/core/testing";
import {MockBackend, MockConnection} from "@angular/http/testing";
import {Observable} from "rxjs/Rx";
import {Rike, RikeTarget, RikeOperation} from "./rike";
import {addRikeProviders} from "./rike.spec";

describe("RikeOperation", () => {

    let rike: Rike;
    let back: MockBackend;
    let target: RikeTarget<any, Response>;

    beforeEach(() => addRikeProviders());

    beforeEach(inject([MockBackend, Rike], (_be: MockBackend, _rike: Rike) => {
        back = _be;
        rike = _rike;
        target = rike.target("target").withBaseUrl("target-url");
    }));

    function loadRequestTest(
        method: RequestMethod,
        read: (op: RikeOperation<any, any>) => ((url: string) => Observable<Response>)): (done: DoneFn) => void {
        return done => {
            back.connections.subscribe((connection: MockConnection) => {
                expect(connection.request.method).toBe(method);
                expect(connection.request.url).toBe("/test-root/target-url/request-url");
                connection.mockRespond(new Response(new ResponseOptions({
                    body: "response1",
                })));
            });

            const op = target.operation("operation1");

            read(op).call(op, "request-url").subscribe((response: Response) => {
                expect(response.text()).toBe("response1");
                done();
            });
        }
    }

    it("processes GET request", loadRequestTest(RequestMethod.Get, op => op.get));
    it("processes DELETE request", loadRequestTest(RequestMethod.Delete, op => op.delete));
    it("processes HEAD request", loadRequestTest(RequestMethod.Head, op => op.head));

    function sendRequestTest(
        method: RequestMethod,
        read: (op: RikeOperation<any, any>) =>
            ((body: any, url: string) => Observable<Response>)): (done: DoneFn) => void {
        return done => {
            back.connections.subscribe((connection: MockConnection) => {
                expect(connection.request.method).toBe(method);
                expect(connection.request.url).toBe("/test-root/target-url/send-request-url");
                expect(connection.request.text()).toBe("request2");
                connection.mockRespond(new Response(new ResponseOptions({
                    body: "response1",
                })));
            });

            const op = target.operation("operation1");

            read(op).call(op, "request2", "send-request-url", ).subscribe((response: Response) => {
                expect(response.text()).toBe("response1");
                done();
            });
        }
    }

    it("processes POST request", sendRequestTest(RequestMethod.Post, op => op.post));
    it("processes PUT request", sendRequestTest(RequestMethod.Put, op => op.put));
    it("processes PATCH request", sendRequestTest(RequestMethod.Patch, op => op.patch));

    it("loads with GET by default", loadRequestTest(RequestMethod.Get, op => op.load));
    it("loads with specified method", loadRequestTest(RequestMethod.Options, op => op.withMethod("options").load));
    it("loads from specified URL", done => {
        back.connections.subscribe((connection: MockConnection) => {
            expect(connection.request.url).toBe("/test-root/target-url/load-url");
            connection.mockRespond(new Response(new ResponseOptions()));
        });

        target.operation("operation1").withUrl("load-url").load().subscribe(done);
    });
    it("loads from target URL by default", done => {
        back.connections.subscribe((connection: MockConnection) => {
            expect(connection.request.url).toBe("/test-root/target-url");
            connection.mockRespond(new Response(new ResponseOptions()));
        });

        target.operation("operation1").load().subscribe(done);
    });

    it("sends with specified method", sendRequestTest(RequestMethod.Put, op => op.withMethod("put").send));
    it("sends to specified URL", done => {
        back.connections.subscribe((connection: MockConnection) => {
            expect(connection.request.url).toBe("/test-root/target-url/send-url");
            connection.mockRespond(new Response(new ResponseOptions()));
        });

        target.operation("operation1").withUrl("send-url").send("abc").subscribe(done);
    });
    it("sends to target URL by default", done => {
        back.connections.subscribe((connection: MockConnection) => {
            expect(connection.request.url).toBe("/test-root/target-url");
            connection.mockRespond(new Response(new ResponseOptions()));
        });

        target.operation("operation1").send("abc").subscribe(done);
    });

});

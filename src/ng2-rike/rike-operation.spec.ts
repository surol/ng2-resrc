import {Response, RequestMethod, ResponseOptions} from "@angular/http";
import {inject} from "@angular/core/testing";
import {MockBackend, MockConnection} from "@angular/http/testing";
import {Observable} from "rxjs/Rx";
import {Rike, RikeTarget, RikeOperation} from "./rike";
import {addRikeProviders} from "./rike.spec";
import {RikeEvent, RikeErrorEvent} from "./event";

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
            let succeed = false;

            read(op).call(op, "request2", "send-request-url", ).subscribe(
                (response: Response) => {
                    expect(response.text()).toBe("response1");
                    succeed = true;
                },
                (err: any) => done.fail(err),
                () => {
                    expect(succeed).toBeTruthy("No response received");
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

describe("RikeOperation event", () => {

    let rike: Rike;
    let back: MockBackend;
    let target: RikeTarget<any, Response>;

    beforeEach(() => addRikeProviders());

    beforeEach(inject([MockBackend, Rike], (_be: MockBackend, _rike: Rike) => {
        back = _be;
        rike = _rike;
        target = rike.target("target").withBaseUrl("target-url");
    }));

    function mockRespond() {
        back.connections.subscribe((connection: MockConnection) => {
            connection.mockRespond(new Response(new ResponseOptions({
                body: "response1",
            })));
        });
    }

    it("start", done => {
        mockRespond();

        const op = target.operation("operation");
        let complete = false;

        target.rikeEvents.subscribe(
            (ev: RikeEvent) => {
                if (!complete) {
                    complete = true;
                    expect(ev.operation).toBe(op);
                    expect(ev.target).toBe(target);
                    expect(ev.complete).toBeFalsy();
                    done();
                }
            },
            (err: any) => done.fail(err));

        op.load().subscribe();
    });

    it("complete", done => {
        mockRespond();

        const op = target.operation("operation");
        let events = 0;

        target.rikeEvents.subscribe(
            (ev: RikeEvent) => {
                expect(ev.operation).toBe(op);
                expect(ev.target).toBe(target);
                if (events++) {
                    expect(ev.complete).toBeTruthy();
                    expect(ev.error).toBeUndefined();

                    const result = ev.result as Response;

                    expect(result.text()).toBe("response1");
                    done();
                }
            },
            (err: any) => done.fail(err));

        op.load().subscribe();
    });

    it("error", done => {
        back.connections.subscribe((connection: MockConnection) => {
            connection.mockError(new Error("error1"));
        });

        const op = target.operation("operation");
        let events = 0;

        target.rikeEvents.subscribe(
            (ev: RikeEvent) => {
                if (!events++) {
                    expect(ev.operation).toBe(op);
                    expect(ev.target).toBe(target);
                } else {
                    expect(events).toBe(2, "Start event not received yet");
                    expect(ev.complete).toBeTruthy();

                    const error = ev.error as Error;

                    expect(error.message).toBe("error1");
                    done();
                }
            },
            (err: any) => done.fail(err));

        op.load().subscribe();
    });

    it("exception", done => {
        back.connections.subscribe(() => {
            throw new Error("error1");
        });

        const op = target.operation("operation");
        let events = 0;

        target.rikeEvents.subscribe(
            (ev: RikeEvent) => {
                if (!events++) {
                    expect(ev.operation).toBe(op);
                    expect(ev.target).toBe(target);
                } else {

                }
            },
            (ev: RikeErrorEvent) => {
                expect(events).toBe(1, "Start event not received yet");
                expect(ev.complete).toBeTruthy();

                const error = ev.error as Error;

                expect(error.message).toBe("error1");
                done();
            });

        op.load().subscribe();
    });
});

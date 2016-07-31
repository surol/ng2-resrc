import {
    Http,
    ConnectionBackend,
    HTTP_PROVIDERS,
    Response,
    ResponseOptions,
    RequestOptionsArgs,
    RequestOptions,
    RequestMethod
} from "@angular/http";
import {addProviders, inject} from "@angular/core/testing";
import {MockBackend, MockConnection} from "@angular/http/testing";
import {RIKE_PROVIDERS} from "../ng2-rike";
import {Rike, requestMethod} from "./rike";
import {RikeOptions, BaseRikeOptions} from "./options";
import {HTTP_PROTOCOL, JSON_PROTOCOL, jsonProtocol, Protocol, ErrorResponse} from "./protocol";
import {Observable} from "rxjs/Rx";

export function addRikeProviders() {
    addProviders([
        HTTP_PROVIDERS,
        MockBackend,
        {
            provide: ConnectionBackend,
            useExisting: MockBackend
        },
        Http,
        {
            provide: RikeOptions,
            useValue: new BaseRikeOptions({baseUrl: "/test-root"})
        },
        RIKE_PROVIDERS,
    ])
}

describe("Rike", () => {

    let rike: Rike;
    let back: MockBackend;

    beforeEach(() => addRikeProviders());

    beforeEach(inject([MockBackend, Rike], (_be: MockBackend, _rike: Rike) => {
        back = _be;
        rike = _rike;
    }));

    it("is initialized", () => {
        expect(rike.options.baseUrl).toBe("/test-root");
    });

    function loadRequestTest(
        method: RequestMethod,
        read: (rike: Rike) => ((url: string) => Observable<Response>)): (done: DoneFn) => void {
        return done => {
            back.connections.subscribe((connection: MockConnection) => {
                expect(connection.request.method).toBe(method);
                expect(connection.request.url).toBe("/test-root/request-url");
                connection.mockRespond(new Response(new ResponseOptions({
                    body: "response1",
                })));
            });

            let succeed = false;

            read(rike).call(rike, "request-url").subscribe(
                (response: Response) => {
                    expect(response.text()).toBe("response1");
                    succeed = true;
                },
                (err: any) => done.fail(err),
                () => {
                    expect(succeed).toBeTruthy("Response not received");
                    done();
                });
        }
    }

    it("processes GET request", loadRequestTest(RequestMethod.Get, rike => rike.get));
    it("processes DELETE request", loadRequestTest(RequestMethod.Delete, rike => rike.delete));
    it("processes HEAD request", loadRequestTest(RequestMethod.Head, rike => rike.head));

    function sendRequestTest(
        method: RequestMethod,
        read: (rike: Rike) => ((url: string, body: any) => Observable<Response>)): (done: DoneFn) => void {
        return done => {
            back.connections.subscribe((connection: MockConnection) => {
                expect(connection.request.method).toBe(method);
                expect(connection.request.url).toBe("/test-root/send-request-url");
                expect(connection.request.text()).toBe("request2");
                connection.mockRespond(new Response(new ResponseOptions({
                    body: "response1",
                })));
            });
            read(rike).call(rike, "send-request-url", "request2").subscribe((response: Response) => {
                expect(response.text()).toBe("response1");
                done();
            });
        }
    }

    it("processes POST request", sendRequestTest(RequestMethod.Post, rike => rike.post));
    it("processes PUT request", sendRequestTest(RequestMethod.Put, rike => rike.put));
    it("processes PATCH request", sendRequestTest(RequestMethod.Patch, rike => rike.patch));

    it("processes HTTP error", done => {
        back.connections.subscribe((connection: MockConnection) => {
            connection.mockError(new Error("Response error"));
        });
        rike.get("request-url").subscribe(
            () => {
                done.fail("Response received");
            },
            (error: ErrorResponse) => {

                const err = error.error as Error;

                expect(err.message).toBe("Response error");

                done();
            });
    });

    it("creates target with the protocol", () => {

        const targetId = "target1";
        const target = rike.target(targetId);

        expect(target.target).toBe(targetId);
        expect(target.protocol).toBe(HTTP_PROTOCOL);
    });

    it("creates JSON target", () => {

        const targetId = "target1";
        const target = rike.json(targetId);

        expect(target.target).toBe(targetId);
        expectJsonProtocol(target.protocol);
    });

    it("creates target with specified protocol", () => {

        const protocol = jsonProtocol<string, string>()
            .instead()
            .writeRequest((val: number, opts: RequestOptionsArgs) =>
                new RequestOptions(opts).merge({body: val}));
        const targetId = "target1";
        const target = rike.target(targetId, protocol);

        expect(target.target).toBe(targetId);
        expect(protocol.writeRequest(-5, {}).body).toBe(-5);
    });
});

function requestMethodTest(method: RequestMethod, value: string | RequestMethod) {
    return () => expect(requestMethod(value)).toBe(method);
}

describe("requestMethod", () => {
    it("GET", requestMethodTest(RequestMethod.Get, "GeT"));
    it("POST", requestMethodTest(RequestMethod.Post, "pOSt"));
    it("PUT", requestMethodTest(RequestMethod.Put, "put"));
    it("DELETE", requestMethodTest(RequestMethod.Delete, "deletE"));
    it("OPTIONS", requestMethodTest(RequestMethod.Options, "OPTIONS"));
    it("HEAD", requestMethodTest(RequestMethod.Head, "hEad"));
    it("PATCH", requestMethodTest(RequestMethod.Patch, "pAtch"));
    it("specified as is", requestMethodTest(RequestMethod.Post, RequestMethod.Post));

    it("rejects unknown method", () => {
        expect(() => requestMethod("some")).toThrow();
    });

    it("rejects empty method", () => {
        expect(() => requestMethod("")).toThrow();
    });
});

interface Data {
    a: string;
    b: number;
    c: string[];
}

export function expectJsonProtocol(protocol: Protocol<any, any>) {

    const value: Data = {
        a: "test",
        b: 13,
        c: ["foo", "bar", "baz"]
    };

    const written = protocol.writeRequest(value, {}).body as string;
    const restored: Data = JSON.parse(written);

    expect(restored.a).toBe(value.a, "Invalid data restored from JSON");
    expect(restored.b).toBe(value.b, "Invalid data restored from JSON");
    expect(restored.c).toEqual(value.c, "Invalid data restored from JSON");
}

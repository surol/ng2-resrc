import {Observable} from "rxjs/Rx";
import {
    BaseRequestOptions,
    ConnectionBackend,
    Http,
    RequestMethod,
    RequestOptions,
    RequestOptionsArgs,
    Response,
    ResponseOptions
} from "@angular/http";
import {fakeAsync, inject, TestBed, tick} from "@angular/core/testing";
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from "@angular/platform-browser-dynamic/testing";
import {MockBackend, MockConnection} from "@angular/http/testing";
import {requestMethod, Rike} from "./rike";
import {BaseRikeOptions, RikeOptions} from "./options";
import {ErrorResponse, HTTP_PROTOCOL, jsonProtocol, Protocol} from "./protocol";

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
                useValue: new BaseRikeOptions({baseUrl: "/test-root"})
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

export function nextFrom<T>(op: Observable<T>): T | undefined {

    let result: T | undefined = undefined;

    op.subscribe(res => result = res);

    tick();

    return result;
}

export function recordTo<T>(op: Observable<T>, target: T[]): T[] {
    op.subscribe(res => target.push(res));
    return target;
}

describe("Rike", () => {

    let rike: Rike;
    let back: MockBackend;

    beforeEach(() => configureRikeTesting());

    beforeEach(inject([MockBackend, Rike], (_be: MockBackend, _rike: Rike) => {
        back = _be;
        rike = _rike;
    }));

    it("is initialized", () => {
        expect(rike.options.baseUrl).toBe("/test-root");
    });

    function loadRequestTest(
        method: RequestMethod,
        read: (rike: Rike) => ((url: string) => Observable<Response>)): () => void {
        return fakeAsync(() => {
            back.connections.subscribe((connection: MockConnection) => {
                expect(connection.request.method).toBe(method);
                expect(connection.request.url).toBe("/test-root/request-url");
                connection.mockRespond(new Response(new ResponseOptions({
                    body: "response1",
                })));
            });

            const response = nextFrom<Response>(read(rike).call(rike, "request-url"));

            expect(response).toBeDefined("Response not received");
            expect(response && response.text()).toBe("response1", "Wrong response");
        });
    }

    it("processes GET request", loadRequestTest(RequestMethod.Get, rike => rike.get));
    it("processes DELETE request", loadRequestTest(RequestMethod.Delete, rike => rike.delete));
    it("processes HEAD request", loadRequestTest(RequestMethod.Head, rike => rike.head));

    function sendRequestTest(
        method: RequestMethod,
        read: (rike: Rike) => ((url: string, body: any) => Observable<Response>)): () => void {
        return fakeAsync(() => {
            back.connections.subscribe((connection: MockConnection) => {
                expect(connection.request.method).toBe(method);
                expect(connection.request.url).toBe("/test-root/send-request-url");
                expect(connection.request.text()).toBe("request2");
                connection.mockRespond(new Response(new ResponseOptions({
                    body: "response1",
                })));
            });

            const response = nextFrom<Response>(read(rike).call(rike, "send-request-url", "request2"));

            expect(response).toBeDefined("Response not received");
            expect(response && response.text()).toBe("response1", "Wrong response");
        });
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

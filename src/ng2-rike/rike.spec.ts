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
import {Rike} from "./rike";
import {RikeOptions, BaseRikeOptions} from "./options";
import {HTTP_RESPONSE_DATA_TYPE, JSON_DATA_TYPE, jsonDataType} from "./data";
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

    function readRequestTest(
        method: RequestMethod,
        read: (rike: Rike) => ((url: string) => Observable<Response>)): (done: () => void) => void {
        return done => {
            back.connections.subscribe((connection: MockConnection) => {
                expect(connection.request.method).toBe(method);
                expect(connection.request.url).toBe("/test-root/request-url");
                connection.mockRespond(new Response(new ResponseOptions({
                    body: "response1",
                })));
            });
            read(rike).call(rike, "request-url").subscribe((response: Response) => {
                expect(response.text()).toBe("response1");
                done();
            });
        }
    }

    it("processes GET request", readRequestTest(RequestMethod.Get, rike => rike.get));
    it("processes DELETE request", readRequestTest(RequestMethod.Delete, rike => rike.delete));
    it("processes HEAD request", readRequestTest(RequestMethod.Head, rike => rike.head));

    function sendRequestTest(
        method: RequestMethod,
        read: (rike: Rike) => ((url: string, body: any) => Observable<Response>)): (done: () => void) => void {
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
                fail("Response received");
                done();
            },
            (error: Error) => {
                expect(error.message).toBe("Response error");
                done();
            });
    });

    it("creates target of the default type", () => {

        const targetId = "target1";
        const target = rike.target(targetId);

        expect(target.target).toBe(targetId);
        expect(target.dataType).toBe(HTTP_RESPONSE_DATA_TYPE);
    });

    it("creates JSON target", () => {

        const targetId = "target1";
        const target = rike.json(targetId);

        expect(target.target).toBe(targetId);
        expect(target.dataType).toBe(JSON_DATA_TYPE);
    });

    it("creates target of specified type", () => {

        const dataType = jsonDataType<string>()
            .writeRequestWith((val: number, opts: RequestOptionsArgs) =>
                new RequestOptions(opts).merge({body: JSON.stringify(val)}));
        const targetId = "target1";
        const target = rike.target(targetId, dataType);

        expect(target.target).toBe(targetId);
        expect(target.dataType).toBe(dataType);
    });
});

import {Http, ConnectionBackend, HTTP_PROVIDERS, Response, ResponseOptions} from "@angular/http";
import {addProviders, inject} from "@angular/core/testing";
import {MockBackend, MockConnection} from "@angular/http/testing";
import {RIKE_PROVIDERS} from "../ng2-rike";
import {Rike} from "./rike";
import {RikeOptions, BaseRikeOptions} from "./options";

describe("Rike", () => {

    let rike: Rike;
    let back: MockBackend;

    beforeEach(() => addProviders([
        HTTP_PROVIDERS,
        MockBackend,
        {
            provide: RikeOptions,
            useValue: new BaseRikeOptions({baseUrl: "/test-root"})
        },
        {
            provide: ConnectionBackend,
            useExisting: MockBackend
        },
        {
            provide: Http,
            useClass: Http
        },
        RIKE_PROVIDERS,
    ]));

    beforeEach(inject([MockBackend, Rike], (_be: MockBackend, _rike: Rike) => {
        back = _be;
        rike = _rike;
    }));

    it("is initialized", () => {
        expect(rike.options.baseUrl).toBe("/test-root");
    });

    it('processes GET request', done => {
        back.connections.subscribe((connection: MockConnection) => {
            expect(connection.request.url).toBe("/test-root/request-url");
            connection.mockRespond(new Response(new ResponseOptions({
                body: "response1",
            })));
        });
        rike.get("request-url").subscribe(response => {
            expect(response.text()).toBe("response1");
            done();
        })
    });

    it('processes POST request', done => {
        back.connections.subscribe((connection: MockConnection) => {
            expect(connection.request.url).toBe("/test-root/post-request-url");
            expect(connection.request.text()).toBe("request2");
            connection.mockRespond(new Response(new ResponseOptions({
                body: "response2",
            })));
        });
        rike.post("post-request-url", "request2").subscribe(response => {
            expect(response.text()).toBe("response2");
            done();
        })
    });
});

import {Http, ConnectionBackend, HTTP_PROVIDERS} from "@angular/http";
import {addProviders, inject} from "@angular/core/testing";
import {MockBackend} from "@angular/http/testing";
import {RIKE_PROVIDERS} from "../ng2-rike";
import {Rike} from "./rike";
import {RikeOptions, BaseRikeOptions} from "./options";

describe("Rike", () => {

    let rike: Rike;
    let be: MockBackend;

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
        be = _be;
        rike = _rike;
    }));

    it("Initialized", () => {
        expect(rike.options.baseUrl).toBe("/test-root");
    });
});

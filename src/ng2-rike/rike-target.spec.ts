import {inject} from "@angular/core/testing";
import {Request, Response, RequestOptionsArgs, RequestOptions} from "@angular/http";
import {MockBackend} from "@angular/http/testing";
import {addRikeProviders} from "./rike.spec";
import {Rike, RikeTarget} from "./rike";
import {JSON_DATA_TYPE, jsonDataType} from "./data";

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

    it("creates operation of the target type", () => {

        const op = target.operation("operation1");

        expect(op.target).toBe(target);
        expect(op.name).toBe("operation1");
        expect(op.dataType).toBe(target.dataType);
    });

    it("creates JSON operation", () => {

        const op = target.json("jsonOperation");

        expect(op.target).toBe(target);
        expect(op.name).toBe("jsonOperation");
        expect(op.dataType).toBe(JSON_DATA_TYPE);
    });

    it("creates target of specified type", () => {

        const dataType = jsonDataType<string>()
            .writeRequestWith((val: number, opts: RequestOptionsArgs) =>
                new RequestOptions(opts).merge({body: JSON.stringify(val)}));
        const op = target.operation("customOperation", dataType);

        expect(op.target).toBe(target);
        expect(op.name).toBe("customOperation");
        expect(op.dataType).toBe(dataType);
    });
});

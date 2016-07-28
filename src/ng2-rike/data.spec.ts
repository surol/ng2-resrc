import {RequestOptionsArgs, Response, RequestOptions, URLSearchParams, ResponseOptions} from "@angular/http";
import {DataType} from "./data";

interface In {
    request: string;
    update?: string;
    written?: string;
}

interface In2 {
    request2: string;
}

interface Out {
    response: string;
}

interface Out2 {
    response2: string;
}

class TestDataType extends DataType<In, Out> {

    readonly handleError?: (error: any) => any;

    constructor() {
        super();
    }

    prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs {
        return new RequestOptions(options).merge({url: "/request", search: "prepared=true"})
    }

    writeRequest(request: In, options: RequestOptionsArgs): RequestOptionsArgs {
        request.written = "written1";
        return new RequestOptions(options).merge({body: request});
    }

    readResponse(response: Response): Out {
        return {
            response: "response1"
        };
    }

}

describe("DataType", () => {

    const dataType = new TestDataType();

    it("prepares request before", () => {

        const type = dataType.prepareRequestWith(opts => new RequestOptions(opts).merge({search: "updated=true"}));
        const opts = type.prepareRequest({});

        expect(opts.url).toBe("/request");
        expect(opts.search && opts.search.toString()).toEqual("prepared=true");
    });

    it("prepares request after", () => {

        const type = dataType.prepareRequestWith(
            opts => new RequestOptions(opts).merge({search: "updated=true"}),
            true);
        const opts = type.prepareRequest({});

        expect(opts.url).toBe("/request");
        expect(opts.search && opts.search.toString()).toEqual("updated=true");
    });

    it("writes request", () => {

        const type = dataType.writeRequestWith((request: In2, opts: RequestOptionsArgs) => {
            return new RequestOptions(opts).merge({body: request.request2});
        });
        const opts = type.writeRequest({request2: "request2"}, {});

        expect(opts.body).toBe("request2");

    });

    it("updates request before it is written", () => {

        const type = dataType.updateRequestWith((request, opts) => {
            request.update = "update1";
            request.written = "rewritten1";
            return new RequestOptions(opts).merge({body: request});
        });
        const opts = type.writeRequest({request: "request1"}, {});
        const body = opts.body as In;

        expect(body.request).toBe("request1");
        expect(body.update).toBe("update1");
        expect(body.written).toBe("written1");
    });

    it("updates request after it is written", () => {

        const type = dataType.updateRequestWith(
            (request, opts) => {
                request.update = "update1";
                request.written = "rewritten1";
                return new RequestOptions(opts).merge({body: request});
            },
            true);
        const opts = type.writeRequest({request: "request1"}, {});
        const body = opts.body as In;

        expect(body.request).toBe("request1");
        expect(body.update).toBe("update1");
        expect(body.written).toBe("rewritten1");
    });

    it("reads response", () => {

        const type = dataType.readResponseWith(() => {
            return {
                response2: "response2"
            } as Out2
        });
        const response = type.readResponse(new Response(new ResponseOptions()));

        expect(response.response2).toBe("response2");
    });

    it("handles error", () => {

        const type = dataType.handleErrorWith(error => {
            return {error};
        });
        const error: {error: any} = type.handleError!("abc");

        expect(error.error).toBe("abc");
    });
});

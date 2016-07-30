import {RequestOptionsArgs, Response, RequestOptions, URLSearchParams, ResponseOptions} from "@angular/http";
import {Protocol, JSON_PROTOCOL} from "./protocol";

interface In {
    request: string;
    update?: string;
    written?: string;
    numeric?: number;
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

class TestProtocol extends Protocol<In, Out> {

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

describe("Protocol", () => {

    const protocol = new TestProtocol();

    it("prepares request before", () => {

        const proto = protocol.prior().prepareRequest(opts => new RequestOptions(opts).merge({search: "updated=true"}));
        const opts = proto.prepareRequest({});

        expect(opts.url).toBe("/request");
        expect(opts.search && opts.search.toString()).toEqual("prepared=true");
    });

    it("prepares request after", () => {

        const proto = protocol.then().prepareRequest(opts => new RequestOptions(opts).merge({search: "updated=true"}));
        const opts = proto.prepareRequest({});

        expect(opts.url).toBe("/request");
        expect(opts.search && opts.search.toString()).toEqual("updated=true");
    });

    it("writes request", () => {

        const proto = protocol.instead().writeRequest((request: In2, opts: RequestOptionsArgs) => {
            return new RequestOptions(opts).merge({body: request.request2});
        });
        const opts = proto.writeRequest({request2: "request2"}, {});

        expect(opts.body).toBe("request2");

    });

    it("updates request before it is written", () => {

        const proto = protocol.prior().updateRequest((request, opts) => {
            request.update = "update1";
            request.written = "rewritten1";
            return new RequestOptions(opts).merge({body: request});
        });
        const opts = proto.writeRequest({request: "request1"}, {});
        const body = opts.body as In;

        expect(body.request).toBe("request1");
        expect(body.update).toBe("update1");
        expect(body.written).toBe("written1");
    });

    it("updates request after it is written", () => {

        const proto = protocol.then().updateRequest(
            (request, opts) => {
                request.update = "update1";
                request.written = "rewritten1";
                return new RequestOptions(opts).merge({body: request});
            });
        const opts = proto.writeRequest({request: "request1"}, {});
        const body = opts.body as In;

        expect(body.request).toBe("request1");
        expect(body.update).toBe("update1");
        expect(body.written).toBe("rewritten1");
    });

    it("reads response", () => {

        const proto = protocol.instead().readResponse(() => {
            return {
                response2: "response2"
            } as Out2
        });
        const response = proto.readResponse(new Response(new ResponseOptions()));

        expect(response.response2).toBe("response2");
    });

    it("handles error", () => {

        const proto = protocol.then().handleError(error => {
            return {error};
        });
        const error: {error: any} = proto.handleError!("abc");

        expect(error.error).toBe("abc");
    });
});

describe("JSON protocol", () => {

    const protocol = JSON_PROTOCOL;

    it("writes request", () => {

        const request: In = {request: "some value", numeric: 13};
        const opts = protocol.writeRequest(request, {});
        const response: In = JSON.parse(opts.body);

        expect(opts.headers!.get("Content-Type")).toBe("application/json");
        expect(response.request).toBe(request.request);
        expect(response.numeric).toBe(request.numeric);
    });

    it("reads response", () => {

        const value: In = {
            request: "Request1",
            numeric: 333,
        };
        const read: In = protocol.readResponse(new Response(new ResponseOptions({
            body: JSON.stringify(value),
        })));

        expect(read.request).toBe(value.request);
        expect(read.numeric).toBe(value.numeric);
    });
});

import {RequestOptionsArgs, Response, RequestOptions, URLSearchParams} from "@angular/http";
import {DataType} from "./data";

export interface In {

    request?: string;
    update?: string;

}

export interface Out {

    response?: string;

}

export class TestDataType extends DataType<In, Out> {

    constructor() {
        super();
    }

    prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs {
        return new RequestOptions(options).merge({url: "/request", search: "prepared=true"})
    }

    writeRequest(request: In, options: RequestOptionsArgs): RequestOptionsArgs {
        return options.body = {
            request: "request1"
        }
    }

    readResponse(response: Response): Out {
        return {
            response: "response1"
        };
    }
}

describe("DataType", () => {

    const dataType = new TestDataType();

    it("Request prepared", () => {

        const type = dataType.prepareRequestWith(opts => new RequestOptions(opts).merge({search: "updated=true"}));
        const opts = type.prepareRequest({});

        expect(opts.url).toBe("/request");
        expect(opts.search && opts.search.toString()).toEqual("prepared=true");
    });

    it("Request prepared after", () => {

        const type = dataType.prepareRequestWith(opts => new RequestOptions(opts).merge({search: "updated=true"}), true);

        const opts = type.prepareRequest({});

        expect(opts.url).toBe("/request");
        expect(opts.search && opts.search.toString()).toEqual("updated=true");
    })
});

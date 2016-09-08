import {relativeUrl} from "./options";

describe("relativeUrl", () => {
    it("works without base URL", () => {
        expect(relativeUrl(undefined, "url")).toBe("url");
    });

    it("handles empty base URL", () => {
        expect(relativeUrl("", "url")).toBe("url");
    });

    it("resolves against base URL", () => {
        expect(relativeUrl("base-url", "url")).toBe("base-url/url");
    });

    it("resolves absolute URL", () => {
        expect(relativeUrl("/base-url", "/absolute-url")).toBe("/absolute-url");
    });

    it("resolves schema-qualified URL", () => {
        expect(relativeUrl("/base-url", "https://some.host/path")).toBe("https://some.host/path");
    });

    it("resolves URL with default schema", () => {
        expect(relativeUrl("/base-url", "//some.host/path")).toBe("//some.host/path");
    });

    it("resolves URL without schema", () => {
        expect(relativeUrl("/base-url", "://some.host/path")).toBe("://some.host/path");
    });

    it("resolves URL which looks like schema-qualified", () => {
        expect(relativeUrl("/base-url", "abc#http://some.host/path")).toBe("/base-url/abc#http://some.host/path");
    });
});

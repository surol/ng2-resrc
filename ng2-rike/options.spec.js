import { relativeUrl } from "./options";
describe("relativeUrl", function () {
    it("works without base URL", function () {
        expect(relativeUrl(undefined, "url")).toBe("url");
    });
    it("handles empty base URL", function () {
        expect(relativeUrl("", "url")).toBe("url");
    });
    it("resolves against base URL", function () {
        expect(relativeUrl("base-url", "url")).toBe("base-url/url");
    });
    it("resolves absolute URL", function () {
        expect(relativeUrl("/base-url", "/absolute-url")).toBe("/absolute-url");
    });
    it("resolves schema-qualified URL", function () {
        expect(relativeUrl("/base-url", "https://some.host/path")).toBe("https://some.host/path");
    });
    it("resolves URL with default schema", function () {
        expect(relativeUrl("/base-url", "//some.host/path")).toBe("//some.host/path");
    });
    it("resolves URL without schema", function () {
        expect(relativeUrl("/base-url", "://some.host/path")).toBe("://some.host/path");
    });
    it("resolves URL which looks like schema-qualified", function () {
        expect(relativeUrl("/base-url", "abc#http://some.host/path")).toBe("/base-url/abc#http://some.host/path");
    });
});
//# sourceMappingURL=options.spec.js.map
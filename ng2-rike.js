"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var common_1 = require("@angular/common");
var rike_1 = require("./ng2-rike/rike");
var status_component_1 = require("./ng2-rike/status.component");
var errors_component_1 = require("./ng2-rike/errors.component");
var event_source_provider_1 = require("./ng2-rike/event-source-provider");
__export(require("./ng2-rike/error-collector"));
__export(require("./ng2-rike/errors.component"));
__export(require("./ng2-rike/event"));
__export(require("./ng2-rike/event-source-provider"));
__export(require("./ng2-rike/field-error"));
__export(require("./ng2-rike/options"));
__export(require("./ng2-rike/protocol"));
__export(require("./ng2-rike/resource"));
__export(require("./ng2-rike/resource-provider"));
__export(require("./ng2-rike/rike"));
__export(require("./ng2-rike/status-collector"));
__export(require("./ng2-rike/status.component"));
/**
 * REST-like services module.
 */
var RikeModule = (function () {
    function RikeModule() {
    }
    RikeModule = __decorate([
        core_1.NgModule({
            imports: [common_1.CommonModule, http_1.HttpModule],
            providers: [
                rike_1.Rike,
                event_source_provider_1.provideEventSource({ useExisting: rike_1.Rike }),
            ],
            declarations: [
                status_component_1.RikeStatusComponent,
                errors_component_1.RikeErrorsComponent,
            ],
            exports: [
                status_component_1.RikeStatusComponent,
                errors_component_1.RikeErrorsComponent,
            ],
        }), 
        __metadata('design:paramtypes', [])
    ], RikeModule);
    return RikeModule;
}());
exports.RikeModule = RikeModule;

//# sourceMappingURL=ng2-rike.js.map

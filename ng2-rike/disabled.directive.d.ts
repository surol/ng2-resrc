import { StatusCollector } from "./status-collector";
export declare class RikeDisabledDirective {
    private _rikeDisabledBy;
    private _disabledByDefault;
    constructor(_rikeDisabledBy: StatusCollector);
    readonly disabled: boolean;
    rikeDisabled: boolean | undefined;
    rikeDisabledBy: StatusCollector;
}

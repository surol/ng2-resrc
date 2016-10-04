import { StatusCollector } from "./status-collector";
export declare class RikeReadonlyDirective {
    private _rikeReadonlyBy;
    private _readonlyByDefault;
    constructor(_rikeReadonlyBy: StatusCollector);
    readonly readonly: boolean;
    rikeReadonly: boolean | undefined;
    rikeReadonlyBy: StatusCollector;
}

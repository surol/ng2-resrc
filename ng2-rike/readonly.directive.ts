import {Directive, Optional, Input, HostBinding} from "@angular/core";
import {StatusCollector} from "./status-collector";

@Directive({
    selector: '[rikeReadonly],[rikeReadonlyBy]',
    exportAs: 'rikeReadonly',
})
export class RikeReadonlyDirective {

    private _readonlyByDefault = false;

    constructor(@Optional() private _rikeReadonlyBy: StatusCollector) {
    }

    @HostBinding("readonly")
    @HostBinding("class.rike-readonly")
    get readonly(): boolean {
        return this.rikeReadonlyBy.processing || this._readonlyByDefault;
    }

    @Input()
    set rikeReadonly(disabled: boolean | undefined) {
        this._readonlyByDefault = !!disabled;
    }

    get rikeReadonlyBy(): StatusCollector {
        return this._rikeReadonlyBy;
    }

    @Input()
    set rikeReadonlyBy(collector: StatusCollector) {
        this._rikeReadonlyBy = collector;
    }

}

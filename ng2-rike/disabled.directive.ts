import {Directive, Optional, Input, HostBinding} from "@angular/core";
import {StatusCollector} from "./status-collector";

@Directive({
    selector: '[rikeDisabled],[rikeDisabledBy]',
    exportAs: 'rikeDisabled',
})
export class RikeDisabledDirective {

    private _disabledByDefault = false;

    constructor(@Optional() private _rikeDisabledBy: StatusCollector) {
    }

    @HostBinding("disabled")
    @HostBinding("class.rike-disabled")
    get disabled(): boolean {
        return this.rikeDisabledBy.processing || this._disabledByDefault;
    }

    @Input()
    set rikeDisabled(disabled: boolean | undefined) {
        this._disabledByDefault = !!disabled;
    }

    get rikeDisabledBy(): StatusCollector {
        return this._rikeDisabledBy;
    }

    @Input()
    set rikeDisabledBy(collector: StatusCollector) {
        this._rikeDisabledBy = collector;
    }

}

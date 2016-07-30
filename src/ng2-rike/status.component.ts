import {Component, Input} from "@angular/core";
import {StatusLabels, StatusCollector} from "./status-collector";
import {RikeEventSource} from "./event";

@Component({
    selector: '[rikeStatus],[rikeStatusLabels],[rikeStatusLabelText]',
    template: `{{text}}`,
    host: {
        '[ngClass]': 'cssClass'
    }
})
export class RikeStatusComponent<L> {

    private _statusLabels?: StatusLabels<L>;
    private _rikeStatus?: StatusCollector<L>;
    private _labelText: (label: L) => string = label => label.toString();

    constructor(private _eventSources: RikeEventSource[]) {
    }

    get rikeStatus(): StatusCollector<L> {
        return this._rikeStatus || (this._rikeStatus = this.createStatus());
    }

    @Input()
    set rikeStatus(status: StatusCollector<L>) {
        this._rikeStatus = status;
    }

    get rikeStatusLabels(): StatusLabels<L> | undefined {
        return this._statusLabels;
    }

    @Input()
    set rikeStatusLabels(labels: StatusLabels<L> | undefined) {
        this._rikeStatus = undefined;
        this._statusLabels = labels;
    }

    get rikeStatusLabelText(): (label: L) => string {
        return this._labelText;
    }

    set rikeStatusLabelText(value: (label: L) => string) {
        this._labelText = value;
    }

    get cssClass(): any {
        return {
            "rike-status": true,
            "rike-status-processing": this.rikeStatus.processing,
            "rike-status-failed": this.rikeStatus.failed,
            "rike-status-cancelled": this.rikeStatus.cancelled,
            "rike-status-succeed": this.rikeStatus.succeed,
        }
    }

    get text(): string | undefined {

        const labels = this.rikeStatus.labels;

        if (!labels.length) {
            return undefined;
        }

        let text = "";

        for (let label of labels) {

            const t = this.rikeStatusLabelText(label);

            if (text) {
                text += ", ";
            }
            text += t;
        }
        if (this.rikeStatus.processing) {
            text += "...";
        }

        return text;
    }

    protected createStatus(): StatusCollector<L> {

        const status = new StatusCollector<L>();

        this.configureStatus(status);

        return status;
    }

    protected configureStatus(status: StatusCollector<L>) {
        if (this.rikeStatusLabels) {
            status.withLabels(this.rikeStatusLabels);
        }
        for (let esrc of this._eventSources) {
            status.subscribeOn(esrc.rikeEvents);
        }
    }

}

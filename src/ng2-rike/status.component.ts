import {Component, Input, OnDestroy} from "@angular/core";
import {StatusLabels, StatusCollector, StatusView, DEFAULT_STATUS_LABELS} from "./status-collector";

@Component({
    selector: '[rikeStatus],[rikeStatusLabels],[rikeStatusLabelText],[rikeStatusLabelClass]',
    template: `{{text}}`,
    host: {
        "[class]": "cssClass",
    }
})
export class RikeStatusComponent<L> implements OnDestroy {

    private _statusLabels?: {[operation: string]: StatusLabels<L>};
    private _statusView?: StatusView<L>;
    private _ownStatusView = false;
    private _labelText: (label: L) => string = label => label.toString();
    private _labelClass: (status: StatusView<L>) => string = defaultStatusClass;

    constructor(private _collector: StatusCollector) {
    }

    get collector(): StatusCollector {
        return this._collector;
    }

    get statusView(): StatusView<L> {
        if (this._statusView) {
            return this._statusView;
        }

        this._statusView = this.createStatusView();
        this._ownStatusView = true;

        return this._statusView;
    }

    get rikeStatus(): StatusView<L> | undefined {
        return this._statusView;
    }

    @Input()
    set rikeStatus(status: StatusView<L> | undefined) {
        if (status === this._statusView) {
            return;
        }
        this.releaseStatusView();
        this._statusView = status;
    }

    get rikeStatusLabels(): {[operation: string]: StatusLabels<L>} | undefined {
        return this._statusLabels;
    }

    @Input()
    set rikeStatusLabels(labels: {[operation: string]: StatusLabels<L>} | undefined) {
        this._statusView = undefined;
        this._statusLabels = labels;
    }

    get rikeStatusLabelText(): (label: L) => string {
        return this._labelText;
    }

    @Input()
    set rikeStatusLabelText(value: (label: L) => string) {
        this._labelText = value;
    }

    get rikeStatusLabelClass(): (status: StatusView<L>) => string {
        return this._labelClass;
    }

    @Input()
    set rikeStatusLabelClass(value: (status: StatusView<L>) => string) {
        this._labelClass = value;
    }

    get cssClass(): string {
        return this._labelClass(this.statusView);
    }

    get text(): string | undefined {

        const labels = this.statusView.labels;

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
        if (this.statusView.processing) {
            text += "...";
        }

        return text;
    }

    ngOnDestroy() {
        this.releaseStatusView();
    }

    protected createStatusView(): StatusView<L> {

        const labels =
            this.rikeStatusLabels
            || ((DEFAULT_STATUS_LABELS as any) as {[operation: string]: StatusLabels<L>});

        return this.collector.view(labels);
    }

    private releaseStatusView() {

        const statusView = this._statusView;

        if (statusView) {
            this._statusView = undefined;
            if (this._ownStatusView) {
                statusView.close();
            }
        }
    }

}

function defaultStatusClass<L>(status: StatusView<L>) {
    if (!status.labels.length) {
        return "rike-status rike-status-hidden";
    }
    if (this.statusView.processing) {
        return "rike-status rike-status-processing";
    }
    if (this.statusView.cancelled) {
        return "rike-status rike-status-cancelled";
    }
    if (this.statusView.failed) {
        return "rike-status rike-status-failed";
    }
    if (this.statusView.succeed) {
        return "rike-status rike-status-succeed";
    }
    return "rike-status rike-status-hidden";
}

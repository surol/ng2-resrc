import {Component, Input, Optional, OnDestroy} from "@angular/core";
import {StatusLabels, StatusCollector, StatusView, DEFAULT_STATUS_LABELS} from "./status-collector";
import {RikeEventSource} from "./event";

@Component({
    selector: '[rikeStatus],[rikeStatusLabels],[rikeStatusLabelText]',
    template: `{{text}}`,
    host: {
        '[ngClass]': 'cssClass'
    }
})
export class RikeStatusComponent<L> implements OnDestroy {

    private _statusLabels?: {[operation: string]: StatusLabels<L>};
    private _statusView?: StatusView<L>;
    private _ownStatusView = false;
    private _labelText: (label: L) => string = label => label.toString();

    constructor(private _collector: StatusCollector) {
    }

    get collector(): StatusCollector {
        return this._collector;
    }

    get rikeStatus(): StatusView<L> {
        if (this._statusView) {
            return this._statusView;
        }

        this._statusView = this.createStatusView();
        this._ownStatusView = true;

        return this._statusView;
    }

    @Input()
    set rikeStatus(status: StatusView<L>) {
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

    ngOnDestroy() {
        this.releaseStatusView();
    }

    protected createStatusView(): StatusView<L> {

        const status = (this.collector.view(DEFAULT_STATUS_LABELS) as any) as StatusView<L>;

        this.configureStatusView(status);

        return status;
    }

    protected configureStatusView(view: StatusView<L>) {
        if (this.rikeStatusLabels) {
            view.withLabels(this.rikeStatusLabels);
        }
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

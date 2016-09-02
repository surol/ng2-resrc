import { OnDestroy } from "@angular/core";
import { StatusCollector, StatusView, StatusLabelMap } from "./status-collector";
export declare class RikeStatusComponent<L> implements OnDestroy {
    private _collector;
    private _statusLabels?;
    private _statusView?;
    private _ownStatusView;
    private _labelText;
    private _labelClass;
    constructor(_collector: StatusCollector);
    readonly collector: StatusCollector;
    readonly statusView: StatusView<L>;
    rikeStatus: StatusView<L> | undefined;
    rikeStatusLabels: StatusLabelMap<L> | StatusLabelMap<L>[] | undefined;
    rikeStatusLabelText: (label: L) => string;
    rikeStatusLabelClass: (status: StatusView<L>) => string;
    readonly cssClass: string;
    readonly text: string | undefined;
    ngOnDestroy(): void;
    protected createStatusView(): StatusView<L>;
    private releaseStatusView();
}

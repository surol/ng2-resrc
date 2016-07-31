import {EventEmitter, Injectable, Optional, Inject} from "@angular/core";
import {RikeTarget} from "./rike";
import {RikeEvent, RikeEventSource} from "./event";

export const DEFAULT_STATUS_LABELS: {[operation: string]: StatusLabels<string>} = {
    "*": {
        processing: "Processing",
        failed: "Error",
        cancelled: "Cancelled"
    },
    "load": {
        processing: "Loading",
    },
    "send": {
        processing: "Sending",
        succeed: "Sent",
    },
    "read": {
        processing: "Loading",
    },
    "create": {
        processing: "Creating",
        succeed: "Created",
    },
    "update": {
        processing: "Updating",
        succeed: "Updated"
    },
    "delete": {
        processing: "Deleting",
        succeed: "Deleted",
    },
};

export interface StatusLabels<L> {
    processing?: L | ((target: RikeTarget<any, any>) => L);
    failed?: L | ((target: RikeTarget<any, any>) => L);
    cancelled?: L | ((target: RikeTarget<any, any>) => L);
    succeed?: L | ((target: RikeTarget<any, any>) => L);
}

@Injectable()
export class StatusCollector {

    private _views: {[id: string]: StatusViewImpl<any>} = {};
    private _targetStatuses: {[targetId: string]: TargetStatus} = {};
    private _defaultView?: StatusViewImpl<string>;
    private _viewIdSeq = 0;

    constructor(@Inject(RikeEventSource) @Optional() eventSources?: RikeEventSource[]) {
        if (eventSources) {
            for (let esrc of eventSources) {
                this.subscribeOn(esrc.rikeEvents);
            }
        }
    }

    get labels(): string[] {
        return this._defaultView ? this._defaultView.labels : [];
    }

    get processing(): boolean {
        return this._defaultView && this._defaultView.processing || false;
    }

    get failed(): boolean {
        return this._defaultView && this._defaultView.failed || false;
    }

    get cancelled(): boolean {
        return this._defaultView && this._defaultView.cancelled || false;
    }

    get succeed(): boolean {
        return this._defaultView && this._defaultView.succeed || false;
    }

    subscribeOn(events: EventEmitter<RikeEvent>) {
        events.subscribe((event: RikeEvent) => this.applyEvent(event));
    }

    view<L>(labels: {[operation: string]: StatusLabels<L>}): StatusView<L> {
        return this.addView("" + ++this._viewIdSeq, labels);
    }

    private addView<L>(id: string, labels: {[operation: string]: StatusLabels<L>}): StatusViewImpl<L> {

        const view = new StatusViewImpl<L>(this._views, this._targetStatuses, id).withLabels(labels);

        this._views[id] = view;

        return view;
    }

    private applyEvent(event: RikeEvent) {
        this.initDefaultView(event);
        this.updateTargetStatuses(event);
        this.resetViews();
    }

    private initDefaultView(event: RikeEvent) {
        if (!this._defaultView) {
            this._defaultView = this.addView("default", event.target.rike.options.defaultStatusLabels);
        }
    }

    private updateTargetStatuses(event: RikeEvent) {

        const uniqueId = event.target.uniqueId;

        if (!event.complete) {
            this._targetStatuses[uniqueId] = {
                start: event,
            }
        } else {

            const targetStatus = this._targetStatuses[uniqueId];

            if (!targetStatus) {
                this._targetStatuses[uniqueId] = {start: event, end: event};
            } else {
                targetStatus.end = event;
            }
        }
    }

    private resetViews() {
        for (let id in this._views) {
            if (this._views.hasOwnProperty(id)) {
                this._views[id].reset();
            }
        }
    }

}

export interface StatusView<L> {

    readonly labels: L[];

    readonly processing: boolean;

    readonly failed: boolean;

    readonly cancelled: boolean

    readonly succeed: boolean;

    withLabels(labels: {[operation: string]: StatusLabels<L>}): this;

    withOperationLabels(operation: string, labels: StatusLabels<L>): this;

    close(): void;

}

class StatusViewImpl<L> implements StatusView<L> {

    private _labels: {[operation: string]: StatusLabels<L>} = {};
    private _combined?: CombinedStatus<L>;

    constructor(
        private _views: {[id: string]: StatusViewImpl<any>},
        private _targetStatuses: {[targetId: string]: TargetStatus},
        private _id: string) {
    }

    get labels(): L[] {
        return this.combined && this.combined.labels || [];
    }

    get processing(): boolean {
        return this.combined && this.combined.processing || false;
    }

    get failed(): boolean {
        return this.combined && this.combined.failed || false;
    }

    get cancelled(): boolean {
        return this.combined && this.combined.cancelled || false;
    }

    get succeed(): boolean {
        return this.combined && this.combined.succeed || false;
    }

    withLabels(labels: {[operation: string]: StatusLabels<L>}): this {
        for (let operation in labels) {
            if (labels.hasOwnProperty(operation)) {
                this.withOperationLabels(operation, labels[operation]);
            }
        }
        return this;
    }

    withOperationLabels(operation: string, labels: StatusLabels<L>): this {
        this._combined = undefined;
        this._labels[operation] = labels!;
        return this;
    }

    reset() {
        this._combined = undefined;
    }

    close() {
        delete this._views[this._id];
    }

    private get combined(): CombinedStatus<L> | undefined {
        if (this._combined) {
            return this._combined;
        }

        let combined: CombinedStatus<L> | undefined = undefined;

        for (let targetId in this._targetStatuses) {
            if (this._targetStatuses.hasOwnProperty(targetId)) {

                const targetStatus: TargetStatus = this._targetStatuses[targetId]!;

                if (!targetStatus) {
                    continue;
                }

                combined = combineLabels(combined, this.labelFor(targetStatus));
            }
        }

        return this._combined = combined;
    }

    private labelFor(status: TargetStatus): StatusLabel<L> | undefined {
        return labelOf(status, this._labels[status.start.operation.name]) || labelOf(status, this._labels["*"]);
    }

}

interface TargetStatus {
    start: RikeEvent;
    end?: RikeEvent;
}

interface StatusLabel<L> {
    label: L;
    processing?: boolean;
    failed?: boolean;
    cancelled?: boolean;
    succeed?: boolean;
}

interface CombinedStatus<L> {
    targets?: RikeTarget<any, any>;
    labels: L[];
    processing?: boolean;
    failed?: boolean;
    cancelled?: boolean;
    succeed?: boolean;
}

function labelOf<L>(status: TargetStatus, labels?: StatusLabels<L>): StatusLabel<L> | undefined {
    if (!labels) {
        return undefined;
    }

    const end = status.end;

    if (!end) {
        const processing = evalLabel(status, labels.processing);
        return processing && {label: processing, processing: true};
    }
    if (end.cancel) {
        const cancelled = evalLabel(status, labels.cancelled);
        return cancelled && {label: cancelled, cancelled: true};
    }
    if (end.error) {
        const failed = evalLabel(status, labels.failed);
        return failed && {label: failed, failed: true};
    }

    const succeed = evalLabel(status, labels.succeed);
    return succeed && {label: succeed, succeed: true};
}

function evalLabel<L>(status: TargetStatus, label?: L | ((target: RikeTarget<any, any>) => L)): L | undefined {
    if (!label) {
        return undefined;
    }
    if (typeof label !== "function") {
        return label;
    }

    const labelFn = label as ((target: RikeTarget<any, any>) => L);

    return labelFn(status.start.target);
}

function combineLabels<L>(combined?: CombinedStatus<L>, label?: StatusLabel<L>): CombinedStatus<L> | undefined {
    if (!label) {
        return combined;
    }

    const lbl = label.label;

    if (!combined) {
        return {
            labels: [lbl],
            processing: label.processing,
            failed: label.failed,
            cancelled: label.cancelled,
            succeed: label.succeed,
        }
    }

    combined.processing = combined.processing || label.processing;
    combined.failed = combined.failed || label.failed;
    combined.cancelled = combined.cancelled || label.cancelled;
    combined.succeed = combined.succeed || label.succeed;

    for (let l of combined.labels) {
        if (l === lbl) {
            return combined;
        }
    }

    combined.labels.push(lbl);

    return combined;
}

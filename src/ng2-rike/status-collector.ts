import {EventEmitter, Injectable, Optional, Inject} from "@angular/core";
import {RikeTarget} from "./rike";
import {RikeEvent, RikeEventSource} from "./event";

/**
 * Rike operation status labels.
 *
 * Each field corresponds to particular status. The value of this field could be either label, or function returning
 * label, accepting Rike operations target as the only argument.
 *
 * When the label is absent the corresponding status won't be displayed.
 *
 * @param <L> a type of status labels.
 */
export interface StatusLabels<L> {

    /**
     * Processing label. It is applied when operation is initiated, but not completed yet.
     */
    processing?: L | ((target: RikeTarget<any, any>) => L);

    /**
     * Failure label. It is applied when operation failed due to error.
     */
    failed?: L | ((target: RikeTarget<any, any>) => L);

    /**
     * Cancellation label. It is applied when operation is cancelled.
     */
    cancelled?: L | ((target: RikeTarget<any, any>) => L);

    /**
     * Success label. It is applied when operation succeed.
     */
    succeed?: L | ((target: RikeTarget<any, any>) => L);

}

/**
 * A map of Rike operations status labels.
 *
 * Each key corresponds to particular operation name, and it value is status labels to apply to this operation.
 *
 * If labels for the given operation is not specified, or the is no label for the operation status, the label will be
 * searched under the `"*"` key.
 *
 * @param <L> a type of status labels.
 */
export interface StatusLabelMap<L> {
    [operation: string]: StatusLabels<L>;
}

/**
 * Default map of Rike operations status labels.
 *
 * Default status labels are strings.
 */
export const DEFAULT_STATUS_LABELS: StatusLabelMap<string> = {
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

/**
 * Rike operations status collecting service.
 *
 * It collects statuses of all available [Rike event sources][RikeEventSource].
 *
 * This service is registered automatically along with every event source by `provideEventSource()` method.
 * But unlike event sources it is not a multi-provider.
 *
 * An instance of this class could be created on its own. Then it is necessary to subscribe it on Rike events with
 * `subscribeOn` method.
 *
 * It is possible to read statuses and string labels from the service itself. Alternatively a view can be created
 * to read labels of arbitrary type.
 */
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

    /**
     * Current status labels.
     *
     * @return {string[]} array of string labels.
     */
    get labels(): string[] {
        return this._defaultView ? this._defaultView.labels : [];
    }

    /**
     * Whether some operation is in process.
     */
    get processing(): boolean {
        return this._defaultView && this._defaultView.processing || false;
    }

    /**
     * Whether some operation failed.
     */
    get failed(): boolean {
        return this._defaultView && this._defaultView.failed || false;
    }

    /**
     * Whether some operation cancelled.
     */
    get cancelled(): boolean {
        return this._defaultView && this._defaultView.cancelled || false;
    }

    /**
     * Whether some operation succeed.
     */
    get succeed(): boolean {
        return this._defaultView && this._defaultView.succeed || false;
    }

    /**
     * Subscribes this collector on the given Rike events emitter.
     *
     * @param events Rike events emitter to subscribe on.
     */
    subscribeOn(events: EventEmitter<RikeEvent>) {
        events.subscribe((event: RikeEvent) => this.applyEvent(event));
    }

    /**
     * Constructs a Rike operations status view.
     *
     * When the view is no longer needed a {{StatusView.close}} method should be called to release resources
     * associated with it.
     *
     * @param <L> a type of status labels.
     * @param labels a map of Rike operations status labels to use by this view.
     *
     * @return {StatusView<L>} new status view.
     */
    view<L>(labels: StatusLabelMap<L>): StatusView<L> {
        return this.addView("" + ++this._viewIdSeq, labels);
    }

    private addView<L>(id: string, labels: StatusLabelMap<L>): StatusViewImpl<L> {

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

/**
 * Rike operations status view.
 *
 * It could be created by {{StatusCollector.view}} and will be updated with new statuses until the `close()`
 * method call.
 *
 * @param <L> a type of status labels.
 */
export interface StatusView<L> {

    /**
     * Current status labels.
     *
     * @return {L[]} array of status labels.
     */
    readonly labels: L[];

    /**
     * Whether some operation is in process.
     */
    readonly processing: boolean;

    /**
     * Whether some operation failed.
     */
    readonly failed: boolean;

    /**
     * Whether some operation cancelled.
     */
    readonly cancelled: boolean

    /**
     * Whether some operation succeed.
     */
    readonly succeed: boolean;

    /**
     * Registers new operation status labels.
     *
     * @param labels a map of operation status labels.
     */
    withLabels(labels: StatusLabelMap<L>): this;

    /**
     * Registers new status labels for the given operation.
     *
     * @param operation target operation name.
     * @param labels operation status labels.
     */
    withOperationLabels(operation: string, labels: StatusLabels<L>): this;

    /**
     * Closes the view.
     *
     * This method should be called when the view is no longer needed. After it is called the view won't be updated
     * any more.
     */
    close(): void;

}

class StatusViewImpl<L> implements StatusView<L> {

    private _labels: StatusLabelMap<L> = {};
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

    withLabels(labels: StatusLabelMap<L>): this {
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

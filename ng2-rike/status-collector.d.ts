import { EventEmitter } from "@angular/core";
import { RikeTarget } from "./rike";
import { RikeEvent, RikeEventSource } from "./event";
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
 * Default status label.
 */
export declare type DefaultStatusLabel = string | {
    /**
     * Status identifier.
     */
    id?: string;
    /**
     * Status message.
     */
    message: string;
    /**
     * CSS class to indicate this status.
     */
    cssClass?: string;
};
/**
 * Default map of Rike operations status labels.
 *
 * Default status labels are strings.
 */
export declare const DEFAULT_STATUS_LABELS: StatusLabelMap<DefaultStatusLabel>;
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
export declare class StatusCollector {
    private _views;
    private _targetStatuses;
    private _defaultView?;
    private _viewIdSeq;
    constructor(eventSources?: RikeEventSource[]);
    /**
     * Current status labels.
     *
     * @return {DefaultStatusLabel[]} array of default labels.
     */
    readonly labels: DefaultStatusLabel[];
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
    readonly cancelled: boolean;
    /**
     * Whether some operation succeed.
     */
    readonly succeed: boolean;
    /**
     * Subscribes this collector on the given Rike events emitter.
     *
     * @param events Rike events emitter to subscribe on.
     */
    subscribeOn(events: EventEmitter<RikeEvent>): void;
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
    view<L>(labels: StatusLabelMap<L>): StatusView<L>;
    private addView<L>(id, labels);
    private applyEvent(event);
    private initDefaultView(event);
    private updateTargetStatuses(event);
    private resetViews();
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
    readonly cancelled: boolean;
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

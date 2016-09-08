import {Component, Input, OnInit, OnDestroy, Optional} from "@angular/core";
import {ErrorCollector, ErrorSubscription} from "./error-collector";
import {FieldErrors, FieldError} from "./field-error";

@Component({
    selector: '[rikeErrors],[rikeErrorsOf]',
    template:
    `
    <ul class="rike-error-list" *ngIf="errors.length">
        <li class="rike-error" *ngFor="let error of errors">{{error.message}}</li>
    </ul>
    `,
    host: {
        "[class.rike-errors]": "true"
    }
})
export class RikeErrorsComponent implements OnInit, OnDestroy {

    private _field?: string;
    private _errors: FieldError[] = [];
    private _initialized = false;
    private _subscription?: ErrorSubscription;

    constructor(@Optional() private _collector?: ErrorCollector) {
    }

    get rikeErrors(): string | undefined {
        return this._field;
    }

    @Input()
    set rikeErrors(field: string | undefined) {
        if (this._field === field) {
            return;
        }
        this._field = field;
        this.reinit();
    }

    get errorCollector(): ErrorCollector {
        return this._collector || (this._collector = this.createCollector());
    }

    get rikeErrorsOf(): ErrorCollector | undefined {
        return this._collector;
    }

    @Input()
    set rikeErrorsOf(collector: ErrorCollector | undefined) {
        if (this._collector === collector) {
            return;
        }
        this._collector = collector;
        this.reinit();
    }

    get errors(): FieldError[] {
        return this._errors;
    }

    ngOnInit() {
        this._initialized = true;
        this.subscribe();
    }

    ngOnDestroy() {
        this._initialized = false;
        this.unsubscribe();
    }

    //noinspection JSMethodCanBeStatic
    protected createCollector(): ErrorCollector {
        return new ErrorCollector();
    }

    protected updateErrors(errors: FieldErrors) {

        const list: FieldError[] = [];

        for (let field in errors) {
            if (errors.hasOwnProperty(field)) {
                list.push(...errors[field]);
            }
        }

        this._errors = list;
    }

    private reinit() {
        if (this._initialized) {
            this.unsubscribe();
            this.subscribe();
        }
    }

    private subscribe() {
        if (this._field) {
            this._subscription =
                this.errorCollector.subscribe(this._field, errors => this.updateErrors(errors)).refresh();
        } else {
            this._subscription =
                this.errorCollector.subscribeForRest(errors => this.updateErrors(errors)).refresh();
        }
    }

    private unsubscribe() {
        this._errors = [];

        const subscription = this._subscription;

        if (subscription) {
            delete this._subscription;
            subscription.unsubscribe();
        }
    }

}

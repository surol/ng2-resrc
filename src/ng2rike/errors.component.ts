import {Component, Input, OnInit, OnDestroy, Optional} from "@angular/core";
import {ErrorCollector, ErrorSubscription} from "./error-collector";
import {FieldErrors, FieldError} from "./field-error";

@Component({
    selector: '[rikeErrors],[rikeErrorsField]',
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

    private _rikeErrorsField = "*";
    private _errors: FieldError[] = [];
    private _init = false;
    private _subscription?: ErrorSubscription;

    constructor(@Optional() private _collector?: ErrorCollector) {
    }

    get rikeErrorsField(): string {
        return this._rikeErrorsField;
    }

    @Input()
    set rikeErrorsField(field: string) {
        if (this._rikeErrorsField === field) {
            return;
        }
        this._rikeErrorsField = field;
        if (this._init) {
            this.unsubscribe();
            this.subscribe();
        }
    }

    get rikeErrors(): ErrorCollector {
        return this._collector || (this._collector = this.createCollector());
    }

    @Input()
    set rikeErrors(collector: ErrorCollector) {
        this._collector = collector;
    }

    get errors(): FieldError[] {
        return this._errors;
    }

    ngOnInit() {
        this._init = true;
        this.subscribe();
    }

    ngOnDestroy() {
        this._init = false;
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

    private subscribe() {
        if (this.rikeErrorsField) {
            this._subscription =
                this.rikeErrors.subscribe(this.rikeErrorsField, errors => this.updateErrors(errors)).refresh();
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

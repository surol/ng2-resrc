import { OnInit, OnDestroy } from "@angular/core";
import { ErrorCollector } from "./error-collector";
import { FieldErrors, FieldError } from "./field-error";
export declare class RikeErrorsComponent implements OnInit, OnDestroy {
    private _collector?;
    private _rikeErrorsField;
    private _errors;
    private _init;
    private _subscription?;
    constructor(_collector?: ErrorCollector);
    rikeErrorsField: string;
    rikeErrors: ErrorCollector;
    readonly errors: FieldError[];
    ngOnInit(): void;
    ngOnDestroy(): void;
    protected createCollector(): ErrorCollector;
    protected updateErrors(errors: FieldErrors): void;
    private subscribe();
    private unsubscribe();
}

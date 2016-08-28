import { OnInit, OnDestroy } from "@angular/core";
import { ErrorCollector } from "./error-collector";
import { FieldErrors, FieldError } from "./field-error";
export declare class RikeErrorsComponent implements OnInit, OnDestroy {
    private _collector?;
    private _field?;
    private _errors;
    private _initialized;
    private _subscription?;
    constructor(_collector?: ErrorCollector);
    rikeErrors: string | undefined;
    readonly errorCollector: ErrorCollector;
    rikeErrorsOf: ErrorCollector | undefined;
    readonly errors: FieldError[];
    ngOnInit(): void;
    ngOnDestroy(): void;
    protected createCollector(): ErrorCollector;
    protected updateErrors(errors: FieldErrors): void;
    private reinit();
    private subscribe();
    private unsubscribe();
}

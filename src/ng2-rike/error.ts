import {Response, ResponseOptions, ResponseType} from "@angular/http";

/**
 * Error response options interface.
 */
export interface ErrorResponseOpts {

    /**
     * HTTP response.
     */
    readonly response: Response;

    /**
     * Field errors.
     */
    readonly errors: FieldErrors;

}

/**
 * Error response.
 *
 * Any object can be converted to `ErrorResponse` with `toErrorResponse()` function.
 */
export class ErrorResponse implements ErrorResponseOpts {

    /**
     * HTTP response.
     */
    readonly response: Response;

    /**
     * Field errors.
     */
    readonly errors: FieldErrors;

    constructor(opts: ErrorResponseOpts) {
        this.response = opts.response;
        this.errors = opts.errors;
    }

}

/**
 * Field errors.
 *
 * Any field of this object is an arrays of errors corresponding to this field. Such array should never be empty.
 *
 * The special case is field named `"*"`. It contains errors not related to particular field.
 */
export interface FieldErrors {
    [field: string]: FieldError[];
}

/**
 * Field error.
 */
export interface FieldError {

    /**
     * Optional error code.
     */
    code?: string;

    /**
     * Error message.
     */
    message: string;

}

/**
 * Converts any object to `ErrorResponse`.
 *
 * If the `error` object is already of type `ErrorResponse` then just returns it.
 *
 * This function can be used as a [error handler][Protocol.handleError] to convert HTTP responses.
 *
 * @param error object to convert.
 *
 * @return {ErrorResponse} constructed error response.
 */
export function toErrorResponse(error: any): ErrorResponse {
    if (error instanceof ErrorResponse) {
        // Error is already of the desired type.
        return error;
    }
    if (error instanceof Response) {

        const response = error;
        let body: any | undefined = undefined;

        // Attempt to parse JSON body
        if (response.headers.get("Content-Type") === "application/json") {
            try {
                body = response.json()
            } catch (e) {
                console.log("Failed to parse JSON error response", e);
            }
        }

        const fieldErrors = toFieldErrors(body);

        if (fieldErrors) {
            return new ErrorResponse({
                response,
                errors: fieldErrors,
            });
        }

        return defaultErrorResponse(response);
    }

    // Error has `ErrorResponseOpts` interface?
    const errorOpts = error as ErrorResponseOpts;

    if (errorOpts.response instanceof Response && errorOpts.errors instanceof Array) {
        return new ErrorResponse(errorOpts);
    }

    const fieldErrors = toFieldErrors(error);

    if (fieldErrors) {
        return new ErrorResponse({
            response: syntheticResponse(null),
            errors: fieldErrors,
        });
    }

    return defaultErrorResponse(syntheticResponse(error));
}

function syntheticResponse(error: any) {

    const statusText = error != null ? error.toString() : null;

    return new Response(new ResponseOptions({
        type: ResponseType.Error,
        status: 500,
        statusText: statusText || "Unknown error"
    }));
}

function defaultErrorResponse(response: Response): ErrorResponse {

    let message = "ERROR " + response.status;

    if (response.statusText && response.statusText.toLowerCase() != "ok") {
        message += ": " + response.statusText;
    }
    return new ErrorResponse({
        response,
        errors: {"*": [{code: "HTTP" + response.status, message}]},
    })
}

function toFieldErrors(data: any): FieldErrors | undefined {
    if (data == null) {
        return;
    }
    if (data instanceof Array) {

        const fieldErrors = data.map(toFieldError).filter(notEmptyError);

        return fieldErrors.length ? {"*": fieldErrors} : undefined;
    }
    if (typeof data !== "object") {

        const fieldErrors = [{message: data.toString()}].filter(notEmptyError);

        return fieldErrors.length ? {"*": fieldErrors} : undefined;
    }

    const errors = data as FieldErrors;
    const result: FieldErrors = {};
    let hasErrors = false;

    for (let field in errors) {
        if (errors.hasOwnProperty(field)) {

            const errorArray = toFieldErrorArray(errors[field]);

            if (errorArray.length) {
                result[field] = errorArray;
                hasErrors = true;
            }
        }
    }

    return hasErrors ? result : undefined;
}

function toFieldErrorArray(data: any): FieldError[] {
    if (data == null) {
        return [];
    }
    if (data instanceof Array) {
        return data.map(toFieldError).filter(notEmptyError);
    }
    return [toFieldError(data)].filter(notEmptyError);
}

function toFieldError(data: any): FieldError {
    if (data == null) {
        return {message: ""};
    }

    const fieldError = data as FieldError;

    if (typeof fieldError.message === "string" && (fieldError.code == null || fieldError.code === "string")) {
        return fieldError;
    }
    if (fieldError.message != null) {
        return {
            code: fieldError.code != null ? fieldError.code.toString() : undefined,
            message: fieldError.message.toString(),
        };
    }

    return {message: fieldError.toString()};
}

function notEmptyError(item?: FieldError): boolean {
    return !!item && (!!item.message || !!item.code);
}

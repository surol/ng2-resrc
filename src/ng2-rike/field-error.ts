import {Response, ResponseOptions, ResponseType} from "@angular/http";
import {Protocol, ErrorResponse} from "./protocol";

//noinspection JSUnusedLocalSymbols
const _Protocol_import = Protocol;

/**
 * Error response.
 *
 * Any object can be converted to `ErrorResponse` with `toErrorResponse()` function.
 */
export interface FieldErrorResponse extends ErrorResponse {

    /**
     * Field errors.
     */
    fieldErrors: FieldErrors;

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
 * Appends field errors to {{ErrorResponse}}.
 *
 * If field errors already present in `ErrorResponse` then does nothing.
 *
 * This function can be used as {{Protocol}} error handler error handler.
 *
 * @param error object to convert.
 *
 * @return {FieldErrorResponse} constructed error httpResponse.
 */
export function addFieldErrors(error: ErrorResponse): FieldErrorResponse {

    const response = error as FieldErrorResponse;

    if (response.fieldErrors) {
        // Field errors already present.
        return response;
    }

    const httpResponse = error.response;
    let body: any | undefined = undefined;

    // Attempt to parse JSON body
    if (httpResponse.headers.get("Content-Type") === "application/json") {
        try {
            body = httpResponse.json()
        } catch (e) {
            console.log("Failed to parse JSON error response", e);
        }
    }

    const fieldErrors = toFieldErrors(body);

    if (fieldErrors) {
        response.fieldErrors = fieldErrors;
        return response;
    }

    return defaultFieldErrors(response);
}

function defaultFieldErrors(response: FieldErrorResponse): FieldErrorResponse {

    const httpResponse = response.response;
    let message = "ERROR " + httpResponse.status;

    if (httpResponse.statusText && httpResponse.statusText.toLowerCase() != "ok") {
        message += ": " + httpResponse.statusText;
    }

    response.fieldErrors = {"*": [{code: "HTTP" + httpResponse.status, message}]};

    return response;
}

function toFieldErrors(data: any): FieldErrors | undefined {
    if (data == null) {
        return;
    }
    if (Array.isArray(data)) {

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
    if (Array.isArray(data)) {
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

import { ErrorResponse } from "./protocol";
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
 * This function can be used as {{Protocol}} error handler.
 *
 * @param error object to convert.
 *
 * @return {FieldErrorResponse} constructed error httpResponse.
 */
export declare function addFieldErrors(error: ErrorResponse): FieldErrorResponse;

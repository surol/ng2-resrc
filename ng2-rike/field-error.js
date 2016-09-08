function isJsonResponse(httpResponse) {
    var contentType = httpResponse.headers.get("Content-Type");
    if (!contentType) {
        return false;
    }
    var idx = contentType.indexOf(";");
    if (idx >= 0) {
        contentType = contentType.substring(0, idx);
    }
    return contentType.trim() === "application/json";
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
export function addFieldErrors(error) {
    var response = error;
    if (response.fieldErrors) {
        // Field errors already present.
        return response;
    }
    var httpResponse = error.response;
    var body = undefined;
    // Attempt to parse JSON body
    if (isJsonResponse(httpResponse)) {
        try {
            body = httpResponse.json();
        }
        catch (e) {
            console.error("Failed to parse JSON error response", e);
        }
    }
    var fieldErrors = toFieldErrors(body);
    if (fieldErrors) {
        response.fieldErrors = fieldErrors;
        return response;
    }
    return defaultFieldErrors(response);
}
function defaultFieldErrors(response) {
    var httpResponse = response.response;
    var message = "ERROR " + httpResponse.status;
    if (httpResponse.statusText && httpResponse.statusText.toLowerCase() != "ok") {
        message += ": " + httpResponse.statusText;
    }
    response.fieldErrors = { "*": [{ code: "HTTP" + httpResponse.status, message: message }] };
    return response;
}
function toFieldErrors(data) {
    if (data == null) {
        return;
    }
    if (Array.isArray(data)) {
        var fieldErrors = data.map(toFieldError).filter(notEmptyError);
        return fieldErrors.length ? { "*": fieldErrors } : undefined;
    }
    if (typeof data !== "object") {
        var fieldErrors = [{ message: data.toString() }].filter(notEmptyError);
        return fieldErrors.length ? { "*": fieldErrors } : undefined;
    }
    var errors = data;
    var result = {};
    var hasErrors = false;
    for (var field in errors) {
        if (errors.hasOwnProperty(field)) {
            var errorArray = toFieldErrorArray(errors[field]);
            if (errorArray.length) {
                result[field] = errorArray;
                hasErrors = true;
            }
        }
    }
    return hasErrors ? result : undefined;
}
function toFieldErrorArray(data) {
    if (data == null) {
        return [];
    }
    if (Array.isArray(data)) {
        return data.map(toFieldError).filter(notEmptyError);
    }
    return [toFieldError(data)].filter(notEmptyError);
}
function toFieldError(data) {
    if (data == null) {
        return { message: "" };
    }
    var fieldError = data;
    if (typeof fieldError.message === "string" && (fieldError.code == null || fieldError.code === "string")) {
        return fieldError;
    }
    if (fieldError.message != null) {
        return {
            code: fieldError.code != null ? fieldError.code.toString() : undefined,
            message: fieldError.message.toString(),
        };
    }
    return { message: fieldError.toString() };
}
function notEmptyError(item) {
    return !!item && (!!item.message || !!item.code);
}
//# sourceMappingURL=field-error.js.map
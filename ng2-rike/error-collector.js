import { Inject, Injectable, Optional } from "@angular/core";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { addFieldErrors } from "./field-error";
import { RikeEventSource } from "./event";
/**
 * An error collecting service.
 *
 * It collects errors from all available [Rike event sources][RikeEventSource]. It uses `fieldErrors()` method
 * to obtain a `FieldErrors` instance from {{RikeErrorEvent}}. Then it notifies all subscribers on when errors received
 * or removed.
 *
 * This service is registered automatically along with every event source by `provideEventSource()` function.
 * But unlike event sources it is not a multi-provider.
 *
 * An instance of this class could be created on its own. Then it is necessary to subscribe it on Rike events with
 * `subscribeOn` method.
 */
var ErrorCollector = (function () {
    function ErrorCollector(_eventSources) {
        this._eventSources = _eventSources;
        this._emitters = {};
        this._targetErrors = {};
        this._initialized = false;
    }
    /**
     * Subscribes this collector on the given Rike events emitter.
     *
     * @param events Rike events emitter to subscribe on.
     */
    ErrorCollector.prototype.subscribeOn = function (events) {
        var _this = this;
        return events.subscribe(function (event) { return _this.handleEvent(event); }, function (error) { return _this.handleError(error); });
    };
    /**
     * Adds subscription for errors corresponding to the given field.
     *
     * If the field name is `"*"`, then subscriber will be notified on error changes for all fields except those ones
     * with existing subscriptions.
     *
     * @param field target field name.
     * @param next function that will be called on every target field errors update.
     * @param error function that will be called on errors.
     * @param complete function that will be called when no more errors will be reported.
     *
     * @return {ErrorSubscription} subscription.
     */
    ErrorCollector.prototype.subscribe = function (field, next, error, complete) {
        this.init();
        return this.fieldEmitter(field).subscribe(next, error, complete);
    };
    /**
     * Adds subscription for errors corresponding to all fields except those ones with existing subscriptions.
     *
     * Calling this method is the same as calling `subscribe("*", next, error, complete);`.
     *
     * @param next function that will be called on every errors update.
     * @param error function that will be called on errors.
     * @param complete function that will be called when no more errors will be reported.
     *
     * @return {ErrorSubscription} subscription.
     */
    ErrorCollector.prototype.subscribeForRest = function (next, error, complete) {
        return this.subscribe("*", next, error, complete);
    };
    //noinspection JSMethodCanBeStatic
    /**
     * Converts error to `FieldErrors`.
     *
     * This method uses `addFieldErrors` function by default. Override it if you are using custom error handler.
     *
     * @param error arbitrary error passed in [RikeEvent.error] field.
     *
     * @return {FieldErrors} field errors.
     */
    ErrorCollector.prototype.fieldErrors = function (error) {
        var errorResponse = error.errorResponse;
        if (errorResponse) {
            return addFieldErrors(errorResponse).fieldErrors;
        }
        return {
            "*": [
                { message: errorEventMessage(error) }
            ]
        };
    };
    ErrorCollector.prototype.fieldEmitter = function (field) {
        return this._emitters[field] || (this._emitters[field] = new FieldEmitter(field, this._emitters, this._targetErrors));
    };
    ErrorCollector.prototype.init = function () {
        if (this._initialized) {
            return;
        }
        this._initialized = true;
        if (this._eventSources) {
            for (var _i = 0, _a = this._eventSources; _i < _a.length; _i++) {
                var src = _a[_i];
                this.subscribeOn(src.rikeEvents);
            }
        }
    };
    ErrorCollector.prototype.handleEvent = function (event) {
        var affectedFields;
        if (!event.error) {
            affectedFields = this.clearTargetErrors(event.target);
        }
        else {
            affectedFields = this.targetErrors(event.target)
                .addAll(this.fieldErrors(event));
        }
        for (var field in affectedFields) {
            if (field !== "*" && affectedFields.hasOwnProperty(field)) {
                this.notify(field);
            }
        }
        this.notify("*"); // Always notify about common errors
    };
    ErrorCollector.prototype.handleError = function (error) {
        this.targetErrors(error.target).add("*", { message: errorEventMessage(error) });
        this.notify("*");
    };
    ErrorCollector.prototype.targetErrors = function (target) {
        var id = target.uniqueId;
        return this._targetErrors[id] || (this._targetErrors[id] = new TargetErrors(target, this._emitters));
    };
    ErrorCollector.prototype.clearTargetErrors = function (target) {
        var id = target.uniqueId;
        var targetErrors = this._targetErrors[id];
        if (!targetErrors) {
            return {};
        }
        delete this._targetErrors[id];
        return targetErrors.fieldsWithErrors;
    };
    ErrorCollector.prototype.notify = function (field) {
        var emitter = this._emitters[field];
        if (emitter) {
            emitter.notify();
        }
    };
    return ErrorCollector;
}());
export { ErrorCollector };
ErrorCollector.decorators = [
    { type: Injectable },
];
/** @nocollapse */
ErrorCollector.ctorParameters = function () { return [
    { type: Array, decorators: [{ type: Inject, args: [RikeEventSource,] }, { type: Optional },] },
]; };
function errorEventMessage(error) {
    if (error.cancel) {
        if (!error.cancelledBy) {
            return "Cancelled";
        }
        return "Cancelled by `" + error.cancelledBy.operation.name + "` operation";
    }
    return error.error.toString();
}
var FieldEmitter = (function () {
    function FieldEmitter(_field, _emitters, _targetErrors) {
        this._field = _field;
        this._emitters = _emitters;
        this._targetErrors = _targetErrors;
        this._emitter = new ReplaySubject(1);
        this._counter = 0;
    }
    FieldEmitter.prototype.subscribe = function (next, error, complete) {
        var _this = this;
        var subscr = this._emitter.subscribe(next, error, complete)
            .add(function () { return _this.unsubscribed(); });
        this._counter++;
        return subscr;
    };
    FieldEmitter.prototype.notify = function () {
        var errors = {};
        for (var id in this._targetErrors) {
            if (this._targetErrors.hasOwnProperty(id)) {
                this._targetErrors[id].appendTo(this._field, errors);
            }
        }
        this._emitter.next(errors);
    };
    FieldEmitter.prototype.unsubscribed = function () {
        if (!--this._counter) {
            delete this._emitters[this._field];
        }
    };
    return FieldEmitter;
}());
var TargetErrors = (function () {
    function TargetErrors(target, _emitters, errors) {
        this.target = target;
        this._emitters = _emitters;
        this._errors = errors || {};
    }
    Object.defineProperty(TargetErrors.prototype, "fieldsWithErrors", {
        get: function () {
            return this._errors;
        },
        enumerable: true,
        configurable: true
    });
    TargetErrors.prototype.add = function (field) {
        var errors = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            errors[_i - 1] = arguments[_i];
        }
        var existing = this._errors[field];
        if (!existing) {
            this._errors[field] = errors;
        }
        else {
            (_a = this._errors[field]).push.apply(_a, errors);
        }
        var _a;
    };
    TargetErrors.prototype.addAll = function (errors) {
        for (var field in errors) {
            if (errors.hasOwnProperty(field)) {
                this.add.apply(this, [field].concat(errors[field]));
            }
        }
        return errors;
    };
    TargetErrors.prototype.appendTo = function (field, out) {
        if (field !== "*") {
            // Append errors for the given field.
            appendErrorsTo(field, out, this._errors[field]);
            return;
        }
        // Append errors for all fields except the ones with subscribers.
        for (var f in this._errors) {
            if (f === "*" || this._errors.hasOwnProperty(f) && !this._emitters[f]) {
                appendErrorsTo(f, out, this._errors[f]);
            }
        }
    };
    return TargetErrors;
}());
function appendErrorsTo(field, fieldErrors, errors) {
    if (!errors || !errors.length) {
        return;
    }
    var errs = fieldErrors[field];
    if (errs) {
        errs.push.apply(errs, errors);
    }
    else {
        fieldErrors[field] = errors;
    }
}
//# sourceMappingURL=error-collector.js.map
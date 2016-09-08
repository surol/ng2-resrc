Rike: REST-like API for Angular2
================================

Rike enhances Angular `Http` service by supporting custom protocols and reporting request processing events.
This allows to report request status and errors in a generic way.

Rike defines resources as injectable Angular services. Operations performed on these resources are reported as events.

See the API documentation for more detailed description.

Usage
-----

To use it import a `RikeModule` to your application:
```typescript
import {NgModule} from "@angular/core";
import {RikeModule} from "ng2-rike";

@NgModule({
    imports: [RikeModule]
})
export class MyModule {
}
```

Targets And Operations
----------------------

The _target_ groups a set of _operations_. Only one operation on a given target can be performed at a time.
Invoking another operation cancels already active one.

```typescript
import {Component, OnInit} from "@angular/core";
import {Rike, JSON_PROTOCOL} from "ng2-rike";

@Component({
    selector: "my-component",
    template:
    `
    <div>{{content | json}}</div>
    `
})
class MyComponent implements OnInit {

    content: any;

    constructor(private _rike: Rike) {
    }
  
    ngOnInit() {
        this._rike.target("My Target")
            .operation("load", JSON_PROTOCOL)
            .get("/path/to/data.json")
            .subscribe(content => this.content = content, error => console.log(error));
    }

}
```

The `Rike` service can be injected to any component or service. It contains methods for creating targets (`RikeTarget`).
`RikeTarget` has methods for creating operations (`RikeOperation`). `RikeOperation` contains a set of methods
for performing HTTP requests (`GET`, `POST`, `PUT`, etc.)

Protocols
---------

Operations are performed using _protocols_ (`Protocol`). Protocol can be configured globally
(using `RikeOptions`, see below), set for target (`Rike.target(id, protocol)`), or for particular operation
(`RikeTarget.operation(name, protocol)`).

The protocol defines input and output data types. A value of input type is passed to operation when performing
`POST`, `PUT`, or `PATCH` HTTP request. A value of output type is reported as operation result.

Rike contains a few predefined protocols:

- `HTTP_PROTOCOl` uses any input value as `Http` request body (`Request.body`), and reports Http `Response` as an output.
- `JSON_PROTOCOL` uses any input value serialized to JSON as a request body, and reports deserialized JSON response
  as output.
- `jsonProtocol()` is the same as `JSON_PROTOCOL`, but specifies the types of input and output values.   

### Custom Protocols 

Custom protocol can be constructed based on existing one:
```typescript
import {RequestOptions, RequestOptionsArgs} from "@angular/http";
import {Protocol, HTTP_PROTOCOL} from "ng2-rike";

const TEXT_PROTOCOL: Protocol<string, string> = HTTP_PROTOCOL
    .instead().writeRequest((request: string, opts: RequestOptionsArgs) => new RequestOptions(opts).merge({
        body: request,
    }))
    .instead().readResponse(response => response.text());
```

The following methods could be used to customize protocol:

- `instead()` - perform operations instead of the ones defined in the original protocol:
    - `prepareRequest(prepare)` - prepare HTTP request with the given function.
    - `writeRequest(write)` - write HTTP request with the given function.
    - `readResponse(read)` - read HTTP response with the given function.
    - `handleError(handle)` - handle error with the given function.
- `prior()`/`then()` - perform operations prior/after the ones defined in the original protocol respectively:
    - `prepareRequest(prepare)` - prepare HTTP request with the given function.
    - `updateRequest(update)` - update HTTP request options with the given function.
    - `handleError(handle)` - handle error with the given function.
    - `apply(protocol)` - do all of the above by the given protocol.
    This is used when constructing default target protocols based on default one,
    and operation protocol based on default target one. 

### Handling Errors

Errors are reported as `ErrorResponse` objects.

Protocols can also handle such errors in application-specific way. E.g. when server reports errors in a specific format.
This is typically done by adding custom fields to `ErrorResponse` object.

```typescript
import {RequestOptions, RequestOptionsArgs} from "@angular/http";
import {ErrorResponse, JSON_PROTOCOL} from "ng2-rike";

export interface CustomErrorResponse extends ErrorResponse {
    errorMessage?: string;    
}

const CUSTOM_PROTOCOL = JSON_PROTOCOL
    .then().handleError(error => {
        const customError = error as CustomErrorResponse;
        customError.errorMessage = error.response.text();
        return customError;
    });
```

### Field Errors

Rike contains an implementation of error handler, which treats JSON responses in a predefined format as input field
errors, if possible. Otherwise it handles errors in a generic way.
 
The expected error response format is following JSON:
```
{
  "field": [
    {
      "code": "error.code",
      "message": "Error message"
    },
    ...
  ],
  ...
}
```
Where `field` is arbitrary input field name caused this error. There are multiple errors possible per field,
and multiple fields with errors could be reported. The special field named `*` is reserved to report generic errors.

The error handler appends a `fieldErrors` field to generic `ErrorResponse`, thus effectively converting it to
`FieldErrorResponse` object.

This error format is used by `ErrorCollector` service and `rikeErrors` component to display Rike operation errors. 

Use the following module initialization code to apply this handler by default:
```typescript
import {NgModule} from "@angular/core";
import {RikeModule, RikeOptions, BaseRikeOptions, HTTP_PROTOCOL, addFieldErrors} from "ng2-rike";

@NgModule({
    imports: [RikeModule],
    providers: [
        {
            provide: RikeOptions,
            useValue: new BaseRikeOptions({
                defaultProtocol: HTTP_PROTOCOL.instead().handleError(addFieldErrors)
            })
        }    
    ]
})
export class MyModule {
} 
```
See the explanation below.

Alternatively you can use `addFieldErrors` function explicitly:
```typescript
import {ErrorResponse, FieldErrors, addFieldErrors} from "ng2-rike";

function getFieldErrors(errors: ErrorResponse): FieldErrors {
    return addFieldErrors(errors).fieldErrors;
}
```

Configuration
-------------

`Rike` service defaults could be configured by binding to `RikeOptions` class when configuring injector.
Or simply by using `RikeModule.configure()` static method:
```typescript
import {NgModule} from "@angular/core";
import {RikeModule, RikeOptions, BaseRikeOptions} from "ng2-rike";

@NgModule({
    imports: [
        RikeModule.configure({
            baseUrl: "/application/base",
            defaultProtocol: CUSTOM_PROTOCOL,
        })
    ]
})
export class MyModule {
} 
```
The following options supported:

- `baseUrl` All relative target and operation URLs will be relative to this one.
- `defaultProtocol` Default `Protocol` to use. Target and operation protocols will be based on this one.
  It may contain request preparation and error handling logic.
- `defaultStatusLabels` - operation processing status labels used by `StatusCollector` by default,
  and reported by `rikeStatus` component. See below.

These defaults could be overridden in `RikeTarget`. `RikeTarget` options are in turn the defaults for `RikeOperation`
ones and could be overridden there too.

```typescript
import {Component} from "@angular/core";
import {Headers} from "@angular/http";
import {Rike, RikeTarget, RikeOperation} from "ng2-rike";

export class MyComponent {

    private _target: RikeTarget<any, any>;
    private _operation: RikeOperation<any, any>
    
    constructor(rike: Rike) {
        this._target = rike
            .target("My Target", TARGET_PROTOCOL)
            .withBaseUrl("my-target");    // Relative to Rike base URL
        this._operation = this._target
            .operation("my-operation", OPERATION_PROTOCOL)
            .withUrl("my-operation.json") // Relative to target base URL
            .withOptions({
                headers: new Headers({"X-Operation-Name": "my-operation"})
            });
    }

}

```

Resources
---------

Rike _resource_ is an injectable Angular service incorporating a single Rike _target_.

Such service should be registered with `provideResource` function. Then all of events emitted by operations on resource
target will be reported to event consumers.

An examples of such consumers are `StatusCollector` and `ErrorCollector` - an injectable Angular services automatically
registered by `provideResource` function, as well as at application level. These services are used by `rikeStatus`
and `rikeErrors` component to report status and errors of all available resources. These services could be injected
to your component or service as well, and used directly. 

```typescript
import {Component, OnInit} from "@angular/core";
import {Rike, JSON_PROTOCOL, provideResource} from "ng2-rike";

@Component({
    selector: "my-component",
    template:
    `
    <span rikeStatus></span>
    <span rikeErrors></span>
    <div>{{content | json}}</div>
    `,
    providers: [
        provideResource({provide: MyResource, useClass: MyResource}),
    ]
})
class MyComponent implements OnInit {

    content: any;

    constructor(private _resource: MyResource) {
    }
  
    ngOnInit() {
        this._resource.load()
            .subscribe(content => this.content = content, () => {});
    }

}
```

It is possible to register arbitrary number of resources in the same component (or at the application level).
All of them will emit events to the same set of event consumers. E.g. `StatusCollector` and `ErrorCollector`
would contain information combined from all registered resources.

### Resources Implementations

The `Resource` class is just an interface. Rike contains several abstract `Resource` implementations, that could be
more convenient to use.

`LoadableResource` is able to load arbitrary data from server. The default protocol is JSON. It contains method
`load()` returning an `Observable` on loaded data.

```typescript
import {Injectable, Component, OnInit} from "@angular/core";
import {Rike, LoadableResource, provideResource} from "ng2-rike"

export interface ItemDescription {
    item: string;
    description: string;
    price: string;
}

@Injectable()
export class ItemDescriptionsService extends LoadableResource<ItemDescription[]> {

    constructor(rike: Rike) {
        super(rike);
    }        

}

@Component({
    selector: 'item-prices',
    template:
    `
    <h3>Item Descriptions <span rikeStatus></span></h3>
    <span rikeErrors></span>
    <dl>
        <template ngFor let-item [ngForOf]="items" [ngForTrackBy]="itemName">
            <dt>{{item.item}}</dt>
            <dd>$ {{item.description}}</dd>
        </template>
    </dl>
    `,
    providers: [
        provideResource,
    ]
})
export class ItemPricesComponent implements OnInit {

    items: ItemDescription[] = [];
    
    constructor(private _itemService: ItemDescriptionsService) {
    }
    
    ngOnInit() {
        this._itemService.load().subscribe(items => this.items = items, () => {});
    }
    
} 

```

`CRUDResource` is a basic CRUD resource implementation able to `create()`, `read()`, `update()`, and `delete()` some
RESTful resource with appropriate HTTP requests using JSON protocol by default.

`RikeResource` is a base `Resource` implementation. It can be customized to your needs. Other basic resource
implementations are based on it.

UI Components
-------------

### `RikeStatusComponent`

The `RikeStatusComponent` is an indicator of operation statuses combined from all registered resources.

It utilizes `StatusCollector` service.
 
It is bound to `[rikeStatus]` and other attributes. The meaning of attributes is following:

- `[rikeStatus]` optionally accepts a `StatusView` instance, that can be constructed by `StatusCollector.view()` method.
- `[rikeStatusLabels]` accepts a `StatusLabelMap` instance(s) used to customize status indication.
- `[rikeStatusLabelText]` function converts status label to text to display. By default supports string labels
  and labels of type `DefaultStatusLabel`, and converts everything else to strings.
- `[rikeStatusLabelClass]` function returns status label CSS class according to `StatusView` state.
  By default supports CSS classes provided by `DefaultStatusLabel.cssClass` or `DefaultStatusLabel.id`,
  and uses predefined classes.

By default CSS classes have a form like `rike-status rike-status-XXX`.

Some predefined status CSS classes are:

- `rike-status-hidden` - used when there are no status labels known. Means that the status indicator should be hidden.
  Some labels may wish to hide status indicator, e.g. when operation completed successfully.
- `rike-status-processing` - indicates the operation is in process.
- `rike-status-cancelled` - indicates the operation has been cancelled.
- `rike-status-failed` - indicated the operation failure.
- `rike-status-succeed` - indicates the operation success.

Additional status CSS classes can be appended for operations defined in the base resource implementations. For example:

- `rike-status-loading` - for `load` operation (of `LoadableResource`).
- `rike-status-reading` - for `read` operation (of `CRUDResource`).
- `rike-status-sending` - for `send` operation.

You may call your operation similarly to apply these classes.

The generated HTML wood look like this:
```html
<any-tag class="rike-status rike-status-CLASS...">
    <span class="rike-status-icon"></span>
    Status Text
</any-tag>
```

Status labels can be customized on a per-operation basis, or globally. For this an instance of `StatusLabelMap`
can be used, and provided either globally (`RikeOptions.defaultStatusLabels`), or via component attribute
(`[rikeStatusLabels]`). See the API documentation for the details.

### `RikeErrorsComponent`

The `RikeErrorsComponent` is a list of all operation errors combined from all registered resources.
 
It utilizes `ErrorCollector` service and uses `FieldErrorResponse` to detect field errors. Even if `addFieldErrors()`
function is not used in operation protocol, this component applies it to error response. 

The component is bound to `[rikeErrors]` and other attributes. The meaning of attributes is following:

- `[rikeErrors]` optionally accepts a field name. If not specified or `*` is used, then component displays generic
  errors, and errors for fields for which error consumers are not registered, i.e. no corresponding `[rikeErrors]`
  component. 
- `[rikeErrorsOf]` a `ErrorCollector` instance to be used instead of the injected one.

Note that you don't have to create a `[rikeErrors]` component for each of the input fields. Then the errors will be
reported as generic ones. Also, if there is a `[rikeErrors]` component for particular field, the errors for this
field won't be reported as generic ones.

The correct way to display errors for e.g. form is to place one `<span rikeErrors></span>` component to report generic
errors, and several `<span rikeErrors="field"></span>` components to report errors for each field.

The generated HTML would look like this:
```html
<any-tag class="rike-errors">
    <ul class="rike-error-list">
        <li class="rike-error">Error message</li>
        <li class="rike-error">Another error message</li>
        ...        
    </ul>
</any-tag>
```

When there is no error to report the HTML looks like this:
```html
<any-tag class="rike-errors rike-no-errors"></any-tag>
```

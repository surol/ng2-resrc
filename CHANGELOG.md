# 0.2.5 (2016-11-30)

### Packaging

* Remove `*.ts` files from npm package.


# 0.2.4 (2016-10-09)

### Testing

* Add Karma config
* Add Travis-CI config


# 0.2.3 (2016-10-04)

### Features

* Add `RikeDisabledDirective` to disable controls while Rike operation is in process.
* Add `RokeReadonlyDirective` to mark input controls red only while Rike operation is in process.
* `RikeErrorsComponent` additionally bound to `rike-errors` element.
* `RikeStatusComponent` additionally bound to `rike-status` element.

### Bug Fixes

* Never send errors via Rike events emitter. Emit events instead.


# 0.2.2 (2016-09-25)

### Peer Dependencies

* Depend on Angular 2.0.0. or higher.


# O.2.1 (2016-09-21)

### Bug Fixes

* *`provideResource`:* Permit multiple anonymous (without `provide` key) resources at the same level.
* Fix reporting of operation cancellation.


# 0.2.0 (2016-09-15)

### Peer Dependencies

* Angular 2 release.
* Peer dependencies are also dev dependencies now.


# 0.1.5 (2016-09-13)

### Bugs

* *`ErrorCollector`:* Display readable message when operation cancelled.


# 0.1.4 (2016-09-11)

### Features

* *`Protocol`:* More protocol modification methods.
* *`CRUDResource`:* More customizations.


# 0.1.3 (2016-09-08)

### Features

* *`RikeModule`:* Simplified configuration with `RikeModule.configure({})`.
* *`[rikeErrors]`:* `rike-no-errors` CSS class is applied when no errors to report.
* *structure:* Move TypeScript files out of `src` directory to top level.
* *npm package:* Add `module` and `main` entries to `package.json` to help tooling, e.g. WebPack.
* *npm package:* Use peer dependencies.
* *specs:* Use WebPack to bundle specs.


# 0.1.2 (2016-09-03)

### Features

* *npm package:* Use ES2015 for primary build.
* *bundle:* Add UMD bundle `bundles/ng2-rike.umd.js`.

### Peer Dependencies

* Angular2 rc6.


# 0.1.1 (2016-09-02)

### Features

* Allow to specify arrays of `StatusLabelMap` for status labels.

"use strict";

var gulp = require('gulp');
var exec = require('child_process').exec;
var path = require('path');
var filter = require('gulp-filter');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var merge = require('merge2');
var del = require('del');

var project = ts.createProject({
    "typescript": require("typescript"),
    "target": "ES5",
    "module": "es2015",
    "moduleResolution": "node",
    "declaration": true,
    "sourceMap": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "removeComments": false,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": ".",
    "newLine": "LF",
    "types": ["core-js"],
    "sortOutput": true
});

gulp.task('compile-api', function() {

    var result = gulp.src('src/**/*.ts')
        .pipe(filter([
            '**',
            '!**/*.spec.ts'
        ]))
        .pipe(sourcemaps.init())
        .pipe(ts(project));

    return merge([
        result.js.pipe(sourcemaps.write('.')).pipe(gulp.dest('.')),
        result.dts.pipe(gulp.dest('.'))
    ]);
});

gulp.task('clean-api', function () {
    return del([
        './ng2-rike',
        './ng2-rike.d.ts',
        './ng2-rike.js',
        './ng2-rike.js.map'
    ]);
});

gulp.task('compile-all', function(cb) {
    exec(
        'node_modules/.bin/tsc -p .',
        function(err, stdout, stderr) {
            console.log(stdout);
            if (err) {
                console.error(stderr);
            }
            cb();
        });
});

gulp.task('bundle', ['compile-api'], function(cb) {
    exec(
        'node_modules/.bin/rollup -c rollup.config.js',
        function(err, stdout, stderr) {
            console.log(stdout);
            if (err) {
                console.error(stderr);
            }
            cb(err);
        });
});

gulp.task('compile', ['compile-all', 'bundle']);

gulp.task('clean-bundle', ['clean-api'], function() {
    return del('bundles');
});

gulp.task('default', ['compile']);

gulp.task('clean', ['clean-bundle']);

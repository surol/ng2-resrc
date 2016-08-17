"use strict";

var gulp = require('gulp');
var exec = require('child_process').exec;
var path = require('path');
var del = require('del');

var SystemBuilder = require('systemjs-builder');

gulp.task('bundle-angular', function(cb) {

    var builder = new SystemBuilder('node_modules');

    builder.loadConfig('systemjs.config.js')
        .then(function() {
            builder.bundle(
                'rxjs'
                + ' + @angular/common'
                + ' + @angular/compiler'
                + ' + @angular/core'
                + ' + @angular/core/testing'
                + ' + @angular/http'
                + ' + @angular/http/testing'
                + ' + @angular/platform-browser'
                + ' + @angular/platform-browser/testing'
                + ' + @angular/platform-browser-dynamic'
                + ' + @angular/platform-browser-dynamic/testing',
                'bundles/angular.js',
                {
                    minify: true,
                    mangle: false,
                    sourceMaps: true,
                    sourceMapContents: true
                }
            ).then(
                function() {cb()},
                function(err) {cb(err)}
            )});
});

gulp.task('compile-prod', function(cb) {
    exec(
        'node_modules/.bin/tsc -p builds/prod',
        function(err, stdout, stderr) {
            console.log(stdout);
            if (err) console.error(stderr);
            cb(err);
        });
});

gulp.task('compile-devel', function(cb) {
    exec(
        'node_modules/.bin/tsc -p builds/devel',
        function(err, stdout, stderr) {
            console.log(stdout);
            if (err) console.error(stderr);
            cb(err);
        });
});

gulp.task('compile-all', function(cb) {
    exec(
        'node_modules/.bin/tsc -p .',
        function(err, stdout, stderr) {
            console.log(stdout);
            if (err) console.error(stderr);
            cb(err);
        });
});

gulp.task('compile', ['compile-all', 'compile-devel', 'compile-prod']);

gulp.task('clean-bundle', function() {
    return del('bundles');
});

gulp.task('default', ['bundle-angular', 'compile']);

gulp.task('clean', ['clean-bundle']);

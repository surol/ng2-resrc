"use strict";

var gulp = require('gulp');
var exec = require('child_process').exec;
var path = require('path');
var del = require('del');

gulp.task('compile', function(cb) {
    exec(
        'node_modules/.bin/tsc -p .',
        function(err, stdout, stderr) {
            console.log(stdout);
            if (err) console.error(stderr);
            cb(err);
        });
});

gulp.task('clean-bundle', function() {
    return del('bundles');
});

gulp.task('default', ['compile']);

gulp.task('clean', ['clean-bundle']);

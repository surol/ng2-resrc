"use strict";

var gulp = require('gulp');
var exec = require('child_process').exec;
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var wp = require('webpack-stream');
var named = require('vinyl-named');
var del = require('del');

function compile(opts, cb) {
    exec(
        'node_modules/.bin/tsc ' + opts,
        function (err, stdout, stderr) {
            console.log(stdout);
            if (err) {
                console.error(stderr);
            }
            cb();
        });
}

gulp.task('compile', function(cb) {
    compile("-p .", cb);
});
gulp.task('watch-compile', function(cb) {
    compile('-p . --watch', cb);
});

gulp.task('clean-compiled', function () {
    return del([
        './ng2-rike/**/*.{d.ts,js,js.map}',
        './ng2-rike.{d.ts,js,js.map}'
    ]);
});


function bundleUmd(config, cb) {
    exec(
        'node_modules/.bin/rollup -c ' + config,
        function (err, stdout, stderr) {
            console.log(stdout);
            if (err) {
                console.error(stderr);
            }
            cb(err);
        });
}

gulp.task('bundle-umd', ['compile'], function(cb) {
    bundleUmd('rollup.config.js', cb);
});
gulp.task('bundle-umd-only', function(cb) {
    bundleUmd('rollup.config.js', cb);
});
gulp.task('watch-bundle-umd', ['bundle-umd-only'], function() {
    gulp.watch(
        [
            'ng2-rike.js',
            '!ng2-rike.spec.js',
            'ng2-rike/**/*.js',
            '!ng2-rike/**/*.spec.js',
            'rollup.config.js'
        ],
        ['bundle-umd-only']);
});

gulp.task('bundle-spec-umd', ['compile'], function(cb) {
    bundleUmd('rollup-spec.config.js', cb);
});
gulp.task('bundle-spec-umd-only', function(cb) {
    bundleUmd('rollup-spec.config.js', cb);
});
gulp.task('watch-bundle-spec-umd', ['bundle-spec-umd-only'], function() {
    gulp.watch(
        [
            'ng2-rike.js',
            'ng2-rike/**/*.js',
            'rollup-spec.config.js'
        ],
        ['bundle-spec-umd-only'])
});

var wpCommon = {
    resolve: {
        extensions: ['', '.js'],
        alias: {
            'ng2-rike': './bundles/ng2-rike-spec.umd.js'
        }
    },
    devtool: 'source-map',
    plugins: [
        new webpack.optimize.UglifyJsPlugin({ // https://github.com/angular/angular/issues/10618,
            compress: {
                warnings: false
            },
            mangle: {
                keep_fnames: true
            }
        }),
    ],
    output: {
        filename: 'ng2-rike-spec.js'
    }
};

function bundleWP(config) {
    gulp.src('bundle-spec.js').pipe(named())
        .pipe(wp(webpackMerge(wpCommon, config), webpack))
        .pipe(gulp.dest('bundles/'));
}

gulp.task('bundle-spec', ['bundle-spec-umd'], function() {
    return bundleWP();
});
gulp.task('bundle-spec-only', ['bundle-spec-umd-only'], function() {
    return bundleWP();
});
gulp.task('watch-bundle-spec', function () {
    return bundleWP(webpackMerge({watch: true}));
});

gulp.task('clean-bundles', function() {
    return del('bundles');
});


gulp.task('watch', ['watch-compile', 'watch-bundle-umd', 'watch-bundle-spec-umd', 'watch-bundle-spec']);

// Use if IDE (IntelliJ IDEA) compiles TypeScript by itself.
gulp.task('watch-ide', ['watch-bundle-umd', 'watch-bundle-spec-umd', 'watch-bundle-spec']);


gulp.task('default', ['bundle-umd', 'bundle-spec']);

function runTest(opts, cb) {
    exec(
        'node_modules/.bin/karma start karma.conf.js ' + opts,
        (err, stdout, stderr) => {
            console.log(stdout);
            if (err) {
                console.error(stderr);
            }
            cb(err);
        });
}

gulp.task('test', function(cb) {
    runTest('', cb);
});

gulp.task('test-once', function(cb) {
    runTest('--single-run', cb);
});


gulp.task('clean', ['clean-compiled', 'clean-bundles']);

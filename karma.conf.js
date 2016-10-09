// #docregion
module.exports = function(config) {

    var appBase    = 'ng2-rike/';       // transpiled app JS and map files
    var appSrcBase = 'ng2-rike/';       // app source TS files
    var appAssets  = '/base/ng2-rike/'; // component assets fetched by Angular's compiler

    var testBase    = 'ng2-rike/';      // transpiled test JS and map files
    var testSrcBase = 'ng2-rike/';      // test source TS files

    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'), // click "Debug" in browser to see it
            require('karma-htmlfile-reporter') // crashing w/ strange socket error
        ],

        customLaunchers: {
            // From the CLI. Not used here but interesting
            // chrome setup for travis CI using chromium
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },
        files: [
            // Polyfills
            'node_modules/core-js/client/shim.js',
            'node_modules/reflect-metadata/Reflect.js',

            // zone.js
            'node_modules/zone.js/dist/zone.js',
            'node_modules/zone.js/dist/long-stack-trace-zone.js',
            'node_modules/zone.js/dist/proxy.js',
            'node_modules/zone.js/dist/sync-test.js',
            'node_modules/zone.js/dist/jasmine-patch.js',
            'node_modules/zone.js/dist/async-test.js',
            'node_modules/zone.js/dist/fake-async-test.js',

            // Spec bundle
            'bundles/ng2-rike-spec.js',

            // transpiled application & spec code paths loaded via module imports
            {pattern: appBase + '**/*.js', included: false, watched: true},
            {pattern: testBase + '**/*.js', included: false, watched: true},

            // Paths for debugging with source maps in dev tools
            {pattern: appSrcBase + '**/*.ts', included: false, watched: false},
            {pattern: appBase + '**/*.js.map', included: false, watched: false},
            {pattern: testSrcBase + '**/*.ts', included: false, watched: false},
            {pattern: testBase + '**/*.js.map', included: false, watched: false}
        ],

        // Proxied base paths for loading assets
        proxies: {
            // required for component assets fetched by Angular's compiler
            "/ng2-rike/": appAssets
        },

        exclude: [],
        preprocessors: {},
        // disabled HtmlReporter; suddenly crashing w/ strange socket error
        reporters: ['progress', 'kjhtml'],//'html'],

        // HtmlReporter configuration
        htmlReporter: {
            // Open this file to see results in browser
            outputFile: '_test-output/tests.html',

            // Optional
            pageTitle: 'Unit Tests',
            subPageTitle: __dirname
        },

        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false
    })
}

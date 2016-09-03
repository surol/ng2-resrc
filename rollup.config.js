export default {
    entry: 'ng2-rike.js',
    dest: 'bundles/ng2-rike.umd.js',
    format: 'umd',
    moduleName: 'ng2rike',
    globals: {
        'rxjs/Observable': 'Rx',
        'rxjs/Subject': 'Rx'
    },
    plugins: [
//    nodeResolve({ jsnext: true, main: true }),
    ]
}

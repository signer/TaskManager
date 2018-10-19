var path = require('path');

module.exports = {
    entry: './lib/index.ts',
    module: {
        rules: [
            {
              test: /\.tsx?$/,
              use: 'ts-loader',
              exclude: /node_modules/
            }
        ]
    },
    mode: 'production',
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: 'TaskManager',
        libraryTarget: 'umd',
        globalObject: 'typeof self !== \'undefined\' ? self : this',
    }
}
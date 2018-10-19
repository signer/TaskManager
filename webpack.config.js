var path = require('path');

module.exports = {
    entry: './lib/TaskManager.ts',
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
        filename: 'TaskManager.js',
        library: 'TaskManager',
        libraryTarget: 'umd',
        globalObject: 'typeof self !== \'undefined\' ? self : this',
    }
}
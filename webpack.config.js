var path = require('path')

module.exports = {
    // webpack folder’s entry js — excluded from jekll’s build process.
    entry: './webpack/entry.js',
    output: {
        // we’re going to put the generated file in the assets folder so jekyll will grab it.
        path: 'assets/js/',
        filename: 'bundle.js'
    },
    devtool: "source-map",
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015']
                },
            }
        ],
    }
};

resolve = {
    root: [
        path.resolve('webpack/lib'),
    ],
};
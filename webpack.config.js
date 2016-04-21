const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const webpack = require('webpack');
const Clean = require('clean-webpack-plugin');

// postcss plugins
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var stylelint = require('stylelint');
var autoprefixer = require('autoprefixer');
var cssnext = require('postcss-cssnext');

const pkg = require('./package.json');

const TARGET = process.env.npm_lifecycle_event;
const PATHS = {
    app: path.join(__dirname, 'app'),
    build: path.join(__dirname, 'build'),
    test: path.join(__dirname, 'tests')
};

process.env.BABEL_ENV = TARGET;

const common = {
    entry: PATHS.app,
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    output: {
        path: PATHS.build,
        filename: '[name].js'
    },
    module: {
        loaders: [
            // Set up jsx. This accepts js too thanks to RegExp
            {
                test: /\.jsx?$/,
                loader: 'babel',
                query: {
                    // Enable caching for improved performance during development
                    // It uses default OS directory by default. If you need something
                    // more custom, pass a path to it. I.e., babel?cacheDirectory=<path>
                    cacheDirectory: true,
                    presets: ['react', 'es2015', 'survivejs-kanban']
                },
                include: PATHS.app
            }
        ]
    },
    postcss: function() {
        return [
            autoprefixer({
                browsers: ['last 2 versions']
            }),
            // cssnext(),
            stylelint({
                rules: {
                    'color-hex-case': 'lower'
                }
            })
        ];
    },
    sassLoader: {
        includePaths: [path.join(__dirname, 'app/scss')]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'node_modules/html-webpack-template/index.html',
            title: 'vp24 react app',
            appMountId: 'app',
            inject: false
        }),
        new ExtractTextPlugin('styles.css')
    ]
};

// Developement mode, with server included on http://localhost:2300
if (TARGET === 'start' || !TARGET) {
    module.exports = merge(common, {
        devtool: 'source-map',
        devServer: {
            historyApiFallback: true,
            hot: true,
            inline: true,
            progress: true,

            // display only errors to reduce the amount of output
            stats: 'errors-only',

            // parse host and port from env so this is easy
            // to customize
            host: process.env.HOST,
            port: process.env.PORT || 2300
        },
        module: {
            preLoaders: [
                {
                    test: /\.jsx?$/,
                    loaders: ['eslint'],
                    include: PATHS.app
                }
            ],
            loaders: [
                {
                    // Test expects a RegExp! Note the slashes!
                    test: /\.scss$/,
                    loaders: ['style-loader?sourceMap', 'css-loader?sourceMap', 'postcss-loader?sourceMap', 'sass-loader?sourceMap'],
                    // Include accepts either a path or an array of paths.
                    include: PATHS.app
                }
            ]
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin()
        ]
    });
}

if (TARGET === 'test' || TARGET === 'tdd') {
    module.exports = merge(common, {
        entry: {}, // karma will set this
        output: {}, // karma will set this
        devtool: 'inline-source-map',
        resolve: {
            alias: {
                'app': PATHS.app
            }
        },
        module: {
            preLoaders: [
                {
                    test: /\.jsx?$/,
                    loaders: ['isparta-instrumenter'],
                    include: PATHS.app
                }],
            loaders: [{
                test: /\.jsx?$/,
                loaders: ['babel?cacheDirectory'],
                include: PATHS.test
            }]
        }
    });
}

// Production build, will work with 2 entry points, app.js and vendor.js - generating minified, optimized and digested versions
if (TARGET === 'build' || TARGET === 'stats') {
    module.exports = merge(common, {
        entry: {
            app: PATHS.app,
            vendor: Object.keys(pkg.dependencies).filter(function(v) {
                // Exclude alt-utils as it won't work with this setup
                // due to the way the package has been designed
                // (no package.json main).
                return v !== 'alt-utils';
            })
        },
        output: {
            path: PATHS.build,
            filename: '[name].[chunkhash].js',
            chunkFilename: '[chunkhash].js'
        },
        module: {
            loaders: [
                {
                    // Test expects a RegExp! Note the slashes!
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract('style-loader?sourceMap', ['css-loader?sourceMap', 'postcss-loader?sourceMap', 'sass-loader?sourceMap']),
                    //loaders: ['style', 'css?sourceMap', 'sass?sourceMap'],
                    // Include accepts either a path or an array of paths.
                    include: PATHS.app
                },
                // Extract CSS during build
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract('style', 'css'),
                    include: PATHS.app
                }
            ]
        },
        plugins: [
            new Clean([PATHS.build], {
                verbose: false // Don't write logs to console
            }),
            // Output extracted CSS to a file
            new ExtractTextPlugin('styles.[chunkhash].css'),
            // Extract vendor and manifest files
            new webpack.optimize.CommonsChunkPlugin({
                names: ['vendor', 'manifest']
            }),
            // Setting DefinePlugin affects React library size!
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production')
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ]
    });
}

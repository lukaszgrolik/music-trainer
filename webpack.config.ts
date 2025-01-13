import * as path from 'path';
import * as webpack from 'webpack';
import * as webpackDevServer from 'webpack-dev-server';
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const config: (env: {NODE_ENV?: string}) => webpack.Configuration = env => {
    const plugins = [
        new ForkTsCheckerWebpackPlugin(),
    ];
    const isProd = env.NODE_ENV === 'production';

    if (isProd) {
        plugins.push(...[
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify('production'),
                },
            }),
            // new webpack.optimize.UglifyJsPlugin({
            //   minimize: true,
            //   compress: {
            //     screw_ie8: true,
            //   },
            // }),
        ]);
    }

    // interface Configuration extends webpack.Configuration {
    //     devServer?: webpackDevServer.Configuration;
    // }

    return {
        entry: './app',
        mode: isProd ? 'production' : 'development',
        output: {
            filename: `bundle${isProd ? '.min' : ''}.js`,
            path: path.resolve(path.join(__dirname, 'web'))
        },
        devtool: isProd ? 'source-map' : 'eval-source-map',
        devServer: {
            host: '0.0.0.0',
            port: 3020,
            historyApiFallback: true,
            // disableHostCheck: true,
            static: path.join(__dirname, 'web')
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
            // modules: [path.join(__dirname, 'node_modules')],
            modules: ['node_modules'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                    }
                },
                // {
                //     test: /ace-builds.*\/worker-.*$/,
                //     loader: 'file-loader',
                //     options: {
                //         esModule: false,
                //         name: '[name].[hash:8].[ext]',
                //     },
                // },
            ],
        },
        plugins,
    };
};

export default config;
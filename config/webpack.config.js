const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {

    entry: {
        app: '../src/js/main.js',
        style: '../src/css/style.css'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../build/js/'),
        publicPath: "../build/js/"
    },
    resolve: {
		alias: {
            jquery: path.resolve(__dirname, '../build/lib/jquery/jquery.min'),
            select2: path.resolve(__dirname, '../build/lib/select2/select2.min'),
            datepicker: path.resolve(__dirname, '../build/lib/datepicker/datepicker.min'),
            mask: path.resolve(__dirname, '../build/lib/mask/jquery.mask.min'),
            chart: path.resolve(__dirname, '../build/lib/chart/chart.min'),
            js: path.resolve(__dirname, '../src/js/')
		}	        
	},
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: '/node_modules/'
            },
            {
                test: /\.css$/,
                exclude: '/node_modules/',
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: [
                                require('autoprefixer')({}),
                                require('cssnano')({ preset: 'default' })
                            ],
                            minimize: true
                        }
                    }
                ]
            },
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                loader: 'url-loader',
                options: {
                    name: '../res/[name].[ext]',
                },
            },
            {
                test: /\.svg$/,
                loader: 'svg-url-loader'
            }
        ]
    }, 
    plugins: [
        new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery',
          'window.jQuery': "jquery"
        }),
        new MiniCssExtractPlugin({
            filename: '../css/[name].css',
            chunkFilename: '../css/[name].chunk.css',
        }),
    ]

}
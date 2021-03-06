import * as webpack from 'webpack';
import { analyze, isDev, isProd } from './utils';
import { packageRoot, runtimeRoot } from '../../utils/path';

const { VueLoaderPlugin } = require('vue-loader');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export let base: webpack.Configuration = {
  stats: {
    assets: true,
    children: true,
  },
  devtool: isProd ? false : '#eval-source-map',
  resolve: {
    extensions: ['*', '.ts', '.js', '.vue', '.json'],
    modules: [
      runtimeRoot('src'),
      runtimeRoot('node_modules'),
      packageRoot('node_modules'),
      packageRoot('src/webpack/dev'),
    ],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': runtimeRoot('src'),
    },
  },
  module: {
    exprContextCritical: false,
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        include: [runtimeRoot('src'), packageRoot('src/webpack/dev')],
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true,
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: '[local]_[hash:base64:8]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('autoprefixer')({ browsers: ['last 2 versions', 'ie >= 11'] }),
                require('css-mqpacker')(),
                require('cssnano')({
                  discardComments: {
                    removeAll: true,
                  },
                  zindex: false,
                }),
              ],
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.(?:jpg|png|svg|ttf|woff2?|eot|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
        },
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({ PRODUCTION: isProd, DEVELOPMENT: isDev, TEST: false }),
    new ForkTsCheckerWebpackPlugin({
      tsconfig: runtimeRoot('tsconfig.json'),
      tslint: runtimeRoot('tslint.json'),
      vue: true,
    }),
  ],
};

if (analyze) {
  base.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static' }));
}

base = require(runtimeRoot('.vue-starter/webpack.config'))(base, 'client');

export default base;

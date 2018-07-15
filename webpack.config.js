const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const cssnano = require('cssnano');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TimeFixPlugin = require('time-fix-plugin');


const PATHS = {
  entry: path.resolve(__dirname, 'src', 'index.js'),
  src: path.resolve(__dirname, 'src'),
  dist: path.resolve(__dirname, 'dist'),
};
const commonConfig = {
  output: {
    path: PATHS.dist,
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js/,
        include: PATHS.src,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: 'src/index.html',
      filename: 'index.html',
      alwaysWriteToDisk: true,
    }),
    new HtmlWebpackHarddiskPlugin(),
  ],
};

const developmentConfig = {
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false',
    PATHS.entry,
  ],
  mode: 'development',
  module: {
    rules: [
      // style loader, for pre-build, pre-processed stylesheets
      {
        test: /\.css/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ],
      },
      // scss, for loading and processing local scope css,
      {
        test: /\.scss/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]__[local]--[hash:base64:5]',
            },
          },
          { loader: 'fast-sass-loader' },
        ],
      },
    ],
  },
  plugins: [
    new TimeFixPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
};

const productionConfig = {
  mode: 'production',
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    PATHS.entry,
  ],
  output: {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
  },
  optimization: {
    // Using the defaults here:
    // https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693#configurate-cache-groups
    splitChunks: {
      chunks: 'all',
    },
  },
  module: {
    rules: [
      // extract css
      {
        test: /\.css/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => ([
                require('autoprefixer')({
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 9', // React doesn't support IE8 anyway
                  ],
                  flexbox: 'no-2009',
                }),
              ]),
            },
          },
          'css-loader',
        ],
      },
      // extract scss
      {
        test: /\.scss/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]__[local]--[hash:base64:5]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => ([
                require('autoprefixer')({
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 9', // React doesn't support IE8 anyway
                  ],
                  flexbox: 'no-2009',
                }),
              ]),
            },
          },
          { loader: 'fast-sass-loader' },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[id].[hash].css',
    }),
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: {
        discardComments: {
          removeAll: true,
          // Run cssnano in safe mode to avoid
          // potentially unsafe transformations.
          safe: true,
        },
      },
      canPrint: true,
    }),
  ],
};

module.exports = ( env ) => {
  if ( env === 'production' ) {
    return webpackMerge( commonConfig, productionConfig );
  }
  return webpackMerge( commonConfig, developmentConfig );
};

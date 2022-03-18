/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
// bundle forked scripts with webpack
// as in production, with asar, node_modules are not accessible in forked scripts

const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const getForkedScriptsConfig = () => {
  const plugins = [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ];
  if (process.platform === 'win32') {
    plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'node_modules', 'rcedit', 'bin', 'rcedit-x64.exe'),
            to: path.join(__dirname, 'bin', 'rcedit-x64.exe'),
          },
        ],
      }),
    );
  }

  // https://jlongster.com/Backend-Apps-with-Webpack--Part-I
  return {
    mode: 'production',
    node: {
      global: false,
      __filename: false,
      __dirname: false,
    },
    entry: {
      'install-app-forked-electron-v2': path.join(__dirname, 'main-src', 'libs', 'app-management', 'install-app-async', 'install-app-forked-electron-v2.js'),
      'prepare-engine-forked': path.join(__dirname, 'main-src', 'libs', 'app-management', 'prepare-engine-async', 'prepare-engine-forked.js'),
      'prepare-electron-forked': path.join(__dirname, 'main-src', 'libs', 'app-management', 'prepare-electron-async', 'prepare-electron-forked.js'),
      'uninstall-app-forked': path.join(__dirname, 'main-src', 'libs', 'app-management', 'uninstall-app-async', 'uninstall-app-forked.js'),
    },
    module: {
      rules: [
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
      ],
    },
    target: 'node',
    output: {
      path: path.join(__dirname, 'build'),
      filename: '[name].js',
    },
    devtool: 'source-map',
    plugins,
  };
};

const getPreloadScriptsConfig = () => {
  const plugins = [];
  return {
    mode: 'production',
    node: {
      global: false,
      __filename: false,
      __dirname: false,
    },
    entry: {
      'preload-menubar': path.join(__dirname, 'main-src', 'libs', 'windows', 'preload-menubar.js'),
    },
    module: {
      rules: [
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
      ],
    },
    target: 'electron-renderer',
    output: {
      path: path.join(__dirname, 'build'),
      filename: '[name].js',
    },
    devtool: false,
    plugins,
  };
};

const getElectronMainConfig = () => {
  const plugins = [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['libs'],
      cleanAfterEveryBuildPatterns: [],
    }),
    new webpack.DefinePlugin({
      'process.env.ELECTRON_APP_SENTRY_DSN': JSON.stringify(process.env.ELECTRON_APP_SENTRY_DSN),
      'process.env.REACT_APP_LICENSE_SECRET': JSON.stringify(process.env.REACT_APP_LICENSE_SECRET),
      'process.env.REACT_APP_LICENSE_SECRET_SINGLEBOX_LEGACY': JSON.stringify(process.env.REACT_APP_LICENSE_SECRET_SINGLEBOX_LEGACY),
    }),
  ];

  const patterns = [
    {
      from: path.join(__dirname, 'main-src', 'images'),
      to: path.join(__dirname, 'build', 'images'),
    },
  ];
  if (process.platform === 'win32') {
    patterns.push({
      from: path.join(__dirname, 'node_modules', 'windows-shortcuts', 'lib', 'shortcut', 'Shortcut.exe'),
      to: path.join(__dirname, 'build', 'shortcut', 'Shortcut.exe'),
    });
    patterns.push({
      from: path.join(__dirname, 'node_modules', 'regedit', 'vbs'),
      to: path.join(__dirname, 'build', 'vbs'),
    });
  }
  plugins.push(new CopyPlugin({ patterns }));

  return {
    mode: 'production',
    node: {
      global: false,
      __filename: false,
      __dirname: false,
    },
    entry: {
      electron: path.join(__dirname, 'main-src', 'electron.js'),
    },
    module: {
      rules: [
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
      ],
    },
    target: 'electron-main',
    output: {
      path: path.join(__dirname, 'build'),
      filename: '[name].js',
    },
    devtool: 'source-map',
    plugins,
  };
};

module.exports = [getForkedScriptsConfig(), getElectronMainConfig(), getPreloadScriptsConfig()];

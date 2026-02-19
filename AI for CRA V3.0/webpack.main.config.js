const path = require('path');

module.exports = {
  target: 'electron-main',
  entry: {
    index: './src/main/index.ts',
    preload: './src/main/preload.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@main': path.resolve(__dirname, 'src/main'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: {
    electron: 'commonjs electron',
  },
};

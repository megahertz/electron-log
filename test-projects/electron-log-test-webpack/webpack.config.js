module.exports = [
  {
    entry: ['./src/main.js'],
    output: { filename: './out/main.js' },
    target: 'electron',
    module: {
      rules: [
        {
          test: /.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: [require('babel-preset-latest')]
          }
        }
      ]
    },
    node: {
      __dirname: false
    }
  },
  {
    entry: ['./src/renderer.js'],
    output: { filename: './out/renderer.js' },
    target: 'electron-renderer',
    module: {
      rules: [
        {
          test: /.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: [require('babel-preset-latest')]
          }
        }
      ]
    }
  }
];

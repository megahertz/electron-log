module.exports = [
  {
    entry: ['./src/main.js'],
    output: { filename: './out/main.js' },
    target: 'electron',
    module: {
      loaders: [
        {
          test: /.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['latest']
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
      loaders: [
        {
          test: /.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['latest']
          }
        }
      ]
    }
  }
];
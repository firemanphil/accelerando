const path = require('path');

  module.exports = {
    entry: './src/index.js',
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      contentBase: './dist',
    },
    module: {
	  rules: [
    		{ test: /\.js$/, exclude: /node_modules/, loader: ["babel-loader", 'eslint-loader'] }
  		]
	},
    module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
    ],
  },
  };

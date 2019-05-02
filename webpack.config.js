const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: { main: './src/index.js' },
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'main.js'
	},
	devServer: {
		contentBase: './dist'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			inject: false,
			hash: true,
			template: './src/index.html',
			filename: 'index.html'
		})
	]
}

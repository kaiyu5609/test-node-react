var path = require('path')

var config = {
	entry: [
		path.resolve(__dirname, 'public/js/index.js')
	],
	output: {
		path: path.resolve(__dirname, 'public/build'),
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{test: /\.jsx?$/, loader: 'jsx?harmony'},
			{test: /\.css$/, loader: 'style!css'},
			{test: /\.(jpg|png)$/, loader: 'url?limit=118000'},
			{test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
			{test: /\.less/, loader: 'style!css!less?sourceMap'}
		]
	}
}

module.exports = config
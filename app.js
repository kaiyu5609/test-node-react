var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var _ = require('underscore')
var ejs = require('ejs')
var Comment = require('./models/comment')
var port = process.env.PORT || 3000
var app = express()

mongoose.connect('mongodb://127.0.0.1:27017/react')

app.set('views', './views/pages')
app.engine('.html', ejs.__express)
app.set('view engine', 'html')
app.use(bodyParser())
app.use(express.static(path.join(__dirname, 'public')))
app.locals.moment = require('moment')
app.listen(port)
console.log('app started on port ' + port)

//index page
app.get('/', function(req, res){
		res.render('index', {
			title: 'react comment',
			list: [{
				name: '水果麦片',
				price: '27.80'
			},{
				name: '水果罐头',
				price: '58.90'
			}]
		})
})

//list page
app.get('/list', function(req, res){
		res.render('list', {
			title: 'react comment-list'
		})
})

//add comment
app.post('/comment/new', function(req, res){
	var id = req.body.comment._id
	var commentObj = req.body.comment
	var _comment
	if(id){
		Comment.findById(id, function(err, comment){
			if(err){
				console.log(err)
			}
			console.info("comment", comment);
			_comment = _.extend(comment, commentObj)
			console.info("comment", _comment);
			_comment.save(function(err, comment){
				if(err){
					console.log(err)
				}else{
					res.json({success: 1});	
				}
			})
		})
	}else{
		_comment = new Comment({
			author: commentObj.author,
			text: commentObj.text
		})
		_comment.save(function(err, comment){
			if(err){
				console.log(err)
			}else{
				res.json({success: 1, _id: comment._id, meta: comment.meta});	
			}
		})
	}
})

//query comments
app.get('/comment/query', function(req, res){
	Comment.fetch(function(err, comments){
		if(err){
			console.log(err)
		}
		res.json({items: comments})
	})
})
//list delete comment
app.delete('/comment/del', function(req, res){
	var id = req.body.id
	if(id){
		Comment.remove({_id: id}, function(err, comment){
			if(err){
				console.log(err)
			}else{
				res.json({success: 1})
			}
		})
	}
})


































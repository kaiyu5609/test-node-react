var _ = require("underscore"),
    $ = require("jquery"),
    Backbone = require("backbone"),
    React = require("react"),
    ReactDOM = require("react-dom"),
	Moment = require("moment");
	
window.root = $.extend({
	commentList : new Backbone.Collection(),
	commentUpdate: null
}, Backbone.Events);

var CommentItem = React.createClass({
	handleDel: function(){//删除comment
		var commentList = root.commentList;
		commentList.remove(commentList.findWhere(this.props));
		root.trigger('delete');
		console.info("您当前删除的comment:", this.props);
		console.log("-----------------------(^n^)删除成功！-----------------------");
		$.ajax({
			url: "/comment/del",
			dataType: 'json',
			type: 'DELETE',
			data: {id: this.props._id},
			success: function(data){
				console.log(data)
			}.bind(this),
			error: function(xhr, status, err){
				console.error(this.props.url, status, err.toString())	
			}.bind(this)
		})
	},
	handleEdit: function(){//编辑comment
		root.trigger('update',this.props);
		root.commentUpdate = _.clone(this.props);
		console.info("您当前编辑的comment:", root.commentUpdate);
	},
	componentWillMount: function(){
		_.extend(this, {
			getDate: function(){
				return Moment(this.props.meta.updateAt).format('YYYY-MM-DD HH:mm:ss');
			}
		});
	},
    render:function(){
        return (
            <li>
                <span>{this.props.author}</span>--
                <span>{this.props.text}</span>--
				<span>{this.getDate()}</span>--
				<span onClick={this.handleDel} className="btn btn-danger btn-xs">删除</span>--
				<span onClick={this.handleEdit} className="btn btn-primary btn-xs">编辑</span>
            </li>
        )
    }
})

var CommentList= React.createClass({
    render:function(){
        var nodes = this.props.items.map(function(item,i){
            return <CommentItem key={"item-"+i} _id={item._id} author={item.author} text={item.text} meta={item.meta}/>
        })
        return (
            <ul className="nav nav-list">
                {nodes}
            </ul>
        )
    }
})

var CommentForm = React.createClass({
    getInitialState:function(){
        return {
            author:"",
            text:""
        }
    },
	componentDidMount:function(){
        _.extend(this,Backbone.Events)
        var that = this
		this.listenTo(root, 'update', function(comment){
            that.setState(comment);
        });
		this.listenTo(root, 'delete', function(){
            that.clear();
        })
    },
    render:function(){
        return (
            <div className="comment-form">
                <p>
                    <label>author:</label>
                    <input value={this.state.author} onChange={this.change.bind(this,'author')} className="form-control"/>
                </p>
                <p>
                    <label>text:</label><input value={this.state.text}  onChange={this.change.bind(this,'text')} className="form-control"/>
                </p>
                <button onClick={this.submit} className="btn btn-primary btn-sm">保存</button>
            </div>
        )
    },
    change:function(state,e){
        var s= {}
        s[state] = e.target.value
        this.setState(s)
    },
    submit:function(){
		var that = this;
		var commentUpdate = root.commentUpdate;//当前要编辑的comment
		var commentId = commentUpdate && commentUpdate._id;
		var commentUpdateModel;

		var newComment = _.clone(this.state);//新增的comment

		if(commentId){//修改comment
			if(!this.pass(newComment)) return false;
			commentUpdateModel = this.findCommentModel({_id: commentId});
			console.log(newComment);
			commentUpdateModel.set(newComment);//保存修改
			console.log("-----------------------(^_^)编辑成功！-----------------------");
			$.ajax({
				url: "/comment/new",
				dataType: 'json',
				type: 'POST',
				data: {comment: newComment},
				success: function(data){
					console.info("修改成功:", data);
				}.bind(this),
				error: function(xhr, status, err){
					console.error(this.props.url, status, err.toString())	
				}.bind(this)
			})
		}else{//新增comment
			if(!this.pass(newComment)) return false;
			$.ajax({
				url: "/comment/new",
				dataType: 'json',
				type: 'POST',
				data: {comment: newComment},
				success: function(data){
					console.info("添加成功:", data);
					newComment._id = data._id;
					newComment.meta = data.meta;

					console.info("您当前新增的comment:", newComment);
					root.commentList.add(newComment);//新增
					console.log("-----------------------(^_^)新增成功！-----------------------");

				}.bind(this),
				error: function(xhr, status, err){
					console.error(this.props.url, status, err.toString())	
				}.bind(this)
			})
		}
		this.clear();
    },
	findCommentModel: function(comment){
		return root.commentList.findWhere(comment);
	},
	clear: function(){
		root.commentUpdate = null;
		this.setState({//清空表单
			_id:	"",
			author:"",
			text:""
		});
	},
	pass: function(comment){
		if(comment.author == "" || comment.text == ""){
			console.log("不能留空哦！");
			alert("不能留空哦！");
			return false;
		}
		return true;
	}
})

var CommentBox = React.createClass({
    getInitialState:function(){
        return {
            items:root.commentList.toJSON()
        }
    },
	loadCommentsFromServer: function(){
		$.ajax({
			url: "/comment/query",
			dataType: 'json',
			cache: false,
			success: function(data){
				console.info("comment-query:", data);
				root.commentList.reset(data.items);
			}.bind(this),
			error: function(xhr, status, err){
				console.error(this.props.url, status, err.toString())	
			}.bind(this)
		})
	},
    render:function(){
        var that = this
        return(
            <div className="comment-box">
                <CommentList items={that.state.items}/>
                <CommentForm/>
            </div>
        )
    },
    componentDidMount:function(){
        _.extend(this,Backbone.Events)
        var that = this
		this.loadCommentsFromServer();
        this.listenTo(root.commentList,'change add remove reset',function(){
            that.setState({
                items:root.commentList.toJSON()
            })
        })
    }
})
ReactDOM.render(<CommentBox/>,document.getElementById('app'))
var express = require('express')
var router = express.Router()
var mysql = require('mysql');
var db = require('../../src/db.js');

router.post("/new-post-entry",(req,res)=>{
	var bookTitle = req.body.bookTitle;
	var postTitle = req.body.postTitle;
	var postContent = req.body.postContent;
	var userName = req.body.userName;
	var sql = "INSERT INTO posts (bookTitle,postTitle, postContent, writtenTime, writer) VALUES (?,?,?,NOW(),?) ";
	var inserts = [bookTitle, postTitle, postContent, userName];	
	sql = mysql.format(sql,inserts);
	db.sendQueryResultStatusWith(sql,res)
});

router.patch("/written-post",(req,res)=>{
	if(isAuthenticated(req)){
		var postId = req.body.postId;
		var postTitle = req.body.postTitle;
		var postContent = req.body.postContent;
		var sql= "UPDATE posts set postTitle = ?, postContent = ? where id = ?";
		var inserts = [postTitle, postContent, postId];
		sql = mysql.format(sql,inserts);
		db.sendQueryResultStatusWith(sql,res)
	}
	else{
		res.send("authentication failed");
	}
});

module.exports = router

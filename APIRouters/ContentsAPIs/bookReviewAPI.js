var express = require('express')
var router = express.Router()
var mysql = require('mysql');
var escape = require('escape-html');
var db = require('../../src/db.js');
var sessionHelper = require('../SessionAPIs/sessionHelper.js')

router.get('/:id',(req,res)=>{
	var postId = req.params.id;
	var sql = mysql.format("select * from posts where id = ?",postId);
	db.sendQueryResultWith(sql,res,true);
});

router.post("/",(req,res)=>{
	var bookTitle = escape(req.body.bookTitle);
	var postTitle = escape(req.body.postTitle);
	var postContent = escape(req.body.postContent);
	var userName = escape(req.body.userName);
	var sql = "INSERT INTO posts (bookTitle,postTitle, postContent, writtenTime, writer) VALUES (?,?,?,NOW(),?) ";
	var inserts = [bookTitle, postTitle, postContent, userName];	
	sql = mysql.format(sql,inserts);
	db.sendQueryResultStatusWith(sql,res)
});

router.patch("/",(req,res)=>{
	if(sessionHelper.checkAuthenticityOf(req)){
		var postId = escape(req.body.postId);
		var postTitle = escape(req.body.postTitle);
		var postContent = escape(req.body.postContent);
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

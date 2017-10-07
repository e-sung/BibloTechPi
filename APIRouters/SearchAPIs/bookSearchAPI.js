var express = require('express')
var router = express.Router()
var mysql = require('mysql');
var db = require('../../src/db.js');

router.get('/titled/:title',(req,res)=>{
	var bookTitle  = req.params.title;
	console.log(bookTitle)
	var sql = "select * from books where title" +  " like " + "'%" + bookTitle + "%'";
	sql = mysql.format(sql);
	db.sendQueryResultWith(sql,res);
});

router.get('/written-by/:author',(req,res)=>{
	var author  = req.params.author;
	var sql = "select * from books where author " +  " like " + "'%" + author + "%'";
	sql = mysql.format(sql);
	db.sendQueryResultWith(sql,res);
});

router.get('/published-by/:publisher',(req,res)=>{
	var publisher  = req.params.publisher;
	var sql = "select * from books where publisher " +  " like " + "'%" + publisher + "%'";
	sql = mysql.format(sql);
	db.sendQueryResultWith(sql,res);
});

router.get('/rented-by/:user',(req,res)=>{
	var user = req.params.user;
	var sql = mysql.format("select * from books where renter_email = ?",user);
	db.sendQueryResultWith(sql,res);
});

router.get('/read-by/:user',(req,res)=>{
	var user  = req.params.user;
	var sql = mysql.format("select readBooks from user where email = ?",user);
	db.sendQueryResultWith(sql,res,true);
});

module.exports = router


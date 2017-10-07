var express = require('express')
var router = express.Router()
var mysql = require('mysql');
var db = require('../../src/db.js');

router.get('/title/:title',(req,res)=>{
	var bookTitle  = req.params.title;
	console.log(bookTitle)
	var sql = "select * from books where title" +  " like " + "'%" + bookTitle + "%'";
	sql = mysql.format(sql);
	db.sendQueryResultWith(sql,res);
});

router.get('/author/:author',(req,res)=>{
	var author  = req.params.author;
	var sql = "select * from books where author " +  " like " + "'%" + author + "%'";
	sql = mysql.format(sql);
	db.sendQueryResultWith(sql,res);
});

router.get('/publisher/:publisher',(req,res)=>{
	var publisher  = req.params.publisher;
	var sql = "select * from books where publisher " +  " like " + "'%" + publisher + "%'";
	sql = mysql.format(sql);
	db.sendQueryResultWith(sql,res);
});

module.exports = router


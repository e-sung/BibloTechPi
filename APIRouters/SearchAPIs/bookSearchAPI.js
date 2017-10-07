var express = require('express')
var router = express.Router()
var mysql = require('mysql');
var db = require('../../src/db.js');

router.get('/by-title',(req,res)=>{
	var bookTitle  = req.query.value;
	console.log(bookTitle)
	var sql = "select * from books where title" +  " like " + "'%" + bookTitle + "%'";
	sql = mysql.format(sql);
	db.sendQueryResultWith(sql,res);
});

router.get('/by-author',(req,res)=>{
	var author  = req.query.value;
	var sql = "select * from books where author " +  " like " + "'%" + author + "%'";
	sql = mysql.format(sql);
	db.sendQueryResultWith(sql,res);
});

router.get('/by-publisher',(req,res)=>{
	var publisher  = req.query.value;
	var sql = "select * from books where publisher " +  " like " + "'%" + publisher + "%'";
	sql = mysql.format(sql);
	db.sendQueryResultWith(sql,res);
});

module.exports = router


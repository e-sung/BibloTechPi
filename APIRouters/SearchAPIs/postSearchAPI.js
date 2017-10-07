var express = require('express')
var router = express.Router()
var mysql = require('mysql');
var db = require('../../src/db.js');

router.get('/by-book-title',(req,res)=>{
	var bookTitle = req.query.value;
	var sql = mysql.format("select id, bookTitle, postTitle, writtenTime, writer from posts where bookTitle = ?",bookTitle);
	db.sendQueryResultWith(sql,res);
});

router.get('/by-writer',(req,res)=>{
	var writer = req.query.value;
	var sql = mysql.format("select id, bookTitle, postTitle, writtenTime, writer from posts where writer  = ?",writer);
	db.sendQueryResultWith(sql,res);
});

module.exports = router


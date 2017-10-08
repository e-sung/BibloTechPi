var express = require('express')
var router = express.Router()
var mysql = require('mysql')
var db = require('../db.js')

router.get('/about/:book',(req,res)=>{
	var bookTitle = req.params.book
	var sql = mysql.format("select id, bookTitle, postTitle, writtenTime, writer from posts where bookTitle = ?",bookTitle)
	db.sendQueryResultWith(sql,res)
})

router.get('/written-by/:writer',(req,res)=>{
	var writer = req.params.writer
	var sql = mysql.format("select id, bookTitle, postTitle, writtenTime, writer from posts where writer  = ?",writer)
	db.sendQueryResultWith(sql,res)
})

module.exports = router

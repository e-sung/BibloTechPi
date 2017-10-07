var express = require('express')
var router = express.Router()
var mysql = require('mysql');
var db = require('../../src/db.js');

router.get('/info-of/book/:id',(req,res)=>{
	var bookId = req.query.id;
	var sql = mysql.format("select * from books where id = ?",bookId);
	db.sendQueryResultWith(sql,res,true);
});

router.patch('/status-of/book/:id',(req,res)=>{
	var bookId  = req.body.id;
	var userEmail = req.body.userEmail;

	if(isAuthenticated(req)){
		var sql = mysql.format("select is_rented from books where id  = ?", bookId);
		db.query(sql).
		then(function updateRentalStatusOf(books){
			if(books[0].is_rented === 0){
				var sql2 = mysql.format("update books set is_rented = 1, rented_date = now(), due_date = DATE_ADD(now(),INTERVAL 15 DAY), renter_email = ? where id = ?",
					[userEmail, bookId]);
				return db.query(sql2)
			}else{
				res.status(400).send("Can't rent rented book");
			}
		}).
		then(function updateRentalScore(){
			var sql3 = mysql.format("update user set rentscore = rentscore + 10, rentableBooks = rentableBooks - 1 where email= ?", userEmail);
			return db.query(sql3)
		}).
		then(function sendAlrightMessage(){
			res.send("Book is rented alright");
		}).catch(function sendErrorMessage(err){
			console.log(err);
			res.send("DB query error");
		})
	}
	else{
		console.log("UnAuthorized access");
		res.send("UnAuthorized access");
	}

});

router.post("/return",(req,res)=>{
	var bookId = req.body.id;
	var userName = req.body.userName; 
	var bookTitle;
	var sql = mysql.format("select *  from books where id  = ?", bookId);
	db.query(sql)
	.then(function returnThe(book){
		bookTitle = book[0].title;
		if(book[0].is_rented === 1){
			var sql2 =  mysql.format("update books set is_rented = 0, renter_email = NULL, rented_date = NULL, due_date = NULL where id = ?",bookId);
			return db.query(sql2)
		}else{
			res.status(400).send("Can't return returned book");
		}
	})
	.then(function queryUserInfo(){
		res.status(200).send("Returned the book!");
		var sql3 = mysql.format("select readBooks from user where username = ?", userName);
		return db.query(sql3)
	})
	.then(function reward(user){
		var booksReadByUser = user[0].readBooks.split(";");
		var alreadyRead = false;
		for(var i=0, item; item = booksReadByUser[i];i++){
			if(item === bookTitle){
				alreadyRead = true;
				break;
			}
		}
		var sql4, inserts;
		if(alreadyRead){//if user read this book already, just update rentable books and rentscore
			sql4 = "update user set rentableBooks = rentableBooks + 1, rentscore = rentscore + 10 where username = ?";
			inserts = [userName];
		}else{//if user hasn't read htis book, update everything
			sql4 = "update user set rentableBooks = rentableBooks + 1, rentscore = rentscore + 10, readBooks = concat(?,readBooks) where username = ?";
			inserts = [bookTitle + ";", userName];					
		}
		sql4 = mysql.format(sql4, inserts);
		return db.query(sql4)
	})
	.then(function showRewardResult(){
		console.log("user is rewarded alrgit");
	}).catch(function(error){
		console.log(error)
	})
})



module.exports = router


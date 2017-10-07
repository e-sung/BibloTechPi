//begin Express.js
var express = require('express');
var app = express();
var router = express.Router();


//load modules
require('dotenv').load();
const ApiPort = 3030;
var nodeadmin = require('nodeadmin');
var bodyParser = require('body-parser');
var escape = require('escape-html');
var crypto = require("crypto");
var mysql = require('mysql');

//belows are custom modules
var validation = require('./src/validation.js');
var changeUserInfo = require('./src/changeUserInfo.js');
var signup = require('./src/signup.js');
var db = require('./src/db.js');

//app settings
app.use(nodeadmin(app));
app.use(bodyParser.json());       // to use 'req.body.queryname syntax // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/test-connection',(req,res)=>{
	res.send("OK");
});

app.post('/signup',(req,res)=>{ 
	var userInputs = signup.parseUserInputsOutOf(req); //First parse userInputs from request
	var validity = signup.validateParsed(userInputs);//Then validate userInputs
	var userPassword = userInputs.password;
	delete userInputs.password; //After validating, get rid of password information from userInputs object. This object can be sent to client;

	if(signup.checkPurityOf(validity)){
		signup.registerUserWith(userInputs,userPassword)
		.then(function reportSuccess(){
			console.log("new user was registered!")
			res.json(validity)
		})
		.catch(function report(error){
			var causeOfError = error.sqlMessage.split("key")[1].trim()
			switch(causeOfError){
				case "'username'":
					validity.userNameValidity = signup.errorMessage.ofUserNameDuplication
					break
				case "'email'":
					validity.emailValidity = signup.errorMessage.ofEmailDuplication
					break
				case "'phonenumber'":
					validity.phoneNumberValidity = signup.errorMessage.phoneNumberDuplication
			}
			console.log(validity)
			res.json(validity)
		})
	}else{
		console.log(validity)
		res.json(validity)
	}
});

app.post('/login',(req,res)=>{
	var clientEmail = req.body.userEmail;
	var clientPassword = req.body.password;

	var sql = mysql.format("select * from user where email = ?", clientEmail);
	db.query(sql)
	.then(function(queryResult){
		var user = queryResult[0]
		var hashedPasswordOfClient = crypto.createHmac('md5',user.salt).update(clientPassword).digest('hex');
		if(user.password === hashedPasswordOfClient){
			user.authToken = clientEmail + "|" + hashedPasswordOfClient
			res.json(user);
		}else{
			res.status(400).send("Invalid Password");
		}
	},function(error){
		res.status(400).send("Invalid Email");
	})
});

app.get('/user-info',(req,res)=>{
	var email = req.query.email;
	var sql = mysql.format("select * from user where email = ? ", email);
	db.sendQueryResultWith(sql,res,true);
});

app.get('/search-result/by-title',(req,res)=>{
	var bookTitle  = req.query.value;
	var sql = "select * from books where title" +  " like " + "'%" + bookTitle + "%'";
	sql = mysql.format(sql);
	db.sendQueryResultWith(sql,res);
});

app.get('/search-result/by-author',(req,res)=>{
	var author  = req.query.value;
	var sql = "select * from books where author " +  " like " + "'%" + author + "%'";
	sql = mysql.format(sql);
	db.sendQueryResultWith(sql,res);
});

app.get('/search-result/by-publisher',(req,res)=>{
	var publisher  = req.query.value;
	var sql = "select * from books where publisher " +  " like " + "'%" + publisher + "%'";
	sql = mysql.format(sql);
	db.sendQueryResultWith(sql,res);
});

app.get('/post-info/by-book-title',(req,res)=>{
	var bookTitle = req.query.bookTitle;
	var sql = mysql.format("select id, bookTitle, postTitle, writtenTime, writer from posts where bookTitle = ?",bookTitle);
	db.sendQueryResultWith(sql,res);
});

app.get('/post-info/by-writer',(req,res)=>{
	var writer = req.query.writer;
	var sql = mysql.format("select id, bookTitle, postTitle, writtenTime, writer from posts where writer  = ?",writer);
	db.sendQueryResultWith(sql,res);
});

app.get('/post-content',(req,res)=>{
	var postId = req.query.postId;
	var sql = mysql.format("select * from posts where id = ?",postId);
	db.sendQueryResultWith(sql,res,true);
});

app.get('/books/rented',(req,res)=>{
	var renterEmail = req.query.email;
	var sql = mysql.format("select * from books where renter_email = ?",renterEmail);
	db.sendQueryResultWith(sql,res);
});

app.get('/books/read',(req,res)=>{
	var email  = req.query.email;
	var sql = mysql.format("select readBooks from user where email = ?",email);
	db.sendQueryResultWith(sql,res,true);
});

app.post("/new-post-entry",(req,res)=>{
	var bookTitle = req.body.bookTitle;
	var postTitle = req.body.postTitle;
	var postContent = req.body.postContent;
	var userName = req.body.userName;
	var sql = "INSERT INTO posts (bookTitle,postTitle, postContent, writtenTime, writer) VALUES (?,?,?,NOW(),?) ";
	var inserts = [bookTitle, postTitle, postContent, userName];	
	sql = mysql.format(sql,inserts);
	db.sendQueryResultStatusWith(sql,res)
});

app.patch("/written-post",(req,res)=>{
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

app.get('/rental-info',(req,res)=>{
	var bookId = req.query.id;
	var sql = mysql.format("select * from books where id = ?",bookId);
	db.sendQueryResultWith(sql,res,true);
});

app.post('/rent',(req,res)=>{
	var bookId  = req.body.id;
	var userEmail = req.body.userEmail;

	if(isAuthenticated(req)){
		var sql = mysql.format("select is_rented from books where id  = ?", bookId);
		console.log(sql)
		db.query(sql).
		then(function updateRentalStatusOf(books){
			console.log(books)
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


app.post("/return",(req,res)=>{
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

function isAuthenticated(req){ 
	return new Promise(function(resolve, reject){
		var authToken = req.get("Authorization");
		var userEmail = authToken.split("|")[0];                     
		var userHash = authToken.split("|")[1];                     
		var sql = mysql.format("select password from user where email = ?",userEmail);
		db.query(sql).
		then(function(result){
			if(userHash==result[0].password){
				resolve(true);
			}else{
				reject(false);
			}
		},function(err){
			res.send(err);
			console.log(err);
		})
	});
}

app.listen(ApiPort,()=>{
	console.log("Api Server started at port" + ApiPort); 
});

app.use(function(req, res, next) {
  res.status(404).send('<h1>404 page not found!</h1>');
});

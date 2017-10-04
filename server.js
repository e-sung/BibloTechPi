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
var connection = require('./src/db.js');

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

	signup.checkSameUserExistence(userInputs.email , function getQueryResultMessageWith(errorMessage) { //Finally check if user with same 'email' exists
		if(errorMessage){                  													   //Why validate this seperately? Because this is the only validation that requires db access. 
			validity.emailValidity = errorMessage;			
			console.log(validity);
			res.json(validity);
		}
		else if(signup.isAllValid(validity)){ //if everything is allright
			signup.insertDB(userInputs,userPassword);//insert provided information into database
			console.log("New user registered!");
			res.send(validity);
		}
		else{ 
			console.log(validity);
			res.json(validity);
		}
	});
});


app.post('/login',(req,res)=>{
	var userEmail = req.body.userEmail;
	var password = req.body.password;

	var sql = mysql.format("select * from user where email = ?", userEmail);
	connection.query(sql,function(err,rows,fields){
		if(err){
			res.send("DB query error");
		}
		else if(rows.length>0){
			var originalHash = rows[0].password;
			var salt = rows[0].salt;
			var newHash = crypto.createHmac('md5',salt).update(password).digest('hex');
			if(originalHash == newHash){//login success
				var user = {
					username : rows[0].username,
					email : rows[0].email,
					rentscore : rows[0].rentscore,
					rentableBooks : rows[0].rentableBooks,
					authToken : userEmail + "|" + newHash
				};
				res.json(user);
			}
			else{
				res.status(400).send("Invalid Password");
			}
		}
		else{
			res.status(400).send("Invalid Email");
		}
	});
});



app.get('/user-info',(req,res)=>{
	var email = req.query.email;
	var sql = mysql.format("select * from user where email = ? ", email);
	connection.query(sql,function(err,rows,fields){
		if(err){
			res.send("DB query error");
		}

		res.json(rows[0]);
	})
});

app.get('/search-result/by-title',(req,res)=>{
	var bookTitle  = req.query.value;
	var sql = "select * from books where title" +  " like " + "'%" + bookTitle + "%'";
	sql = mysql.format(sql);
	connection.query(sql,function(err,rows,fields){
		if(err){
			res.send("DB query error");
		}

		res.json(rows);
	});
});

app.get('/search-result/by-author',(req,res)=>{
	var author  = req.query.value;
	var sql = "select * from books where author " +  " like " + "'%" + author + "%'";
	sql = mysql.format(sql);
	connection.query(sql,function(err,rows,fields){
		if(err){
			res.send("DB query error");
		}
		res.json(rows);
	});
});

app.get('/search-result/by-publisher',(req,res)=>{
	var publisher  = req.query.value;
	var sql = "select * from books where publisher " +  " like " + "'%" + publisher + "%'";
	sql = mysql.format(sql);
	connection.query(sql,function(err,rows,fields){
		if(err){
			res.send("DB query error");
		}
		res.json(rows);
	});
});



app.get('/post-info/by-book-title',(req,res)=>{
	var bookTitle = req.query.bookTitle;
	var sql = mysql.format("select id, bookTitle, postTitle, writtenTime, writer from posts where bookTitle = ?",bookTitle);
	connection.query(sql,function(err,rows,fields){
		if(err){
			res.send("DB query error");
		}
		else{
			res.json(rows);
		}
	});
});

app.get('/post-info/by-writer',(req,res)=>{
	var writer = req.query.writer;
	var sql = mysql.format("select id, bookTitle, postTitle, writtenTime, writer from posts where writer  = ?",writer);
	connection.query(sql,function(err,rows,fields){
		if(err){
			res.send("DB query error");
		}
		else{
			res.json(rows);
		}
	});
});

app.get('/post-content',(req,res)=>{
	var postId = req.query.postId;
	var sql = mysql.format("select * from posts where id = ?",postId);
	connection.query(sql,function(err,rows,fields){
		if(err){
			res.send("DB query error");
		}
		else{
			res.json(rows[0]);
		}
	});
});

app.get('/books/rented',(req,res)=>{
	var renterEmail = req.query.email;
	var sql = mysql.format("select * from books where renter_email = ?",renterEmail);
	connection.query(sql,function(err,rows,fields){
		if(err){
			res.send("DB query error");
		}else{
			res.json(rows);
		}
	});
});

app.get('/books/read',(req,res)=>{
	var email  = req.query.email;
	var sql = mysql.format("select readBooks from user where email = ?",email);
	connection.query(sql,function(err,rows,fields){
		if(err){
			res.send("DB query error");
		}
		else{
			res.json(rows[0]);
		}
	});
});

app.post("/new-post-entry",(req,res)=>{
	var bookTitle = req.body.bookTitle;
	var postTitle = req.body.postTitle;
	var postContent = req.body.postContent;
	var userName = req.body.userName;
	var sql = "INSERT INTO posts (bookTitle,postTitle, postContent, writtenTime, writer) VALUES (?,?,?,NOW(),?) ";
	var inserts = [bookTitle, postTitle, postContent, userName];	
	sql = mysql.format(sql,inserts);
	connection.query(sql,function(err,rows,fields){
		if(err){
			res.send("DB query error");
		}else{
			res.send("OK");
		}
	});
});

app.patch("/written-post",(req,res)=>{
	if(isAuthenticated(req)){
		var postId = req.body.postId;
		var postTitle = req.body.postTitle;
		var postContent = req.body.postContent;
		var sql= "UPDATE posts set postTitle = ?, postContent = ? where id = ?";
		var inserts = [postTitle, postContent, postId];
		sql = mysql.format(sql,inserts);
		connection.query(sql,function(err,rows,fields){
			if(err){
				res.send("DB Query error");
			}
			else{
				res.send("OK");
			}
		});
	}
	else{
		res.send("authentication failed");
	}
});

app.get('/rental-info',(req,res)=>{
	var bookId = req.query.id;
	var sql = mysql.format("select * from books where id = ?",bookId);
	connection.query(sql,function(err,rows,fields){
		res.send(rows[0]);	
	});
});

app.post('/rent',(req,res)=>{
	var bookId  = req.body.id;
	var userEmail = req.body.userEmail;

	if(isAuthenticated(req)){
		var sql = mysql.format("select is_rented from books where id  = ?", bookId);
		connection.query(sql,function(err,rows,fields){
			if(rows[0].is_rented===0){//if the books is not rented
				var sql2 = mysql.format("update books set is_rented = 1, rented_date = now(), due_date = DATE_ADD(now(),INTERVAL 15 DAY), renter_email = ? where id = ?", 
					[userEmail, bookId]);
				connection.query(sql2,function(err2,rows2,fields2){//rent the book : due date is 15days from now
					if(err){
						res.send("DB query error");
					}
				});

				var sql3 = mysql.format("update user set rentscore = rentscore + 10, rentableBooks = rentableBooks - 1 where email= ?", userEmail);
				connection.query(sql3,function(err3,rows3,fields3){//As user rents the book, the amount of books he can rent decrement(rentableBooks -= 1)
					if(err){
						res.send("DB query error");
					}
				});													//Also rentscore is incremented to encourage user to rent more books
				res.send("Book is rented alright");
			}
			else{
				res.status(400).send("Can't rent rented book");
			}
		});
	}
	else{
		console.log("UnAuthorized access");
		res.send("UnAuthorized access");
	}

});


app.post("/return",(req,res)=>{
	var bookId = req.body.id;
	var userName = req.body.userName; 
	var sql = mysql.format("select readBooks from user where username = ?", userName);
	connection.query(sql,function(err,rows,fields){
		var sql2 = mysql.format("select *  from books where id  = ?", bookId);
		connection.query(sql2,function(err2,rows2,fields2){
			var bookTitle = rows2[0].title;
			var is_rented = rows2[0].is_rented;
			if (is_rented===1) {//check if this book is already rented. IF it's not already rented, it shouldn't be 'returned!'
				var sql3 = mysql.format("update books set is_rented = 0, renter_email = NULL, rented_date = NULL, due_date = NULL where id = ?",bookId);
				connection.query(sql3,function(err3,rows3,fields3){
					console.log(rows3);
				});

				var booksReadByUser = rows[0].readBooks.split(";");//every books that user ever read 
				var alreadyRead = false;
				for(var i=0, item; item=booksReadByUser[i]; i++){//if user already read this book, we shouldn't add this book to the list
					if (item===bookTitle) {                      //but if user hasn't read this book, we will add this book to the list
						alreadyRead = true;						 //so we are making 'alreadyRead' variable that knows if this book was read
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
				connection.query(sql4,function(err4,rows4,fields4){
					console.log(userName + " is rewarded alright");
				});
				res.status(200).send("Returned the book!");
			}
			else{
				res.status(400).send("Can't return returned book");
			}
		});
	});
});


function isAuthenticated(req){ 
	return new Promise(function(resolve, reject){
		var authToken = req.get("Authorization");
		var userEmail = authToken.split("|")[0];                     
		var userHash = authToken.split("|")[1];                     
		var sql = mysql.format("select password from user where email = ?",userEmail);
		connection.query(sql,function(err,rows,fields){
			if(userHash == rows[0].password){
				resolve(true);
			}
			else{
				reject();
			}
		});
	});
}

app.listen(ApiPort,()=>{
	console.log("Api Server started at port" + ApiPort); 
});

app.use(function(req, res, next) {
  res.status(404).send('<h1>404 page not found!</h1>');
});

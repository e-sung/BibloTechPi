//begin Express.js
var express = require('express');
var app = express();

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

//API routers
var bookSearchAPI = require('./APIRouters/SearchAPIs/bookSearchAPI.js')
var postSearchAPI = require('./APIRouters/SearchAPIs/postSearchAPI.js')
var rentalAPI = require('./APIRouters/RentalAPIs/rentalAPI.js')
var sessionAPI = require('./APIRouters/SessionAPI/sessionAPI.js')

//use routers
app.use('/books',bookSearchAPI)
app.use('/post-list',postSearchAPI)
//app.use('/rental',rentalAPI)
app.use('/user',sessionAPI)

app.get('/post-content/:id',(req,res)=>{
	var postId = req.params.id;
	var sql = mysql.format("select * from posts where id = ?",postId);
	db.sendQueryResultWith(sql,res,true);
});

app.get('/test-connection',(req,res)=>{
	res.send("OK");
});

app.get('/user-info',(req,res)=>{
	var email = req.query.email;
	var sql = mysql.format("select * from user where email = ? ", email);
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
		var sql= "UPDATE posts set postTitle = ?, postContent = ? where id = ?";
		var inserts = [req.body.postTitle, req.body.postContent, req.body.postId];
		sql = mysql.format(sql,inserts);
		db.sendQueryResultStatusWith(sql,res)
	}
	else{
		res.send("authentication failed");
	}
});

app.listen(ApiPort,()=>{
	console.log("Api Server started at port" + ApiPort); 
});

app.use(function(req, res, next) {
  res.status(404).send('<h1>404 page not found!</h1>');
});

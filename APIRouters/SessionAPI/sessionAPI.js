var express = require('express')
var router = express.Router()
var crypto = require("crypto");
var mysql = require('mysql');
var db = require('../../src/db.js');

router.get('/info-of/:email',(req,res)=>{
	var email = req.params.email;
	console.log(email)
	var sql = mysql.format("select * from user where email = ? ", email);
	db.sendQueryResultWith(sql,res,true);
});


router.post('/sign-up',(req,res)=>{ 
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

router.post('/sign-in',(req,res)=>{
	var clientEmail = req.body.userEmail;
	var clientPassword = req.body.password;
	var sql = mysql.format("select * from user where email = ?", clientEmail);
	db.query(sql)
	.then(function doLoginProcessWith(queryResult){
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

module.exports = router
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


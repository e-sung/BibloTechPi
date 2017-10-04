var escape = require('escape-html');
var connection = require('./db.js');
var mysql = require('mysql');
var crypto = require("crypto");

module.exports={

	parseUserInputsOutOf : function (req) {
		var userInputs = {};
		userInputs.userName = escape(req.body.userName);
		userInputs.phoneNumber = escape(req.body.phoneNumber);
		userInputs.email = escape(req.body.email);
		userInputs.password = escape(req.body.password);
		userInputs.passwordConfirm = escape(req.body.passwordConfirm);

		return userInputs;
	},

	validateParsed : function (userInputs) {
		var validity= {};
		validity.userNameValidity = checkUserName(userInputs.userName);
		validity.phoneNumberValidity = checkPhoneNumber(userInputs.phoneNumber);
		validity.emailValidity = checkEmail(userInputs.email);
		validity.passwordValidity = checkPassword(userInputs.password);
		validity.passwordConfirmValidity = checkPasswordConfirm(userInputs.password, userInputs.passwordConfirm);

		return validity;
	},

	checkSameUserExistence : function(email,getQueryResultMessageWith){
		var user_exists = false;
		var sql = mysql.format("select * from user where email =?", email);
		connection.query(sql, function(err,rows,fields){
			if(err) throw err;
			if(rows.length>0){
				stringToShow = "User with same email address  exists";
			}
			else{
				stringToShow = "";
			}
			getQueryResultMessageWith(stringToShow);
			return stringToShow;
		});
	},

	checkPurityOf : function(validity) {
		var purity = true ;
		for(var key in validity){
			if(validity[key] !== "" || validity[key] === undefined){
				purity = false;
				break;
			}
		}
		return purity;
	},
	insertDB : function(userInputs,userPassword){
		var salt = crypto.randomBytes(16).toString('hex');
		var hash = crypto.createHmac('md5',salt).update(userPassword).digest('hex');
		var sql = mysql.format("INSERT INTO user (username, phonenumber,email,password,salt,rentableBooks,readBooks) VALUES (?,?,?,?,?,5,';')", 
			[userInputs.userName, userInputs.phoneNumber, userInputs.email,hash, salt]);			
		connection.query(sql, function(err, rows, fields) {
			if (err) throw err;
			console.log(rows);
		});
	},
};


function checkUserName(userName) {
	var re = new RegExp("[a-zA-Z0-9_-]{3,20}");
	if(re.test(userName)){
		return "";
	}
	else{
		return "More than 3 characters required";
	}
}

function checkPhoneNumber(phoneNumber) {
	re = new RegExp("^010-?[\\d]{4}-?[\\d]{4}$");
	if(re.test(phoneNumber)){
		return "";	
	}
	else{
		return "Unvalid Phone Number";
	}
}

function checkEmail(email){
	re = new RegExp("^[\\S]+@[\\S]+\\.+[\\S]+$");
	if(re.test(email)){
		return "";
	}
	else{
		return "Unvalid email address";
	}		
}

function checkPassword(password) {
	var re = new RegExp("[a-zA-Z0-9_-]{3,20}");
	if(re.test(password)){
		return "";
	}
	else{
		return "More than 3 characters required";
	}
}


function checkPasswordConfirm(password,passwordConfirm){
	if(password === passwordConfirm){
		return "";
	}
	else{
		return "Password doesn't match!";
	}
}

function passUserExistence(err, rows, fields,showQueryResultWith){
	if(err) throw err;
	if(rows.length>0){
		stringToShow = "User with same email address  exists";
	}
	else{
		stringToShow = "";
	}
	showQueryResultWith(stringToShow);
	return stringToShow;
}

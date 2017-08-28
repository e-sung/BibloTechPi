//TODO Add changeUserInfoActivity for client App
var escape = require('escape-html');
var connection = require('./db.js');
var mysql = require('mysql');
var crypto = require("crypto");

module.exports={

	getUserInputs : function (req) {
		var userInputs = {};
		userInputs.phoneNumber = escape(req.body.phoneNumber);
		userInputs.email = escape(req.body.email);
		userInputs.originalPassword = req.body.originalPassword;
		userInputs.previousPassword = escape(req.body.previousPassword);
		userInputs.password = escape(req.body.password);
		userInputs.passwordConfirm = escape(req.body.passwordConfirm);

		return userInputs;
	},
	getUserInputsValidity : function (userInputs) {
		var validity= {};
		validity.phoneNumberValidity = checkPhoneNumber(userInputs.phoneNumber);
		validity.emailValidity = checkEmail(userInputs.email);
		validity.previousPasswordValidity = checkPreviousPassword(userInputs.previousPassword,userInputs.originalPassword);
		validity.passwordValidity = checkPassword(userInputs.password);
		validity.passwordConfirmValidity = checkPasswordConfirm(userInputs.password, userInputs.passwordConfirm);

		return validity;
	},
	isAllValid : function(validity) {
		var valid = true ;
		for(var key in validity){
			if(validity[key] !== "" || validity[key] === undefined){
				valid = false;
				break;
			}
		}
		return valid;
	},
	updateDB : function(userInputs,userPassword){
		var salt = crypto.randomBytes(16).toString('hex');
		var hash = crypto.createHmac('md5',salt).update(userPassword).digest('hex');
		var inserts = [userInputs.phoneNumber, userInputs.email, hash, salt, userInputs.userName];
		var sql = mysql.format("UPDATE user set phonenumber = ?, email = ?, password = ?, salt = ? where username = ?", inserts);			
		console.log(sql)
		connection.query(sql, function(err, rows, fields) {
			if (err) throw err;
			console.log(rows);
		});
	}
};

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

function checkPreviousPassword(p1,hash) {
	var hashed_p1 = crypto.createHmac('md5',SALT).update(p1).digest('hex');

	if(hashed_p1 == hash){
		return "";
	}else{
		return "Previous Password was invalid";
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

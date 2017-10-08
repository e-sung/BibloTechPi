var escape = require('escape-html');
var db = require('../db.js');
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
	registerUserWith : function(userInputs,userPassword){
		return new Promise(function(resolve,reject){
			var salt = crypto.randomBytes(16).toString('hex');
			var hash = crypto.createHmac('md5',salt).update(userPassword).digest('hex');
			var sql = mysql.format("INSERT INTO user (username, phonenumber,email,password,salt,rentableBooks,readBooks) VALUES (?,?,?,?,?,5,';')", 
				[userInputs.userName, userInputs.phoneNumber, userInputs.email,hash, salt]);			
			console.log(sql)
			db.query(sql)
			.then(function show(result){
				console.log(result)
				resolve()
			}, function show(error){
				reject(error)
			})
		})
	},
};
var errorMessage = {
	ofEmailDuplication : "User with Same Email Address already Exists",
	ofEmailSyntax : "Invalid Email Syntax",
	ofUserNameDuplication: "User with Same User Name already Exists",
	ofUserNameRequirement: "More than 3 characters required",
	ofPhoneNumberDuplication : "User with Same PhoneNumber already Exists",
	ofPhoneNumberSyntax : "Invalid PhoneNumber Syntax",
	ofPasswordRequireMent : "Password should be more than 3 characters",
	ofPasswordConfirm : "Password doesn't Match!"
}
module.exports.errorMessage = errorMessage

function checkUserName(userName) {
	var re = new RegExp("[a-zA-Z0-9_-]{3,20}");
	if(re.test(userName)){
		return "";
	}
	else{
		return errorMessage.ofUserNameRequirement
	}
}

function checkPhoneNumber(phoneNumber) {
	re = new RegExp("^010-?[\\d]{4}-?[\\d]{4}$");
	if(re.test(phoneNumber)){
		return "";	
	}
	else{
		return errorMessage.ofPhoneNumberSyntax
	}
}

function checkEmail(email){
	re = new RegExp("^[\\S]+@[\\S]+\\.+[\\S]+$");
	if(re.test(email)){
		return "";
	}
	else{
		return errorMessage.ofEmailSyntax
	}		
}

function checkPassword(password) {
	var re = new RegExp("[a-zA-Z0-9_-]{3,20}");
	if(re.test(password)){
		return "";
	}
	else{
		return errorMessage.ofPasswordRequireMent
	}
}


function checkPasswordConfirm(password,passwordConfirm){
	if(password === passwordConfirm){
		return "";
	}
	else{
		return errorMessage.ofPasswordConfirm
	}
}

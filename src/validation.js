var connection = require('./db.js');
var mysql = require('mysql');
module.exports={
	userName : function(name){
		var re = new RegExp("[a-zA-Z0-9_-]{3,20}");
			var return_value = "";
			if(re.test(name)===false){
				return "username length should be 3~20";
			}
			else{
				return return_value;
			}
	},
	userExists : function(name,callback){
		var user_exists = false;
		var sql = mysql.format("select * from user where username =?", name);
		connection.query(sql, function(err,rows,fields){
			userExistsInQuery(err,rows,fields,callback);
		});
	},
	password : function(input){
		re = new RegExp("[a-zA-Z0-9_-]{3,20}");
		if (re.test(input)){
			return "";
		}
		else{
			return "Password length should be 3~20";
		}
	},
	email : function(input){
		re = new RegExp("^[\\S]+@[\\S]+\\.+[\\S]+$");
		if(re.test(input)){
			return "";
		}
		else{
			return "Invalid email address";
		}		
	},
	phoneNumber : function(input){
		re = new RegExp("^[\\d]{3}-?[\\d]{4}-?[\\d]{4}$");
		if(re.test(input)){
			return "";
		}
		else{
			return "Invalid PhoneNumber";
		}		
	},
	passwordConfirm : function(input1,input2){
		if(input1 === input2){
			return "";
		}
		else{
			return "Password doesn't match!";
		}
	}
};

function userExistsInQuery(err, rows, fields,callback){
			if(err) throw err;
			if(rows.length>0){
				return_value = "User with same username exists";
				callback(return_value);
				return return_value;
			}
			else{
				callback("");
				return "";
			}
		}

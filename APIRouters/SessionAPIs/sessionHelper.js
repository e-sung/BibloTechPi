var db = require('../db.js');

module.exports.checkAuthenticityOf = function (req){ 
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

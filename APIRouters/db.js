var mysql = require('mysql')
require('dotenv').load()
var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : process.env.DB_PASS,
    database : 'library'
})

connection.connect(function(err) {
    if (err) throw err
})

module.exports = {
	connection : connection,
	query : function(sql){
		return new Promise(function(resolve,reject){
			connection.query(sql,function(err,rows,fields){
				if(err){
					reject(err)
				}else{
					resolve(rows)
				}
			})
		})
	},
	sendQueryResultStatusWith : function(sql,res){
		this.query(sql).
		then(function(){
			res.send("OK")
		},function(error){
			console.log(error)
			res.send("DB Query Error")
		})
	},
	sendQueryResultWith : function(sql,res,shouldReturnSingleItem){
		this.query(sql).
		then(function(queryResult){
			if(shouldReturnSingleItem){
				res.json(queryResult[0])
			}else{
				res.json(queryResult)
			}
		},function(err){
			console.log(err)
			res.send("DB query Error")
		})
	}
}

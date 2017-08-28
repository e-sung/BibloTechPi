var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : process.env.DB_PASS,
    database : 'library'
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;

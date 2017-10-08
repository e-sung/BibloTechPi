//begin Express.js
var express = require('express')
var app = express()
const ApiPort = 3030

//load external modules
var nodeadmin = require('nodeadmin') // GUI interface for mysql : http://localhost/3030/nodeadmin
var bodyParser = require('body-parser')
app.use(nodeadmin(app))
app.use(bodyParser.json())           // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({       // to support URL-encoded bodies
  extended: true
}))

//API routers
var bookSearchAPI = require('./APIRouters/SearchAPIs/bookSearchAPI.js')
var postSearchAPI = require('./APIRouters/SearchAPIs/postSearchAPI.js')
var rentalAPI = require('./APIRouters/RentalAPIs/rentalAPI.js')
var sessionAPI = require('./APIRouters/SessionAPIs/sessionAPI.js') 
var bookReviewAPI = require('./APIRouters/ContentsAPIs/bookReviewAPI.js')
//use routers
app.use('/books',bookSearchAPI)
app.use('/post-list',postSearchAPI)
app.use('/entry/of-book-review',bookReviewAPI)
app.use('/rental',rentalAPI)
app.use('/user',sessionAPI)
app.use(function(req, res, next) {
  res.status(404).send('<h1>404 page not found!</h1>')
})

app.listen(ApiPort,()=>{
	console.log("Api Server started at port" + ApiPort) 
})

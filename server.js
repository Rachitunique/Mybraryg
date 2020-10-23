//this is main server file
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({path:'.env'})
}
//require express
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
//import the router into our server so it knows our request, here the path is relative and ./ means relative to where we are
const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')
//configuring our express application
app.set('view engine', 'ejs')
//views are going to be coming from views directory
app.set('views', __dirname + '/views')
//every single file is going to be put inside the layout file so we don't have to duplicate all the brgining html and ending html of our projects such as the header and the footer
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
//public folder contains all the javascript css and images
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

const mongoose = require('mongoose')
//when we are developing we want mongoose to connect to our local mongodb server but when we deploy we want to a server that is on the web somewhere
//{} contains options for how we want to set up mongodb inside of our application
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
 })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))
//indexRouter is the router which handles our /
app.use('/', indexRouter)
app.use('/authors', authorRouter)
//by doing this we tell that we want all of our /books routes to go to our book router
app.use('/books', bookRouter)
//process.environment.port which is going to pull from an environment variable for when we deploy the server is going to tell us what port it is listening to
app.listen(process.env.PORT || 3000)

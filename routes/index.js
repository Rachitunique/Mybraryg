const express = require('express')
//we want to get the router portion of the express variable so we are going to call the router function
const router = express.Router()
const Book = require('../models/book')

router.get('/', async (req, res) => {
  //to display the in0.ejs
  let books
  try {
    //we want to display the image in desending of their time of being uploded on the app and we want to upload only top 10
    //recently added books
    books = await Book.find().sort({ createdAt: 'desc' }).limit(10).exec()
  } catch {
    //if we recieve an error we want to initialise our books with an empty array
    books = []
  }
  res.render('index', { books: books })
})
//export our router and set up in index.js
module.exports = router

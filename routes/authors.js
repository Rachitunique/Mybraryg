const express = require('express')
const router = express.Router()
const Author = require('../models/author')

// All Authors Route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const authors = await Author.find(searchOptions)
    //the red author is going to be equal to author variable above as the above author contains all the author
    //the element engulfed in {} with red is passed to in0.ejs and those are the objects
    res.render('authors/index', {
      authors: authors,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Author Route
router.get('/new', (req, res) => {
  res.render('authors/new', { author: new Author() })
})

// Create Author Route
router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name
  })
  try {
    const newAuthor = await author.save()
    // res.redirect(`authors/${newAuthor.id}`)
    res.redirect(`authors`)
  } catch {
    res.render('authors/new', {
      author: author,
      errorMessage: 'Error creating Author'
    })
  }
})

module.exports = router

const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
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
    res.redirect(`authors/${newAuthor.id}`)
  } catch {
    res.render('authors/new', {
      author: author,
      errorMessage: 'Error creating Author'
    })
  }
})
//this is going to be for showing our user and for path we actually need to pass an ID into this path so we are going to just
//say :id and this is signifying that after this colon is going yo be a variable called ID that is going to be passed along
//with our request
router.get('/:id', async(req,res) => {
  try{
    //the params variable is just going to give us all the parameters that we define inside of our URL paths(ID)
    //this will give us id from the url
    const author = await Author.findById(req.params.id)
    //check that if books exist, if exist only display 6 books of that author
    //We have to import Book model in author.js for using Book.find
    const books = await Book.find({author: author.id}).limit(6).exec()
    res.render('authors/show', {
      author: author,
      booksByAuthor: books
    })
  }catch{
    res.redirect('/')
  }
})
router.get('/:id/edit', async(req,res) => {
  try{
    const author = await Author.findById(req.params.id)
    res.render('authors/edit', { author: author })
  }catch{
    res.redirect('/authors')
  }
})
//update author
router.put('/:id', async(req,res) => {
  //this author variable is used in try as well as catch thats why it is declared at the top instead in the try block
  let author
  try {
    author = await Author.findById(req.params.id)
    //to update the old name with new one
    author.name = req.body.name
    await author.save()
    res.redirect(`/authors/${author.id}`)
  } catch {
    //if await fun fails that means we have not been able to find a author
    if(author == null){
      res.redirect('/')
    }
    //if it fails at author.save()
    else{
      res.render('authors/new', {
        author: author,
        errorMessage: 'Error upting Author'
      })
    }
  }
})
router.delete('/:id', async(req,res) => {
  let author
  try {
    author = await Author.findById(req.params.id)
    await author.remove()
    //since the required author would be deleted than we want to redirect back to author general page but not the author.id page
    res.redirect('/authors')
  } catch {
    if(author == null){
      res.redirect('/')
    }
    else{
      //if we fail to delete that author than we want to redirect back to that author page only
      res.redirect(`/authors/${author.id}`)
    }
  }
})
module.exports = router

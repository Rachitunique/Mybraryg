const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Book = require('../models/book')
const Author = require('../models/author')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const upload = multer({
  //where the upload is going to be
  dest: uploadPath,
  //allows us to filter which files our server accepts
  //so that one file dosen't shows up when other is selected
  //file accepts the file object and callback needs to be called whenever we are done with our file filter
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})

// All Books Route
router.get('/', async (req, res) => {
  //this returns a query object which we can build a query from and then execute later and we want to build this query from req.query parameters
  let query = Book.find()
  if (req.query.title != null && req.query.title != '') {
    // 11111=>regex is there for searching here so that we get a output when we type something
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  //the below two if conditions are used for filtering
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    //if the query is lte is less than or equal to the publish before date than we want to return that object
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    //gte is greater than or equal to
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  try {
    //this is going to execute query that we defined up to 11111 and we appended to down down at new RegExp
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Book Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
})

// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
  //if file name is nothing return null else return filename
  const fileName = req.file != null ? req.file.filename : null
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    //req.body.date returns date in string form to change it into date we did Date(req.body.date)
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description
    //we first need to create the cover image file on our file system get the name from that and than save that into our book object
  })

  try {
    const newBook = await book.save()
    //if the book does save correctly we just want to redirect to that books Page
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`)
  } catch {
    //if error is there than redirect to /books route as it goes to catch of renderNewPage
    //code will come in if statement when bookcover name is there but there is error in creating new book so ids of such books needs o be removed
    //if there is no bookcover name than there is no book cover to remove
    if (book.coverImageName != null) {
      removeBookCover(book.coverImageName)
    }
    renderNewPage(res, book, true)
  }
})

function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err)
  })
}

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({})
    //params is used for dinamically creating an error
    const params = {
      //parameters send to the form as objects to post request receiving in new.ejs in books view
      authors: authors,
      book: book
    }
    if (hasError) params.errorMessage = 'Error Creating Book'
    res.render('books/new', params)
  } catch {
    res.redirect('/books')
  }
}

module.exports = router

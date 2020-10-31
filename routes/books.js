const express = require('express')
const router = express.Router()
//deleted after removing upload folder
//const path = require('path')
//const fs = require('fs')
const Book = require('../models/book')
const Author = require('../models/author')
//removed after deleting the upload folder
//const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
//const upload = multer({
  //where the upload is going to be
//  dest: uploadPath,
  //allows us to filter which files our server accepts
  //so that one file dosen't shows up when other is selected
  //file accepts the file object and callback needs to be called whenever we are done with our file filter
//  fileFilter: (req, file, callback) => {
//    callback(null, imageMimeTypes.includes(file.mimetype))
//  }
//})

// All Books Route
//upload.single('cover') was used here
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
router.post('/', async (req, res) => {
  //if file name is nothing return null else return filename
  //the fileName and coverImageName is taken care by saveCover function
  //const fileName = req.file != null ? req.file.filename : null
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    //req.body.date returns date in string form to change it into date we did Date(req.body.date)
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    //coverImageName: fileName,
    description: req.body.description
    //we first need to create the cover image file on our file system get the name from that and than save that into our book object
  })
  //function created to save our cover
  //the name of our fileinput is set to cover in _form_fields.ejs
  saveCover(book, req.body.cover)

  try {
    const newBook = await book.save()
    //if the book does save correctly we just want to redirect to that books Page
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`)
  } catch {
    //if error is there than redirect to /books route as it goes to catch of renderNewPage
    //code will come in if statement when bookcover name is there but there is error in creating new book so ids of such books needs o be removed
    //if there is no bookcover name than there is no book cover to remove
    //if (book.coverImageName != null) {
    //  removeBookCover(book.coverImageName)
    //}
    renderNewPage(res, book, true)
  }
})

//show route for our new books
router.get('/:id', async(req, res) => {
  try{
    //Book.findById is going to get us the book but is only going to have an ID for the author it's not going to have name of the author or
    //any of the other author information so in order to get that information we need to use a function populate and in brackets the collection we want to populate
    //so this will populate author variable inside of our Book object with all of the author information which in this case is author name, .exec to make that function execute
    const book = await Book.findById(req.params.id).populate('author').exec()
    res.render('books/show',{ book: book })
  }catch{
    res.redirect('/')
  }
})
//edit book route
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    renderEditPage(res, book)
  } catch {
    res.redirect('/')
  }
})

// update Book Route copied from create book route
router.put('/:id', async (req, res) => {
  let book

  try {
    book = await Book.findById(req.params.id)
    book.title = req.body.title
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    //check to save if our cover exists
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(book, req.body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  } catch {
    //if we had a problem in saving the cover but we sucessfully get the book
    if (book != null) {
      //error is true as we are actually having it
      renderEditPage(res, book, true)
    } else {
      redirect('/')
    }
  }
})

// Delete Book Page
router.delete('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    await book.remove()
    res.redirect('/books')
  } catch {
    //if we do have a book but are not able to remove it than we will render the show page of the book
    if (book != null) {
      res.render('books/show', {
        book: book,
        errorMessage: 'Could not remove book'
      })
    } else {
      res.redirect('/')
    }
  }
})

//as we no longer storing our image on server
//function removeBookCover(fileName) {
//  fs.unlink(path.join(uploadPath, fileName), err => {
//    if (err) console.error(err)
//  })
//}

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({})
    //params is used for dinamically creating an error
    const params = {
      //parameters send to the form as objects to post request receiving in new.ejs in books view
      authors: authors,
      book: book
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Book'
      } else {
        params.errorMessage = 'Error Creating Book'
      }
    }
    res.render(`books/${form}`, params)
  } catch {
    res.redirect('/books')
  }
}

//inside of it we are going to check that our cover is a valid cover and if it is we want to save it in book.cover
function saveCover(book, coverEncoded){
  if(coverEncoded == null) return
  //this convers that into a JSON object
  const cover = JSON.parse(coverEncoded)
  //checking that our image type is equal to imageMimeTypes that we have included above
  //the .type on the object is used to check type and this is in JSON string of file-encoded plugin
  if(cover != null && imageMimeTypes.includes(cover.type)){
    //this will will convert base64 encoded set of data to buffer
    book.coverImage = new Buffer.from(cover.data, 'base64')
    //later we extract out the buffer and convert it back into an image of the correct type
    book.coverImageType = cover.type
  }
}
module.exports = router

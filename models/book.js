const mongoose = require('mongoose')
const path = require('path')

const coverImageBasePath = 'uploads/bookCovers'

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  publishDate: {
    type: Date,
    required: true
  },
  pageCount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  //instead of passing in the image itself into the database we are going to pass the name of the image so we can just store
  //a single small string and then we can store the actual image itself on our server in the file system since we always want
  // to store files in the file system when we can
  coverImageName: {
    type: String,
    required: true
  },
  //we actually want to reference our author from our author's collection that we created over author.js
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Author'
  }
})
//it will allow us to create a virtual property,it will essentially act the same as any of the variable as we have on our book
//but it will actually derive its value from these variables
//when we will call the cover image path than we call the get function
//we are not using an arrow function e.g => here because we have to call the this property
bookSchema.virtual('coverImagePath').get(function() {
  if (this.coverImageName != null) {
    //the '/' is the route of our object which is public floder than we join it with coverImageBasePath which
    //is uploads/bookCovers than we append the this.coverImageName which is fileName which corresponds to book cover for this book
    return path.join('/', coverImageBasePath, this.coverImageName)
  }
})

module.exports = mongoose.model('Book', bookSchema)
module.exports.coverImageBasePath = coverImageBasePath

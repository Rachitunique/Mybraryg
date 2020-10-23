const mongoose = require('mongoose')
//deleted after removing upload folder
//const path = require('path')
//const coverImageBasePath = 'uploads/bookCovers'

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
  //earlier it was coverImageName
  coverImage: {
    //the type would be a buffer of the data representing our entire image
    type: Buffer,
    required: true
  },
  coverImageType:{
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
//bookSchema.virtual('coverImagePath').get(function() {
//  if (this.coverImageName != null) {
    //the '/' is the route of our object which is public floder than we join it with coverImageBasePath which
    //is uploads/bookCovers than we append the this.coverImageName which is fileName which corresponds to book cover for this book
//    return path.join('/', coverImageBasePath, this.coverImageName)
//  }
//})
//after changes
bookSchema.virtual('coverImagePath').get(function() {
  if (this.coverImage != null && this.coverImageType != null) {
    //source of our image object is data object
    //string literal method
    //data object allows as a source for images allows us to take buffer data essentially and use that as a actual source for our image
    //this.coverImageType is the type of data that we stored inside of our database than we have to tell its charset and how is it coverEncoded
    //than we have to put the actual data inside of here as base 64 encoded
    //this returns the our image source from our buffer and type
    return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
  }
})

module.exports = mongoose.model('Book', bookSchema)
//deleted after removing upload folder
//module.exports.coverImageBasePath = coverImageBasePath

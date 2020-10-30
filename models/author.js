const mongoose = require('mongoose')
//"./" means from our current directory means from model directory we are importing book object
const Book = require('./book')
const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})
//if we will not do this we will have tens of books wihout any author
authorSchema.pre('remove', function(next){
  //{author: this.id} means if we have books for this author
  Book.find({author: this.id}, (err, books) => {
    //if we cannot connect to the database than this occurs
    if(err){
      //if err comes we are going to pass that to the next function and it is going to prevent us from removing something
      next(err)
    }else if(books.length > 0){
      //it also prevents the code from removing the particular author
      next(new Error('This author has book still'))
    }else{
      //we pass next with nothing that tells mongoose that it is okay to continue and actually remove the author here
      next()
    }
  })
})
module.exports = mongoose.model('Author', authorSchema)

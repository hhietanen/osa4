const mongoose = require('mongoose')

if ( process.env.NODE_ENV !== 'production' ) {
  require('dotenv').config()
}

// korvaa url oman tietokantasi urlilla. ethän laita salasanaa Githubiin!
const url = process.env.MONGODB_URI

mongoose.connect(url)

//const mongoUrl = 'mongodb://localhost/bloglist'
//mongoose.connect(mongoUrl)


const Schema = mongoose.Schema
const blogSchema = new Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

blogSchema.statics.format = function(person, cb){
  return {
  title: blog.title,
  author: blog.author,
  url: blog.url,
  likes: blog.likes,
  id: blog._id
  }
}


const Blog = mongoose.model('Blog', blogSchema)


module.exports = Blog
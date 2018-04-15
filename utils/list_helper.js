const Blog = require('../models/blog')

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  }
]

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
//Funktio palauttaa blogien yhteenlaskettujen tykkäysten eli likejen määrän.
  return blogs.reduce(function(sum, blog){
  	return sum + blog.likes
  },0)
}

//Tehtävä 4.5.
const favoriteBlog = (blogs) =>{
	const topBlog = blogs.reduce(function(topBlog, blog){
		if (topBlog === {})
			{return blog}
		else if(topBlog.likes > blog.likes) 
			{return topBlog}
		else if(topBlog.likes <= blog.likes) 
			{return blog}
	}, blogs[0])

	return {
		title : topBlog.title ,
		author: topBlog.author,
		likes: topBlog.likes 
	}
}

const format = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes
//    id: blog._id
  }
}

const nonExistingId = async () => {
  const blog = new Blog()
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(format)
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  format,
  nonExistingId,
  blogsInDb,
  initialBlogs
}



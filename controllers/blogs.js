const blogRouter = require('express').Router()
const Blog = require('../models/blog')


blogRouter.get('/', async (request, response) => {
  try{
    const blogs = await Blog.find({})
    response.json(blogs)
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'error in retrieving blogs' })
  }
})

blogRouter.post('/', async (request, response) => {
  try {
    const body = request.body
    if (body.title === undefined){
      return response.status(400).json({error : 'title missing'})
    }

    // if (body.likes === undefined || body.likes === null  ){
    //    body.likes=0
    // }

    const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ? body.likes : 0


    })
  console.log(blog)

  const savedBlog = await blog
    .save()
      response.status(201).json(blog)
    } catch (exception) {
      console.log(exception)
      response.status(500).json({error : 'things went wrong'})
    }
})

module.exports = blogRouter
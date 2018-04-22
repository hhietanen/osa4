const blogRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')


blogRouter.get('/', async (request, response) => {
  try{
    const blogs = await Blog
    .find({})
    .populate('user', {username: 1, name: 1 } )

    response.json(blogs.map(Blog.format))
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'error in retrieving blogs' })
  }
})


blogRouter.put('/:id', async (request, response) => {

  try{
    const oldBlog = await Blog.findById(request.params.id)

    const body = request.body

    const blog = {
    title: body.title ? body.title : oldBlog.title,
    author: body.author ? body.author : oldBlog.author,
    url: body.url ? body.url : oldBlog.url,
    likes: body.likes ? body.likes : oldBlog.likes }

    await Blog.findByIdAndUpdate(request.params.id, blog, {new:true})
    response.json(await Blog.findById(request.params.id))
  } catch (error) {
    console.log(error)
    response.status(400).send({ error: 'problem with ID' })
  }
})

blogRouter.delete('/:id', async (request, response) =>{
  try{
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    console.log(decodedToken)
    const user = await User.findById(decodedToken.id)
    console.log(user.id)

    const targetBlog = await Blog.findById(request.params.id)
    console.log(targetBlog.user)

    if (targetBlog.user.toString() === user.id) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
    }
    
else 
    response.status(400).send({ error: 'You are not allowed to delete the blog' })    

  }catch (exception){
    console.log(exception)
    response.status(400).send({ error: 'error in deleting blog' })    
  }

})


blogRouter.post('/', async (request, response) => {
  const body = request.body

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const users = await User.find( {} )
    const usersArray =  users.map(User.format)
    
    if (body.title === undefined){
      return response.status(400).json({error : 'title missing'})
    }

    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ? body.likes : 0,
    user : user.id
    })

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)

  await user.save()
  response.status(201).json(Blog.format(blog))
  
    } catch (exception) {
     if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
     } else {
      console.log(exception)
      response.status(500).json({error : 'things went wrong...'})
    }
  }
})

module.exports = blogRouter
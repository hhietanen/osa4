const blogRouter = require('express').Router()
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
    await Blog.findByIdAndRemove(request.params.id)

    response.status(204).end()

  }catch (exception){
    console.log(exception)
    response.status(400).send({ error: 'error in deleting blog' })    
  }

})


blogRouter.post('/', async (request, response) => {
  try {
    const body = request.body
    console.log(body.userId)

   const users = await User.find( {} )
   const usersArray = await users.map(User.format)
   console.log(usersArray.length)

    if (body.title === undefined){
      return response.status(400).json({error : 'title missing'})
    }

     if (body.userId === undefined){
      body.userId = usersArray[usersArray.length-1].id
    }

  const user = await User.findById(body.userId)
  console.log(user)
  console.log(body.userId)

    const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ? body.likes : 0,
    user : body.userId
    })

  console.log(blog.user)

  const savedBlog = await blog.save()
  console.log(savedBlog._id)

  
  user.blogs = user.blogs.concat(savedBlog._id)
  console.log(user.blogs)
  await user.save()
  console.log(user)
      response.status(201).json(Blog.format(blog))
    } catch (exception) {
      console.log(exception)
      response.status(500).json({error : 'things went wrong...'})
    }
})

module.exports = blogRouter
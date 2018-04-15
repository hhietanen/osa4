const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { format, initialBlogs, nonExistingId, blogsInDb } = require('../utils/list_helper')


beforeAll(async () => {
  await Blog.remove({})
  const blogObjects = initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})


test('all blogs are returned', async () => {
  const blogsInDatabase = await blogsInDb()

  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body.length).toBe(blogsInDatabase.length)

  const returnedContents = response.body.map(n => n.title)
    blogsInDatabase.forEach(blog => {
      expect(returnedContents).toContain(blog.title)
    })
})


test('the first blog to be about React patterns', async () => {
  const response = await api
    .get('/api/blogs')

  const contents = await response.body.map(r => r.title)
  expect(contents).toContain('React patterns')  
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: "Dingo palaa kotiin",
    author: "Edgar Aller",
    url: "http://www.slahdot.com",
    likes: 6
    }

  const blogsBefore = await blogsInDb()

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

	const blogsAfter = await blogsInDb()
	const contents = blogsAfter.map(r => r.title)

    expect(blogsAfter.length).toBe(blogsBefore.length+1 )
    expect(contents).toContain('Dingo palaa kotiin')
    expect(blogsAfter).toContainEqual(newBlog)
})

test('if there are no likes, likes are set to zero', async () => {
	const zeroBlog =   {
    title: "Kukaan ei tykkää tästä",
    author: "Matti Nykänen",
    url: "http://www.sseika.com",
    likes: ""
  }

  const blogsBefore = await blogsInDb()

  await api
    .post('/api/blogs')
    .send(zeroBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

	const blogsAfter = await blogsInDb()
    const likes = blogsAfter[blogsAfter.length-1].likes

	expect(blogsAfter.length).toBe(blogsBefore.length +1)
	expect(likes).toBe(0)
})



test('if there are no title and url, 400 bad request is returned', async () => {
	const errorBlog =   {
    author: "Matti Mogaaja",
    likes: "99"
  }

  await api
    .post('/api/blogs')
    .send(errorBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

    const response = await api
      .get('/api/blogs')

    const contents = response.body.map(r => r.author)
	expect(contents).not.toContain('Matti Mogaaja')
})

describe('deletion of a blog', async () => {
  let addedBlog

  beforeAll(async () => {
    addedBlog = new Blog({
        author: 'poisto pyynnöllä HTTP DELETE',
        likes: 1,
        url: 'www.deleted',
        title: 'Remove Me'
      })
      await addedBlog.save()
    })

  test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
    const blogsAtStart = await blogsInDb()

    await api
        .delete(`/api/blogs/${addedBlog._id}`)
        .expect(204)

      const blogsAfterOperation = await blogsInDb()

      const contents = blogsAfterOperation.map(r => r.title)

      expect(contents).not.toContain(addedBlog.title)
      expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1)
    })
  })

afterAll(() => {
  server.close()
})
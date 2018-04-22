const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const {initialBlogs, nonExistingId, blogsInDb, usersInDb } = require('../utils/list_helper')
const User = require('../models/user')


//TESTS FOR THE USERS

describe('when there is initially one user at db', async () => {
  beforeAll(async () => {
    await User.remove({})
    const user = new User({ username: 'root', password: 'sekret' })
    await user.save()
  })

  test('POST /api/users succeeds with a fresh username', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'hxhietan',
      name: 'Herkko Hietanen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
	expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
	expect(usersAfterOperation[usersAfterOperation.length-1].adult).toBe(true)
	const usernames = usersAfterOperation.map(u=>u.username)
	expect(usernames).toContain(newUser.username)
  })

  test('POST /api/users fails with too short password', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'nopea',
      name: 'Nopsajalka',
      password: 'sa',
      adult: true
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'Password must be longer than 3 characters'})

    const usersAfterOperation = await usersInDb()
	expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
  })

	test('POST /api/users fails with proper statuscode and message if username already taken', async () => {
	  const usersBeforeOperation = await usersInDb()

	  const newUser = {
	    username: 'root',
	    name: 'Superuser',
	    password: 'salainen'
	  }

	  const result = await api
	    .post('/api/users')
	    .send(newUser)
	    .expect(400)
	    .expect('Content-Type', /application\/json/)

	  expect(result.body).toEqual({ error: 'username must be unique'})

	  const usersAfterOperation = await usersInDb()
	  expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
	})
})

describe('when there are two blogposts in the DB', async () => {
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
 const blogsBefore = await blogsInDb()

  const newBlog = {
    title: "Dingo testeistä",
    author: "Edgar Aller",
    url: "http://www.slahdot.com",
    likes: 1
}

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

console.log(response.body)
	const blogsAfter = await blogsInDb()
	const contents = blogsAfter.map(r => r.title)

    expect(blogsAfter.length).toBe(blogsBefore.length+1 )
    expect(contents).toContain('Dingo testeistä')
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

})





afterAll(() => {
  server.close()
})
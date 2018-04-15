const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
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

beforeAll(async () => {
  await Blog.remove({})
  const blogObjects = initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})


test('all blogs are returned', async () => {
  const response = await api
    .get('/api/blogs')

  expect(response.body.length).toBe(initialBlogs.length)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})


test('the first blog to be about React patterns', async () => {
  const response = await api
    .get('/api/blogs')

  const contents = await response.body.map(r => r.title)
  expect(contents).toContain('React patterns')  
})

test('a valid blog can be added', async () => {
	const newBlog =   {
    title: "Dingo palaa kotiin",
    author: "Edgar Aller",
    url: "http://www.slahdot.com",
    likes: 6
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const response = await api
      .get('/api/blogs')

    const contents = response.body.map(r => r.title)

	expect(response.body.length).toBe(initialBlogs.length +1)
	expect(contents).toContain('Dingo palaa kotiin')
})

test('if there are no likes, likes are set to zero', async () => {
	const zeroBlog =   {
    title: "Kukaan ei tykkää tästä",
    author: "Matti Nykänen",
    url: "http://www.sseika.com",
    likes: ""
  }

  await api
    .post('/api/blogs')
    .send(zeroBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const response = await api
      .get('/api/blogs')

    const contents = response.body.map(r => r.likes)
    const likes = response.body[initialBlogs.length +1].likes

	expect(response.body.length).toBe(initialBlogs.length +2)
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

// Tee testit blogin lisäämiselle, eli osoitteeseen 
// /api/blogs tapahtuvalle HTTP POST -pyynnölle, joka varmistaa, 
// että jos uusi blogi ei sisällä kenttiä title ja url, 
// pyyntöön vastataan statuskoodilla 400 Bad request

// Laajenna toteutusta siten, että testit menevät läpi.


afterAll(() => {
  server.close()
})
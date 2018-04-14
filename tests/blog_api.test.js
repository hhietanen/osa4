const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are thirteen blogs', async () => {
  const response = await api
    .get('/api/blogs')

  expect(response.body.length).toBe(13)
})

test('the first blog to be about HTTP methods', async () => {
  const response = await api
    .get('/api/blogs')
//    console.log(response.body)

  expect(response.body[0].title).toBe('turre.com')
})

afterAll(() => {
  server.close()
})
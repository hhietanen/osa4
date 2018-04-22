const http = require('http')
const express = require('express')
const app = express()
//const bodyParser = require('body-parser')
//const cors = require('cors')
const mongoose = require('mongoose')
const Blog = require('./models/blog')
const notesRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const config = require('./utils/config')
const morgan = require('morgan')

//app.use(cors())
//app.use(bodyParser.json())
app.use(require('cors')())
app.use(require('body-parser').json())

//Morganin apufunktio joka ottaa kopin välitetystä data-bodystä ja tekee siitä stringin
morgan.token('body', function getId (req) {
  let palaute = JSON.stringify(req.body)
  return palaute
})
app.use(morgan(':method :url :body :status :res[content-length] - :response-time ms'))

let middleware= {}

middleware.tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
}
  console.log('Method:',request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('Token:  ', request.token)
  console.log('---')
  next()
}

app.use(middleware.tokenExtractor)
app.use('/api/blogs', notesRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

const server = http.createServer(app)

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})

server.on('close', () => {
  mongoose.connection.close()
})


module.exports = {
  app, server
}
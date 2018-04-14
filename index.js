const http = require('http')
const express = require('express')
const app = express()
//const bodyParser = require('body-parser')
//const cors = require('cors')
const Blog = require('./models/blog')
const notesRouter = require('./controllers/blogs')
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

app.use('/api/blogs', notesRouter)

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
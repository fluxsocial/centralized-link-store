const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const port = 3000

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
    console.log("REQUEST HIT /");
    db.dumpLinks
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
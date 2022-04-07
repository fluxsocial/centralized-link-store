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
    return response.status(200).json({"status": "ok"})
})

app.get('/dump', (request, response) => {
    return db.dumpLinks(request, response)
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
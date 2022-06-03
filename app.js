const express = require('express')

const PORT = 8000
const app = express()

app.use('/api', require('./api'))

app.listen(PORT, () => {
  console.log(`Carris Metropolitana API listening on port ${PORT}`)
})

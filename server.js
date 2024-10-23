const express = require('express')
const app = express()


app.set('view engine', 'ejs')

app.listen(8080, () => {
    console.log('listening on 8080: http://localhost:8080')
})

app.get('/', (request, response) => {
    response.send('welcome to Triee!')
})
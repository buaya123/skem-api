const express = require('express')
const app = express()
const port = 3000
const api = require('./api.js')


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.get('/', (req, res) => {
    res.send("Welcome to the skem-api end-point")
})

app.post('/api/createTarget', api.createTarget)

app.get('/api/getAllTargets', api.getAllTargets)

app.post('/api/getOneTarget', api.getOneTarget)

app.post('/api/updateTarget', api.updateTarget)

app.post('/api/deleteTarget', api.deleteTarget)




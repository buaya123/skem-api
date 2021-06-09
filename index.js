const express = require('express')
const app = express()
const port = 3000
const api = require('./api.js')
var cors = require('cors')

app.use(cors()) // Use this after the variable declaration

app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

// enabling CORS to accept from all origins
app.all('*', (req, res, next) => {
    console.log(`${new Date()} - request for ${req.path}`);
    res.set('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    next();
});

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




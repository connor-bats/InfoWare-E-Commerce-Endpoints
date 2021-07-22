const express = require('express')

const mongoose = require('mongoose')
require('dotenv').config()
const cors = require('cors')
const routeUrls = require('./Routes/Routes')

mongoose.connect(process.env.DATABASE_URL, (err) =>{
    if(err){
        console.log(err)
    }
    else{
        console.log('Database loaded')
    app.emit('ready')
    }
})

const app = express()
app.use(express.json())
app.use(cors())
app.use('/api', routeUrls)


app.on('ready', () =>{
    app.listen(5000, () =>{
        console.log('Server working on port: 5000')
    })
})





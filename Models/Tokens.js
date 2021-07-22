const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
    token:{
        type: String,
        required: true,
        unique: true
    }
})

module.exports = mongoose.model('Tokens', tokenSchema)
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    contact:{
        type: Number,
        required: true,
        unqiue: true
    },
    password:{
        type: String,
        required: true,
    },
    usertype:{
        type: String,
        enum: ['admin','user'],
        required: true,
    },

    joinDate:{
        type: Date,
        default: Date.now
    }

    
})

module.exports = mongoose.model("Users", userSchema)
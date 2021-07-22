const mongoose = require('mongoose')
require('mongoose-double')(mongoose)

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unqiue : true


    },

    price:{
        type: Number,
        required: true,

    },
    quantity : {
        type : Number,
        required: true
    },
    description :{
        type: String, 
        required: true
    }, 
    producer : {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Users'
    }


})
module.exports = mongoose.model('Products', productSchema)
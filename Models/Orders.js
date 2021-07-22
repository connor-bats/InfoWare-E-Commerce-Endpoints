const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    orderDetails:{
        type: String,
        required: true,
    },
    productId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true
    
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required : true

    },
    qty : {
        type : Number,
        required: true
    },
    bill :{
        type : Number,
        required : true
    },
    paymentType:{
        type: String,
        enum :['cod','credit card','debit card', 'store coins'],
        default: 'cod',
        required: true,
    },
    paymentStatus : {
        type : String,
        enum : ['paid', 'unpaid'],
        default: 'unpaid'
    },
    orderTime : {
        type: Date,
        default : Date.now()
    }


})

module.exports = mongoose.model('Orders',orderSchema)
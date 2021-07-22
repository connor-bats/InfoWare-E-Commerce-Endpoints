const express = require('express')
const router = express.Router()
const usermodel = require('../Models/Users')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const tokenmodel = require('../Models/Tokens')
const productmodel = require('../Models/Products')
const ordermodel = require('../Models/Orders')

router.get('/check', (req, res ) =>{
    res.json({working: "fine"})
})


// Register admin and user (unique email, contact and specific roles)
// < --------------------------------- REGISTER MODULE (DONE) ----------------------------------------------> 
router.post('/register', (req, res) => {
    const user = new usermodel({
        name: req.body.name,
        email: req.body.email,
        contact: req.body.contact,
        password: req.body.password,
        usertype: req.body.usertype,
    })

    user.save()
        .then(data =>{
            res.json(data)
        })
        .catch(err =>{
            res.status(402).json({err: err})
        })
})



// <-------------------------------- LOGIN/ LOGOUT ENDPOINTS (DONE) ------------------------------------------> 
//................................... JWT AUTHENTICATION MODULE STARTS HERE......................................




// Function to generate access token using payload and access token secret
function generateAccessToken(user){
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '7200s'})
    return accessToken
}


// Function to generate refresh token using payload and refresh token secret

function generateRefreshToken(user){
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    return refreshToken    
}


// Middleware fuction to authenticate access Token (expired or otherwise)
function authenticateToken(req, res, next){

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    if(token === null){
        return res.status(401).json({err:"No token found"})
    }
    else{
       jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) =>{
           if(err)
            return res.status(403).json({err:"Token invalid"})
            req.user = user
            next()


       }) 
    }


}

function checkAdmin(req, res, next){
    if(req.user.usertype === 'admin'){
        next()
    }
    else{
        return res.status(403).json({err : "Only admins can access this feature"})
    }
}


function checkUser(req, res, next){
    if(req.user.usertype === 'user'){
        next()
    }
    else{
        return res.status(403).json({err : "Only users can access this feature"})
    }
}


// To check successful login using access Token ( to be removed later)
router.get('/loggedin',authenticateToken,(req, res) =>{
    res.json({user: req.user})
})



// To generate new access token using refresh token after it is expired
router.post('/token', (req, res) =>{
    
   
    const refreshToken = req.body.token
    
    
    tokenmodel.findOne({token : refreshToken})
        .then(data => {
            if(data === null){
                res.status(403).json({err:"Refresh Token not available"})
            }


            else{
                jwt.verify(data.token,process.env.REFRESH_TOKEN_SECRET,(err, user) =>{
                    if(err)
                        return res.status(403).json({err: "Token verification error"})
                    else{
                        const x = { email : user.email, contact: user.contact, _id : user._id, name: user.name, usertype:user.usertype}
                        const accessToken = generateAccessToken(x)
                        res.status(200).json({accessToken : accessToken})
                       
                    }

                })



            }
        })
        .catch(err =>{
            res.json({err : 'Database fetch error. Login again'})
        })


})


// To remove refresh token from the database after logging out 
router.post('/logout', (req, res) =>{
    tokenmodel.findOneAndDelete({token : req.body.token})
        .then(data => {
            console.log(data)
            res.status(200).json(data)
        })
        .catch(err => {
            console.log(err)
            res.status(404).json({err:"Error logging out"})
        })
})






// To generate access and refresh token on first login

router.post('/login', (req, res) =>{
    
    // Authenticate login credentials

    usermodel.findOne({email: req.body.email}, (err, user) =>{
        if(err){
            console.log(err)
            res.json({err: "Database error"})
        }

        else{
            if(user.password !== req.body.password){
                res.json({err: "Invalid credentials"})
            }


            else{

                const x = {email : user.email, contact: user.contact, _id:user._id, name:user.name, usertype: user.usertype }
                //Generating refresh and access tokens
                const accessToken = generateAccessToken(x)
                const refreshToken = generateRefreshToken(x)
                //Saving refresh token in Database
                const token = new tokenmodel({
                    token: refreshToken
                })

                token.save()
                    .then(data => {
                        res.json({accessToken : accessToken, refreshToken: refreshToken})
                    })
                    .catch(err =>{
                        res.status(402).json({err: "Cannot save token to database. Try again"})
                    })




                
            }
        }
    })
})


//................................... JWT AUTHENTICATION MODULE ENDS HERE............................................


// < ------------------------------------------- PRODUCT BASED ENDPOINTS ( DONE ) ----------------------------------> 





// To add product to database. Can only be added by admins

router.post('/addproduct',authenticateToken,(req, res) =>{
    if(req.user.usertype === 'admin'){
        
        const product = new productmodel({
            name: req.body.name,
            price : req.body.price,
            quantity : req.body.quantity,
            description: req.body.description,
            producer : req.user._id
        })
        product.save()
            .then(data => {
                console.log(data)
                res.status(200).json({data: data.populate('producer')})
            })
            .catch(err => {
                res.status(403).json({err : 'Error saving to database'})
            })


    }

    else{
        res.status(403).json({err: 'Not allowed to publish products in here'})
    }
} )


// View product and producer details
router.get('/viewproduct/:id',(req, res) =>{
    productmodel.findById(req.params.id)
        .populate('producer')
        .then(data => {
            if(data === null){ 
                res.status(404).json({err:"No such product found"})
            }
            else{
                res.status(200).json(data)
            }
        })
        .catch(err =>{
            res.status(403).json({err: 'Error etching from database'})
        })
})


// Browse different products

router.get('/viewall', (req, res) => {
    productmodel.find()
        .populate('producer')
        .then(data => {
        res.status(200).json({products: data})
        })
        .catch(err =>{
            res.status(404).json({err:"Error fetching from database"})
        })
})

// Topic and price filters to get products
router.post('/filterproduct', (req, res) =>{
    if(req.body.search === undefined){

        const maxprice = req.body.maxprice ? req.body.maxprice : 1000000000
        const minprice = req.body.minprice ? req.body.minprice : 0 
        productmodel.find({price : { $lte : maxprice, $gte: minprice}})
            .populate('producer')
            .then(data => {
                res.status(200).json(data)
            })
            .catch(err =>{
                res.status(404).json({err : "No data found"})
            })
    }


    else{
        const search = req.body.search
        console.log(search)
        const maxprice = req.body.maxprice ? req.body.maxprice : 1000000000
        const minprice = req.body.minprice ? req.body.minprice : 0 
        productmodel.find({$and : [{$or : [{name : { $regex : `${search}`, $options : 'ix'}},{ description : { $regex : `${search}`, $options : 'ix'}}]}, {price : {$lte : maxprice, $gte: minprice}}]})
            .populate('producer')
            .then(data =>{
                res.status(200).json(data)
            })
            .catch(err =>{
                console.log(err)
                res.status(404).json({err: "No data found"})
            })

       

    }
})

// <-------------------------   PRODUCT MANAGEMENT ENDPOINTS END HERE----------------------------->


// <------------------------------ ORDER MANAGEMENT ENDPOINTS START HERE-------------------------->


// To place order (for user)

router.post('/order', authenticateToken, checkUser,(req, res) =>{

    
    const payment = req.body.paymentType ? req.body.paymentType : 'cod'
    productmodel.findById(req.body.productId)
        .then(data =>{

            // Cehcking if sufficient qty is there
            if(data.quantity < req.body.qty){
                console.log('Insufficient quantity')
                res.status(403).json({err:"Out of Stock!"})
            }
            else{

                // Reducing the qty of the product by the number of units purchased
                

                productmodel.findByIdAndUpdate(req.body.productId, {$inc :{"quantity" : -(req.body.qty)}})
                .then(data =>{

                })
                .catch(err =>{
                    res.status(404).json({err :err})
                })

                // Creating the order

                const order = new ordermodel({
                    orderDetails : req.body.orderDetails,
                    productId : req.body.productId,
                    userId: req.user._id,
                    qty: req.body.qty,
                    bill : req.body.bill,
                    paymentType: payment,

                })

                    order.save()
                        .then(data => {
                            res.status(200).json({order : data})
                        })
                        .catch(err =>{
                            console.log(err)
                            res.status(403).json({err:"Cannot save to database, order not confirmed"})
                        })

            }
        })

        .catch(err =>{
            console.log(err)
            res.status(404).json({err:"No such product found"})
        })

    
    

})

// Viewing order 
router.get('/vieworders',authenticateToken,(req, res) =>{
    ordermodel.find({userId : req.user._id}).sort('-orderTime')
        .populate('productId')
        .then(data =>{
            res.status(200).json({order : data})

        })

        .catch(err =>{
            res.status(403).json({err:"Cannot retreive from database"})
        })
})

// viewing all the orders that have been taken (only admins can have access to this)
router.post('/checkorders',authenticateToken, checkAdmin,(req, res) =>{

    productmodel.find({producer : req.user._id}, {_id:1})
        .then(data =>{
            var prodIds = data.map(d => {return d._id})
            //console.log(prodIds)
            
            ordermodel.find({productId: {$in: prodIds}}).sort({orderTime : 'desc'})
                .populate('productId')
                .populate('userId')
                .then(data => {
                    res.status(200).json({orders : data})
                })

                .catch(err =>{
                    console.log(err)
                    res.status(404).json({err : "No previous orders found"})
                })

        })
        .catch(err =>{
            console.log(err)
            res.status(404).json({err : "no product of this producer found"})
        })


})










module.exports = router





# InfoWare-E-Commerce-Endpoints
NodeJS and ExpressJS endpoints on login, product and order management of e-commerce project. Selection task for Infoware



## The endpoints are: 

### User registration and login endpoints : 
--> /register : To register a user/ admin


--> /loggedin : Sample route to check logged in status

--> /token : Route to generate access token from refresh token when the access token deadline is reached

--> /logout : To logout and destroy refresh token from databse(access token should be cleared from session storage in Frontend)

--> /login : To check login credentials and provide with access and refresh tokens


### Product add and management endpoints : 

--> /addproduct : To add a product to database. Can only be done by admins.

--> viewproduct/:id : To view details about a particular product 

--> /viewall : To view details of all products

--> filterproduct : To filter products based the maximum and minimum price and pparticular search terms which is searched from the name and  description of the product (extra feature) 


### Order and and management endpoints :

--> /order : To place get order details from the front end (of a particular product)  and  add it to database. Can be accessed only when the user is logged in. (Extra feature: modifies the current stock and gives proper error response if out of stock) 

--> /vieworders : orders placed by a admin or user can be viewed here.

--> checkorders : Only admins can access this. Used to view all the orders placed on the product that admin sells.

import express from 'express' ;
import mongoose from 'mongoose';
import 'dotenv/config'
import bcrypt from "bcrypt"; 
import User from "./Schema/User.js"; 

const app = express(); 
let PORT = 3000 ; 

app.use(express.json()); 

mongoose.connect(process.env.MONGODB_URI , {
    autoIndex : true
})

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

app.post("/signup" , (req , res) =>{
    const {fullName , email , password } = req.body ; 
    if(fullName.length < 3){
        return res.status(403).json({error : "full name must be 3 letters long"})
    }
    if(!email.length){
        return res.status(403).json({error : "Enter Email"})
    }
    if(!emailRegex.test(email)){
        return res.status(403).json({error : "Invalid Email"})
    }
    if(!passwordRegex.test(password)){
        return res.status(403).json({error : "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"})
    }
    bcrypt.hash(password , 10 , (err , hashedPassword) => {
        let username = email.split("@")[0];
        let user = new User({
            personal_info : {fullName , email , password : hashedPassword, username}
        }); 
        user.save()
        .then((u) => {
            return res.status(200).json({user : u})
        })
        .catch(err => {
            return res.status(500).json({err : err.message})
        })
        console.log(hashedPassword);  
    })
})

app.listen(PORT , () => {
    console.log("listening to port : " + PORT);
})
import express from 'express' ;
import mongoose from 'mongoose';
import 'dotenv/config'
import bcrypt from "bcrypt"; 
import User from "./Schema/User.js"; 
import { nanoid } from 'nanoid';
import jwt from "jsonwebtoken"
import cors from "cors"; 

const app = express(); 
let PORT = 3000 ; 

app.use(express.json()); 
app.use(cors()); 

mongoose.connect(process.env.MONGODB_URI , {
    autoIndex : true
})

mongoose.connection.once('open', async () => {
  try {
    await mongoose.connection.db.collection('users').createIndex({ "personal_info.email": 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ "personal_info.username": 1 }, { unique: true });
    console.log("Indexes ensured.");
  } 
  catch (err) {
    console.error("Index creation failed:", err.message);
  }
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const formatDataToSend = (user) =>{
    const access_token = jwt.sign({ id : user._id} , process.env.SECRET_KEY)
    return {
        access_token ,
        profile_img : user.personal_info.profile_img , 
        username : user.personal_info.username,
        fullName : user.personal_info.fullName
    }
}

const generateUsername = async(email) =>{
    let username = email.split("@")[0]; 
    let usernameExists = await User.exists({"personal_info.username" : username})
    .then((result) => result)

    usernameExists ? username += nanoid().substring(0 , 5) : ""; 
    return username ; 
}

app.post("/signup", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (fullName.length < 3) {
            return res.status(403).json({ error: "Full name must be at least 3 characters long" });
        }
        if (!email || !emailRegex.test(email)) {
            return res.status(403).json({ error: "Invalid Email" });
        }
        if (!passwordRegex.test(password)) {
            return res.status(403).json({ error: "Password must be 6–20 characters with 1 uppercase, 1 lowercase, and a number" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const username = await generateUsername(email);

        const user = new User({
        personal_info: {
            fullName,
            email,
            password: hashedPassword,
            username
        }
        });

        const savedUser = await user.save();
        return res.status(200).json({ user: formatDataToSend(savedUser) });

    } catch (err) {
        if (err.code === 11000) {
        return res.status(409).json({ error: "Email or username already exists" });
        }
        return res.status(500).json({ error: err.message });
    }
});

app.post("/signin" , (req, res) =>{
    const {email , password} = req.body ; 
    User.findOne({"personal_info.email" : email})
    .then((user) => {
        if(!user){
            return res.status(403).json({error : "email not found"})
        }
        bcrypt.compare(password , user.personal_info.password, (err, result) =>{
            if(err){
                return res.status(403).json("Error occured while login. Please Try Again later")
            }
            if(!result){
                return res.status(403).json({error : "Incorrect password"}); 
            }
            else{
                return res.status(200).json(formatDataToSend(user)) ; 
            }
        })
        console.log(user);
    })
    .catch(error => {
        console.log(error);
        return res.status(403).json({error : error.message})
    })
})

app.listen(PORT , () => {
    console.log("listening to port : " + PORT);
})
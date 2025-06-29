import express from 'express' ;
import mongoose from 'mongoose';
import 'dotenv/config'
import bcrypt from "bcrypt"; 
import User from "./Schema/User.js"; 
import { nanoid } from 'nanoid';

const app = express(); 
let PORT = 3000 ; 

app.use(express.json()); 

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
        return res.status(200).json({ user: savedUser });

    } catch (err) {
        if (err.code === 11000) {
        return res.status(409).json({ error: "Email or username already exists" });
        }
        return res.status(500).json({ error: err.message });
    }
});

app.listen(PORT , () => {
    console.log("listening to port : " + PORT);
})
import express, { json } from 'express' ;
import mongoose from 'mongoose';
import 'dotenv/config'
import bcrypt from "bcrypt"; 
import User from "./Schema/User.js"; 
import { nanoid } from 'nanoid';
import jwt from "jsonwebtoken"
import cors from "cors"; 
import admin from "firebase-admin" ; 
import {getAuth} from "firebase-admin/auth"
import Notification from './Schema/Notification.js';
import Comment from './Schema/Comment.js';

// import serviceAccountKey from "./blog-platform-4f473-firebase-adminsdk-fbsvc-1fce8f594e.json" assert {type : json}
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccountKey = require("./blog-platform-4f473-firebase-adminsdk-fbsvc-1fce8f594e.json");
import aws from "aws-sdk" ; 
import Blog from './Schema/Blog.js';

const app = express(); 
let PORT = 3000 ; 

admin.initializeApp({
    credential : admin.credential.cert(serviceAccountKey)
}); 

app.use(express.json()); 
app.use(cors()); 

mongoose.connect(process.env.MONGODB_URI , {
    autoIndex : true
})

// setting up the s3 bucket 
const s3 = new aws.S3({
    region : 'us-east-1',
    accessKeyId : process.env.AWS_ACCESS_KEY, 
    secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY,
})

const generateUploadUrl = async (ContentType = "image/jpeg") =>{
    const date = new Date(); 
    const imageName = `${nanoid()}-${date}.jpeg`; 
    return await s3.getSignedUrlPromise('putObject' , {
        Bucket : 'blog-app-792172459205' , 
        Key : imageName , 
        Expires : 1000, 
        ContentType : ContentType,
    }) 
}

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

const verifyJWT = (req , res , next) => {
    const authHeader = req.headers['authorization']; // Authorization: Bearer <JWT_TOKEN>
    const token = authHeader && authHeader.split(" ")[1]; // authHeader.split(" ") returns ["Bearer", "<token>"] , [1] picks the token part.

    if(token == null){
        return res.status(401).json({error : "No access token"}); 
    }

    jwt.verify(token , process.env.SECRET_KEY , (err , user) => {
        if(err){
            return res.status(403).json({error : "Access token is invalid"}); 
        }
        req.user = user.id ; // If verification succeeds, the user's ID is attached to the request object (req.user) for use in the next handler
        next(); // Passes control to the next middleware or route handler (/create-blog in your case).
    })
}

app.get("/get-upload-url" , (req , res) => {
    const type = req.query.type || "image/jpeg" ; 
    generateUploadUrl(type)
    .then(url => res.status(200).json({uploadURL : url}))
    .catch(error => {
        console.log(error.message);
        return res.status(500).json({error : error.message}); 
    })
})

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
            return res.status(403).json({ error: "Password must be 6-20 characters with 1 uppercase, 1 lowercase, and a number" });
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

app.post("/google-auth" , async(req, res)=>{
    let {access_token} = req.body ; 

    getAuth().verifyIdToken(access_token)

    .then(async (decodedUser) => {
        let {email , name , picture} = decodedUser;
        // small resolution to high resolution 
        picture = picture.replace("s96-c" , "s384-c");
        let user = await User.findOne({"personal_info.email" : email}).select("personal_info.fullName personal_info.username personal_info.profile_img google_auth")
        .then((u) => {
            return u || null; 
        })
        .catch((error) => {
            return res.status(500).json({"error" : error.message})
        })
        if(user){
            if(!user.google_auth){
                return res.status(403).json({"error" : "This email was signed up without google. Please log in with password to access the account "})
            }
        }
        else{
            let username = await generateUsername(email); 
            user = new User({
                personal_info : {fullName : name , email , username},
                google_auth : true
            })
            await user.save()
            .then((u) =>{
                user = u ; 
            })
            .catch((error) =>{
                return res.status(500).json({"error" : error.message})
            })
        }
        return res.status(200).json(formatDataToSend(user));
    })
    .catch((err) =>{
        return res.status(500).json({"error" : "Authentication failed using google"})
    })
})

app.post("/change-password" , verifyJWT, (req, res) => {
    let {currentPassword , newPassword} = req.body ; 
    if(!currentPassword.length || !newPassword.length){
        return res.status(403).json({error : "All fields are required"}); 
    }
    if(!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)){
        return res.status(403).json({error : "Invalid Password"}); 
    }
    User.findOne({_id : req.user})
    .then((user) => {
        if(user.google_auth){
            return res.status(403).json({error : "You cannot change password using google auth"}); 
        }
        bcrypt.compare(currentPassword , user.personal_info.password, (err, result) => {
            if(err){
                return res.status(500).json({error : err.message})
            }
            if(!result){
                return res.status(403).json({error : "Incorrect password"}); 
            }
            bcrypt.hash(newPassword, 10 , (err , hashed_password) => {
                User.findOneAndUpdate({_id : req.user} , {"personal_info.password" : hashed_password})
                .then((u) => {
                    return res.status(200).json("Password changed successfully");
                })
                .catch((error) => {
                    return res.status(500).json({error : error.message})
                })
            })
        })
    })
    .catch((error) => {
        return res.status(500).json({error : error.message})
    })
})

app.post("/create-blog" , verifyJWT , (req, res) => {
    // console.log(req.body);
    // res.json(req.body); 

    let authorId = req.user; 
    let {title , des , banner , tags , content , draft , id} = req.body ; 
    
    if(!title.length){
        return res.status(403).json({error : "You must provide a title"}); 
    }

    if(!draft){
        if(!des.length || des.length > 200){
            return res.status(403).json({error : "You must provide the blog description under 200 characters"}); 
        }
        if(!banner.length){
            return res.status(403).json({error : "You must provide the banner to publish it"}); 
        }
        if(!content.blocks.length){
            return res.status(403).json({error : "There must be some blog content to publish it"});
        }
        if(!tags.length || tags.length > 10){
            return res.status(403).json({error : "Provide tags in order to publish the blog, Maximum 10"});
        }
    }
    tags = tags.map((tag) => {
        return tag.toLowerCase();
    })
    // replace the special characters with spaces and replace the spaces with hyphen 
    let blog_id = id || title.replace(/[^a-zA-Z0-9]/g , ' ').replace(/\s+/g , "-").trim() + nanoid(); 
    console.log(blog_id);

    if(id){
        Blog.findOneAndUpdate({blog_id} , {title , des , banner , tags , content , draft : Boolean(draft) ? draft : false})
        .then((blog) => {
            return res.status(200).json({id : blog_id})
        })
        .catch((err) => {
            return res.status(500).json({error : err.message}); 
        })
    }
    else{
        let blog = new Blog({
            title , des , banner , content , tags ,
            author : authorId , 
            blog_id , 
            draft : Boolean(draft)
        })
        blog.save()
        .then((blog) => {
            let incrementVal = draft ? 0 : 1 ; 
            User.findOneAndUpdate(
                { _id : authorId} , 
                { $inc : {"account_info.total_posts" : incrementVal} , 
                $push : {"blogs" : blog._id}}
            )
            .then((user) => {
                return res.status(200).json({id : blog.blog_id})
            })
            .catch((err) => {
                res.status(500).json({error : "Failed to update the total posts number"});
            })
        })
        .catch((err) => {
            return res.status(500).json({error : err.message}); 
        })
    }

})

app.post("/latest-blogs" , (req, res) => {
    let {page} = req.body ; 
    let maxLimit = 5 ; 
    Blog.find({draft : false})
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullName -_id")
    .sort({ "publishedAt" : -1})
    .select("blog_id title des tags banner activity publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then(blogs => {
        return res.status(200).json({blogs}); 
    })
    .catch((err) => {
        return res.status(500).json({error : err.message}); 
    })
})

app.get("/trending-blogs" , (req, res) => {
    Blog.find({draft : false})
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullName -_id")
    .sort({ "activity.total_read" : -1 , "activity.total_likes" : -1 , "publishedAt" : -1})
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then((blogs) => {
        return res.status(200).json({blogs})
    })
    .catch((err) => {
        return res.status(500).json({error : err.message})
    })
})

app.post("/search-blogs" , (req, res) => {
    let {tag , query , author , page , limit , eliminate_blog} = req.body ; 
    let findQuery ; 
    if(tag){
        findQuery = {tags : {$in : [tag]} , draft : false , blog_id : {$ne : eliminate_blog}}; 
    }
    else if(query){
        findQuery = {draft : false , title : new RegExp(query , 'i')}
    }
    else if(author){
        findQuery = {author , draft : false}; 
    }
    let maxLimit = limit ? limit :  2 ; 

    Blog.find(findQuery)
    .populate("author" , "personal_info.profile_img personal_info.username personal_info.fullName -_id")
    .select("blog_id title des banner tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then(blogs => {
        return res.status(200).json({blogs}) ; 
    })
    .catch(err => {
        return res.status(500).json({err : err.message}); 
    })
})

app.post("/all-latest-blogs-count" , (req, res) => {
    Blog.countDocuments({ draft : false})
    .then(count => {
        return res.status(200).json({totalDocs : count})
    })
    .catch(err => {
        console.log(err); 
        return res.status(500).json({message : err.message}); 
    })
})

app.post("/search-blogs-count" , (req, res) => {
    let {tag, author ,query} = req.body ; 
    let findQuery ; 

    if(tag){
        findQuery = {tags : tag , draft : false}; 
    }
    else if(query){
        findQuery = {draft : false , title : new RegExp(query , 'i')}
    }
    else if(author){
        findQuery = {author , draft : false} ; 
    }

    Blog.countDocuments(findQuery)
    .then((count) => {
        return res.status(200).json({totalDocs : count})
    }) 
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({error : err.message}); 
    })
})

app.post("/search-users" , (req, res) => {
    let {query} = req.body ; 
    User.find({"personal_info.username" : new RegExp(query , 'i')})
    .limit(50)
    .select("personal_info.fullName personal_info.profile_img personal_info.username -_id")
    .then(users => {
        return res.status(200).json({users}); 
    })
    .catch((err) => {
        return res.status(500).json({error : err.message}); 
    })
})

app.post("/get-profile" , (req, res) => {
    console.log(req.body);
    let {username} = req.body ; 
    
    User.findOne({ "personal_info.username" : username})
    .select("-personal_info.password -google_auth -updateAt -blogs")
    .then((user) => {
        return res.status(200).json(user); 
    })
    .catch((err) => {
        return res.status(500).json({err : err.message}); 
    })
})

app.post("/get-blog" , (req , res) => {
    let {blog_id , draft , mode} = req.body ; 
    let incrementVal = mode != "edit" ?  1 : 0 ; 

    Blog.findOneAndUpdate({ blog_id} , {$inc : {"activity.total_reads" : incrementVal}})
    .populate("author" , "personal_info.fullName personal_info.username personal_info.profile_img")
    .select("title des content banner activity publishedAt blog_id tags")
    .then((blog) => {
        User.findOneAndUpdate({"personal_info.username" : blog.author.personal_info.username } , {
            $inc : { "account_info.total_reads" : incrementVal}
        })
        .catch((err) => {
            return res.status(500).json({error : err.message}); 
        })
        if(blog.draft && !draft){
            return res.status(500).json({error : "This blog is a draft and cannot be accessed"});
        }
        return res.status(200).json({blog});
    })
    .catch((err) => {
        return res.status(500).json({error : err.message}); 
    })
})

app.post("/like-blog", verifyJWT, async (req, res) => {

    try {

        const user_id = req.user;
        const { _id, isLikedByUser } = req.body;

        if (!_id) {
            return res.status(400).json({
                error: "Blog ID is required"
            });
        }

        const blog = await Blog.findById(_id);

        if (!blog) {
            return res.status(404).json({
                error: "Blog not found"
            });
        }


        // USER ALREADY LIKED → UNLIKE
        if (isLikedByUser) {

            await Blog.findByIdAndUpdate(
                _id,
                {
                    $inc: {
                        "activity.total_likes": -1
                    }
                }
            );

            await Notification.deleteOne({
                user: user_id,
                type: "like",
                blog: _id
            });

            return res.status(200).json({
                liked_by_user: false
            });
        }


        // USER HAS NOT LIKED → LIKE
        await Blog.findByIdAndUpdate(
            _id,
            {
                $inc: {
                    "activity.total_likes": 1
                }
            }
        );


        const existingLike = await Notification.findOne({
            user: user_id,
            type: "like",
            blog: _id
        });

        if (!existingLike) {

            await Notification.create({
                type: "like",
                blog: _id,
                notification_for: blog.author,
                user: user_id
            });

        }

        return res.status(200).json({
            liked_by_user: true
        });

    } catch (err) {

        console.log("LIKE ERROR:", err);

        return res.status(500).json({
            error: err.message
        });

    }
});

app.post("/isliked-by-user" , verifyJWT , (req, res) => {
    let user_id = req.user; 
    let {_id} = req.body ;

    Notification.exists({ user : user_id , type : "like" , blog : _id})
    .then(result => {
        return res.status(200).json({result})
    })
    .catch(err => {
        return res.status(500).json({error : err.message})
    })
})


app.post("/add-comment", verifyJWT, async (req, res) => {

    try {

        const user_id = req.user;


        const {
            _id,
            comment,
            replying_to,
            blog_author
        } = req.body;


        if (!_id) {

            return res.status(400).json({

                error:
                    "Blog ID is required"

            });

        }


        if (!comment || !comment.trim()) {

            return res.status(403).json({

                error:
                    "You must provide a comment"

            });

        }


        /*
            Create comment/reply
        */

        const commentObj = new Comment({

            blog_id: _id,

            blog_author,

            comment:
                comment.trim(),

            commented_by:
                user_id,

            isReply:
                Boolean(replying_to),

            parent:
                replying_to || null

        });


        const commentFile =
            await commentObj.save();


        /*
            Add comment to blog
        */

        const blog =
            await Blog.findOneAndUpdate(

                { _id },

                {

                    $push: {

                        comments:
                            commentFile._id

                    },

                    $inc: {

                        "activity.total_comments":
                            1,

                        "activity.total_parent_comments":
                            replying_to
                                ? 0
                                : 1

                    }

                },

                {
                    new: true
                }

            );


        if (!blog) {

            return res.status(404).json({

                error:
                    "Blog not found"

            });

        }


        /*
            If this is a reply,
            add it to parent's children.
        */

        if (replying_to) {

            await Comment.findByIdAndUpdate(

                replying_to,

                {

                    $push: {

                        children:
                            commentFile._id

                    }

                }

            );

        }


        /*
            Notification
        */

        const notification =
            new Notification({

                type:
                    replying_to
                        ? "reply"
                        : "comment",

                blog:
                    _id,

                notification_for:
                    blog.author,

                user:
                    user_id,

                comment:
                    commentFile._id

            });


        if (replying_to) {

            notification.replied_on_comment =
                replying_to;


            const parentComment =
                await Comment
                    .findById(
                        replying_to
                    )
                    .select(
                        "commented_by"
                    );


            if (parentComment) {

                notification.notification_for =
                    parentComment.commented_by;

            }

        }


        await notification.save();


        /*
            Populate user information
        */

        const populatedComment =
            await Comment
                .findById(
                    commentFile._id
                )
                .populate(

                    "commented_by",

                    "personal_info.fullName personal_info.username personal_info.profile_img"

                );


        /*
            Count replies
        */

        const replyCount =
            await Comment.countDocuments({

                parent:
                    commentFile._id,

                isReply: true

            });


        return res.status(200).json({

            comment:
                populatedComment.comment,

            commentedAt:
                populatedComment.commentedAt,

            _id:
                populatedComment._id,

            commented_by:
                populatedComment.commented_by,

            children:
                populatedComment.children ||
                [],

            isReply:
                populatedComment.isReply,

            parent:
                populatedComment.parent,

            replyCount

        });


    } catch (err) {

        console.error(
            "ADD COMMENT ERROR:",
            err
        );


        return res.status(500).json({

            error:
                err.message

        });

    }

});

app.post("/get-comment-replies", async (req, res) => {

    try {

        const {
            comment_id,
            skip = 0
        } = req.body;


        if (!comment_id) {

            return res.status(400).json({

                error:
                    "Comment ID is required"

            });

        }


        const max_limit = 5;


        const totalReplies =
            await Comment.countDocuments({

                parent: comment_id,

                isReply: true

            });


        const replies =
            await Comment
                .find({

                    parent: comment_id,

                    isReply: true

                })
                .populate(

                    "commented_by",

                    "personal_info.fullName personal_info.username personal_info.profile_img"

                )
                .skip(Number(skip))
                .limit(max_limit)
                .sort({

                    commentedAt: 1

                });


        /*
            Get reply counts for loaded
            replies as well.
        */

        const repliesWithCount =
            await Promise.all(

                replies.map(
                    async (reply) => {

                        const replyCount =
                            await Comment.countDocuments({

                                parent:
                                    reply._id,

                                isReply: true

                            });


                        return {

                            ...reply.toObject(),

                            replyCount

                        };

                    }
                )

            );


        const newSkip =
            Number(skip) +
            repliesWithCount.length;


        return res.status(200).json({

            replies:
                repliesWithCount,

            totalReplies,

            hasMoreReplies:
                newSkip < totalReplies

        });


    } catch (err) {

        console.error(
            "GET COMMENT REPLIES ERROR:",
            err
        );


        return res.status(500).json({

            error:
                err.message

        });

    }

});

app.post("/get-blog-comments", async (req, res) => {

    try {

        const {
            blog_id,
            skip = 0
        } = req.body;

        const max_limit = 5;


        const comments =
            await Comment
                .find({
                    blog_id,
                    isReply: false
                })
                .populate(
                    "commented_by",
                    "personal_info.fullName personal_info.username personal_info.profile_img"
                )
                .skip(Number(skip))
                .limit(max_limit)
                .sort({
                    commentedAt: -1
                });


        /*
            Get reply count for
            every parent comment.
        */

        const commentsWithReplyCount =
            await Promise.all(

                comments.map(
                    async (comment) => {

                        const replyCount =
                            await Comment.countDocuments({
                                parent:
                                    comment._id,
                                isReply: true
                            });


                        return {

                            ...comment.toObject(),

                            replyCount

                        };

                    }
                )

            );


        return res.status(200).json({

            comments:
                commentsWithReplyCount

        });


    } catch (err) {

        console.error(
            "GET BLOG COMMENTS ERROR:",
            err
        );


        return res.status(500).json({

            error:
                err.message

        });

    }

});

app.listen(PORT , () => {
    console.log("listening to port : " + PORT);
})
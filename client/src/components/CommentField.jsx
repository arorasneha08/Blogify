// import { useState , useContext} from "react";
// import toast , {Toaster} from "react-hot-toast";
// import { UserContext } from "../App";
// import { BlogContext } from "../pages/BlogPage";
// import axios from "axios";

// const CommentField = ({action}) =>{
//     let {blog , blog : {_id , author : {_id : blog_author}, comments , activity , activity : {total_comments , total_parent_comments}}, setBlog , setTotalParentCommentsLoaded} = useContext(BlogContext); 
//     let {userAuth : {access_token , username , fullName , profile_img}} = useContext(UserContext);

//     const [comment , setComment] = useState('');

//     const handleComment = () => {
//         if(!access_token){
//             return toast.error("Please login to comment");
//         } 
//         if(!comment.length){
//             return toast.error("Write something to leave a comment");
//         }

//         axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment" , {_id , blog_author , comment } , {headers : {Authorization : `Bearer ${access_token}`}})
//         .then(({data}) => {
//             console.log(data);
//             setComment(""); 

//             data.commented_by = {
//                 personal_info : {
//                     username , profile_img , fullName
//                 }
//             } ;

//             let newCommentArr ;
//             data.childrenLevel = 0 ;
//             newCommentArr = [data ]; 
//             let parentCommentIncrementVal = 1 ;
//             setBlog({
//                 ...blog , 
//                 comments : {
//                     ...comments , 
//                     results : newCommentArr, 
//                 },
//                 activity : {
//                     ...activity, 
//                     total_comments : total_comments + 1, 
//                     total_parent_comments : total_parent_comments + parentCommentIncrementVal
//                 }
//             });
//             setTotalParentCommentsLoaded(prevVal => prevVal + parentCommentIncrementVal);

//         })
//         .catch((err) => {
//             console.log(err);
//         })
//     }

//     return (
//         <>
//         <Toaster position="top-center" reverseOrder={false} toastOptions={{duration : 2000}}/>
//         <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Leave a comment ..." className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"></textarea>
//         <button className="btn-dark mt-5 px-10" onClick={handleComment}>{action}</button>
//         </>
//     )
// }

// export default CommentField ;


import { useState, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import { BlogContext } from "../pages/BlogPage";
import axios from "axios";

const CommentField = ({ action }) => {

    const {
        blog,
        setBlog,
        setTotalParentCommentsLoaded
    } = useContext(BlogContext);

    const {
        _id,
        author = {},
        comments = { results : [] },
        activity = {}
    } = blog;

    const blog_author = author?._id;

    const {
        total_comments = 0,
        total_parent_comments = 0
    } = activity;

    const {
        userAuth: {
            access_token,
            username,
            fullName,
            profile_img
        }
    } = useContext(UserContext);

    const [comment, setComment] = useState("");

    const handleComment = async () => {

        if (!access_token) {
            toast.error("Please login to comment");
            return;
        }

        if (!comment.trim()) {
            toast.error("Write something to leave a comment");
            return;
        }

        try {

            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
                {
                    _id,
                    blog_author,
                    comment: comment.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                }
            );

            console.log("COMMENT RESPONSE:", data);

            const newComment = {
                ...data,
                commented_by: {
                    personal_info: {
                        username,
                        profile_img,
                        fullName
                    }
                },
                childrenLevel: 0
            };

            setComment("");

            setBlog(prev => ({
                ...prev,

                comments: {
                    ...(prev.comments || {}),
                    results: [
                        newComment,
                        ...(prev.comments?.results || [])
                    ]
                },

                activity: {
                    ...(prev.activity || {}),
                    total_comments:
                        (prev.activity?.total_comments || 0) + 1,

                    total_parent_comments:
                        (prev.activity?.total_parent_comments || 0) + 1
                }
            }));

            setTotalParentCommentsLoaded(
                prev => prev + 1
            );

            toast.success("Comment added");

        } catch (err) {

            console.error(
                "COMMENT ERROR:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.error ||
                "Failed to add comment"
            );
        }
    };

    return (
        <>
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{ duration: 2000 }}
            />

            <textarea
                value={comment}
                onChange={(e) =>
                    setComment(e.target.value)
                }
                placeholder="Leave a comment ..."
                className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
            />

            <button
                className="btn-dark mt-5 px-10"
                onClick={handleComment}
            >
                {action}
            </button>
        </>
    );
};

export default CommentField;
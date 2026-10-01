import { useContext } from "react";
import { useState } from "react";
import toast , { Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCommentField = ({_id , blog_author, index , replyingTo = undefined , setIsReplying, notification_id , notificationData}) => {

    let [comment , setComment] = useState("");

    let {userAuth : {access_token}} = useContext(UserContext); 

    let {notifications, notifications : {results} , setNotifications} = notificationData; 

    const handleComment = () => {
        if(!comment.length){
            return toast.error("Write something to reply");
        }
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment" , {
            _id , blog_author, comment , replying_to : replyingTo , notification_id
        }, {
            headers : {
                "Authorization" : `Bearer ${access_token}`
            }
        })
        .then(({data}) => {
            console.log(data); 
            setIsReplying(false); 
            results[index].reply = {comment , _id : data._id }; 
            setNotifications({...notifications , results});
        })
        .catch(err => {
            console.log(err); 
        })
    }
    return (
        <>
        <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 2000}} />

        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Leave a comment..."className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"/>
        <button className="btn-dark mt-5 px-10"onClick={handleComment}>Reply</button>


        </>
    )
}

export default NotificationCommentField; 
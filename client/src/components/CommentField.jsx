import {
    useState,
    useContext
} from "react";

import toast, {
    Toaster
} from "react-hot-toast";

import {
    UserContext
} from "../App";

import {
    BlogContext
} from "../pages/BlogPage";

import axios from "axios";


const CommentField = ({
    action,
    index = undefined,
    replyingTo = undefined,
    setIsReplying,
    onReplyAdded
}) => {


    const {
        blog,
        setBlog,
        setTotalParentCommentsLoaded
    } = useContext(BlogContext);


    const {
        _id,
        author = {},
        comments = {
            results: []
        }
    } = blog;


    const commentsArr =
        comments.results || [];


    const blog_author =
        author?._id;


    const {
        userAuth: {
            access_token,
            username,
            fullName,
            profile_img
        }
    } = useContext(UserContext);


    const [
        comment,
        setComment
    ] = useState("");


    const handleComment = async () => {


        if (!access_token) {

            toast.error(
                "Please login to comment"
            );

            return;
        }


        if (!comment.trim()) {

            toast.error(
                "Write something to leave a comment"
            );

            return;
        }


        try {

            const { data } =
                await axios.post(

                    import.meta.env
                        .VITE_SERVER_DOMAIN +
                        "/add-comment",

                    {
                        _id,

                        blog_author,

                        comment:
                            comment.trim(),

                        replying_to:
                            replyingTo || null
                    },

                    {
                        headers: {
                            Authorization:
                                `Bearer ${access_token}`
                        }
                    }
                );


            console.log(
                "COMMENT RESPONSE:",
                data
            );


            const newComment = {

                ...data,

                commented_by: {

                    personal_info: {

                        username,

                        profile_img,

                        fullName

                    }

                },

                childrenLevel:
                    replyingTo
                        ? 1
                        : 0,

                children:
                    data.children || [],

                replyCount:
                    data.replyCount || 0

            };


            setComment("");


            /*
                REPLY
            */

            if (replyingTo) {


                /*
                    Let CommentCard
                    handle the reply.
                */

                if (onReplyAdded) {

                    onReplyAdded(
                        newComment
                    );

                }


                /*
                    Only update total
                    comment count.
                */

                setBlog(prev => ({

                    ...prev,

                    activity: {

                        ...(prev.activity || {}),

                        total_comments:
                            (
                                prev.activity
                                    ?.total_comments ||
                                0
                            ) + 1

                    }

                }));


                if (setIsReplying) {

                    setIsReplying(false);

                }


                toast.success(
                    "Reply added"
                );


                return;
            }


            /*
                TOP LEVEL COMMENT
            */

            setBlog(prev => ({

                ...prev,

                comments: {

                    ...(prev.comments || {}),

                    results: [

                        newComment,

                        ...(prev.comments
                            ?.results || [])

                    ]

                },

                activity: {

                    ...(prev.activity || {}),

                    total_comments:
                        (
                            prev.activity
                                ?.total_comments ||
                            0
                        ) + 1,

                    total_parent_comments:
                        (
                            prev.activity
                                ?.total_parent_comments ||
                            0
                        ) + 1

                }

            }));


            setTotalParentCommentsLoaded(
                prev => prev + 1
            );


            toast.success(
                "Comment added"
            );


        } catch (err) {

            console.error(
                "COMMENT ERROR:",
                err.response?.data ||
                err.message
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
                toastOptions={{
                    duration: 2000
                }}
            />


            <textarea

                value={comment}

                onChange={(e) =>
                    setComment(
                        e.target.value
                    )
                }

                placeholder={
                    replyingTo
                        ? "Write a reply..."
                        : "Leave a comment..."
                }

                className="
                    input-box
                    pl-5
                    placeholder:text-dark-grey
                    resize-none
                    h-[150px]
                    overflow-auto
                "

            />


            <button

                className="
                    btn-dark
                    mt-5
                    px-10
                "

                onClick={handleComment}

            >

                {action}

            </button>

        </>

    );

};


export default CommentField;
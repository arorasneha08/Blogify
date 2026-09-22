// import { useContext } from "react";
// import { BlogContext } from "../pages/BlogPage";
// import { RxCross1 } from "react-icons/rx";
// import CommentField from "./CommentField";

// const CommentsContainer =() => {

//     let {blog : {title} , commentsWrapper, setCommentsWrapper} = useContext(BlogContext);

//     return (
//         <div className={`max-sm:w-full fixed ${commentsWrapper ? 'top-0 sm:right-0' : 'top-[100%] sm:right-[-100%]'} duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden`}>
//           <div className="relative">
//             <h1 className="text-xl font-medium">Comments</h1>
//             <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">{title}</p>
//             <button onClick={() => setCommentsWrapper(prevVal => !prevVal)} className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey">
//                 <RxCross1 className="text-2xl mt-1"/>
//             </button>
//           </div>

//           <hr className="border-grey my-8 w-[120%] -ml-10"/>

//           <CommentField action="comment"/>
//         </div>
//     )
// }

// export const fetchComments = async({skip = 0 , blog_id , setParentCommentCountFun, comment_array = null})=> {
//     let res ; 

//     await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog-comments" , {blog_id , skip} )
//     .then(({data : {comments}}) => {
//         comments.map(comment => {
//             comment.childrenLevel = 0 ;
//         })
//         setParentCommentCountFun(prevVal => prevVal + comments.length);

//         if(comment_array == null){
//             res = comments
//         }
//         else{
//             res = {results : [...comment_array , ...comments]}
//         }
//     })

//     return res; 
// }

// export default CommentsContainer ; 

import { useContext } from "react";
import axios from "axios";
import { BlogContext } from "../pages/BlogPage";
import { RxCross1 } from "react-icons/rx";
import CommentField from "./CommentField";
import NoDataMessage from "./NoDataMessage";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "../components/CommentCard";

const CommentsContainer = () => {

    const {
        blog: { title , comments : {results : commentsArr}},
        commentsWrapper,
        setCommentsWrapper
    } = useContext(BlogContext);

    return (
        <div
            className={`
                max-sm:w-full fixed
                ${
                    commentsWrapper
                        ? "top-0 sm:right-0"
                        : "top-[100%] sm:right-[-100%]"
                }
                duration-700 max-sm:right-0 sm:top-0
                w-[30%] min-w-[350px] h-full z-50
                bg-white shadow-2xl p-8 px-16
                overflow-y-auto overflow-x-hidden
            `}
        >

            <div className="relative">

                <h1 className="text-xl font-medium">
                    Comments
                </h1>

                <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">
                    {title}
                </p>

                <button
                    onClick={() =>
                        setCommentsWrapper(prev => !prev)
                    }
                    className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey"
                >
                    <RxCross1 className="text-2xl mt-1" />
                </button>

            </div>

            <hr className="border-grey my-8 w-[120%] -ml-10" />

            <CommentField action="comment" />

            {
                commentsArr && commentsArr.length ? 
                commentsArr.map((comment, i) => {
                    return <AnimationWrapper key={i}>
                        <CommentCard index={i} leftVal={comment.childrenLevel * 4} commentData={comment}/>
                    </AnimationWrapper> 
                })    
                : <NoDataMessage message="No comment found" />
            }
        </div> 
    );
};


export const fetchComments = async ({
    skip = 0,
    blog_id,
    setParentCommentCountFun,
    comment_array = null
}) => {

    try {

        const { data } = await axios.post(
            import.meta.env.VITE_SERVER_DOMAIN + "/get-blog-comments",
            {
                blog_id,
                skip
            }
        );

        const comments = data.comments || [];

        comments.forEach(comment => {
            comment.childrenLevel = 0;
        });

        setParentCommentCountFun(
            prevVal => prevVal + comments.length
        );

        if (comment_array === null) {
            return {
                results: comments
            };
        }

        return {
            results: [
                ...comment_array,
                ...comments
            ]
        };

    } catch (err) {

        console.error(
            "FETCH COMMENTS ERROR:",
            err.response?.data || err.message
        );

        return {
            results: []
        };
    }
};


export default CommentsContainer;
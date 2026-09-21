import { useContext } from "react";
import { CiHeart } from "react-icons/ci";
import { BlogContext } from "../pages/BlogPage";
import { FaRegCommentDots } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaTwitter } from "react-icons/fa";
import { UserContext } from "../App";

const BlogInteraction = () => {

    let {blog : {title , blog_id , activity , activity : {total_likes, total_comments} , author : {personal_info : {username : author_username}}}, setBlog} = useContext(BlogContext); 
    let {userAuth : {username }} = useContext(UserContext); 

    return (
        <>
            <hr className="border-grey my-2"/>
            <div className="flex gap-6 justify-between">
                <div className="flex gap-3 items-center">
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80">
                        <CiHeart />
                    </button>
                    <p className="text-xl text-dark-grey">{total_likes}</p>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80 text-2xl">
                        <FaRegCommentDots  />
                    </button>
                    <p className="text-xl text-dark-grey">{total_comments}</p>
                </div>

                <div className="flex gap-6 items-center">
                    {username == author_username ? <Link to={`/editor/${blog_id}`} className="underline hover:text-purple">Edit</Link> : ""}
                    <a
                    href={`https://twitter.com/intent/tweet?text=Read ${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    <FaTwitter className="text-xl hover:text-twitter" />
                    </a>
                </div>
            </div>

            <hr className="border-grey my-2"/>
        </>
    )
}

export default BlogInteraction ; 
import { Link } from "react-router-dom";
import { getDay } from "../common/date";

const TrendingBlogPost = ({blog, index}) => {
    let {title , blog_id : id , author : {personal_info : {fullName, username , profile_img}} , publishedAt} = blog ;

    return (
        <Link to={`/blog/${id}`} className="flex gap-5 mb-8">
            <h1 className="blog-index">{index < 10 ? "0" + (index + 1) : index}</h1>

            <div>
                <div className="">
                    <div className="flex gap-2 items-center mb-7">
                        <img src={profile_img} className="w-6 h-6 rounded-full"/>
                        <p className="line-clamp-1">{fullName} @{username}</p>
                        <p className="min-w-fit">{getDay(publishedAt)}</p>
                    </div>
                </div>

                <h1 className="blog-title">{title}</h1>
            </div>
        </Link>
    )
}

export default TrendingBlogPost ; 
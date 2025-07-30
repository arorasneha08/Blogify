import { useParams } from "react-router-dom";
import InPageNavigation from "../components/InPageNavigation";
import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/Loader";
import BlogPostCard from "../components/BlogPostCard";
import NoDataMessage from "../components/NoDataMessage";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";
import axios from "axios";
import { FilterPaginationData } from "../common/FilterPaginationData";

const SearchPage = () => {
    let {query} = useParams(); 
    let [blogs , setBlog] = useState(null); 

    const searchBlogs = ({page = 1 , create_new_arr = false}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs" , {query , page})
        .then (async({data}) => {
            console.log(data.blogs);   
            let formatData = await FilterPaginationData({
                state : blogs , 
                data : data.blogs , 
                page : page , 
                countRoute : "/search-blogs-count" ,
                data_to_send : {query}, 
                create_new_arr
            })     
            console.log(formatData);
            setBlog(formatData); 
        })
        .catch((err) => {
            console.log(err);
        })
    }

    const resetState = () => {
        setBlog(null); 
    }

    useEffect(() => {
        resetState(); 
        searchBlogs({page : 1, create_new_arr : true}); 
    } , [query]); 

    return (
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full">
                <InPageNavigation routes={[`"Search Results from ${query}"` , "Accounts Matched"]} defaultHidden={["Accounts Matched"]}>
                    <>
                        {blogs === null ? 
                            <Loader/> : 
                            blogs.results.length ? 
                            blogs.results.map((blog, i) => {
                                console.log(blog + "-" + i);
                          
                            return <>
                            <AnimationWrapper key={i} transition={{duration : 1 , delay : i*0.1}}>
                              <BlogPostCard content={blog} author={blog.author.personal_info}/>
                            </AnimationWrapper>
                            </>
                        })  
                      : <NoDataMessage message="No Blogs Published" />
                    }
                    <LoadMoreDataBtn state={blogs} fetchDataFunc={searchBlogs}/>
                    </>
                </InPageNavigation>
            </div>
        </section>
    )
}

export default SearchPage ; 
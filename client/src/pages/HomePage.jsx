import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/InPageNavigation";
import axios from "axios" ; 
import Loader from "../components/Loader";
import BlogPostCard from "../components/BlogPostCard"; 

export default function Home() {

  let [blogs , setBlogs] = useState(null); 
  
  const fetchLatestBlogs = () => {
    axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs")
    .then (({data}) => {
      console.log(data.blogs);
      setBlogs(data.blogs); 
    })
    .catch((err) => {
      console.log(err);
    })
  }
  useEffect(() => {
    fetchLatestBlogs(); 
  }, []);

  return (
    <div>
      <AnimationWrapper>
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full ">
                <InPageNavigation routes={["Home" , "Trending Blogs"]} defaultHidden={["Trending Blogs"]}>

                  <>
                    {blogs === null ? <Loader/> : 
                      blogs.map((blog, i) => {
                        console.log(blog + "-" + i);
                        
                        return <>
                        <AnimationWrapper key={i} transition={{duration : 1 , delay : i*0.1}}>
                            <BlogPostCard content={blog} author={blog.author.personal_info}/>
                        </AnimationWrapper>
                        </>
                      }) 
                    }
                  </>
                  <h1>Trending Blogs Here </h1>

                  
                </InPageNavigation>
            </div>
            <div>

            </div>
        </section>
      </AnimationWrapper>
    </div>
  )
}

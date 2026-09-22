import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/InPageNavigation";
import axios from "axios" ; 
import Loader from "../components/Loader";
import BlogPostCard from "../components/BlogPostCard"; 
import TrendingBlogPost from "../components/TrendingBlogPost";
import { FaArrowTrendUp } from "react-icons/fa6";
import { activeTabRef } from "../components/InPageNavigation";
import NoDataMessage from "../components/NoDataMessage";
import { FilterPaginationData } from "../common/FilterPaginationData";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";

export default function Home() {

  let [blogs , setBlogs] = useState(null); 
  let [trendingBlogs , setTrendingBlogs] = useState(null); 
  let categories = ["programming" , "hollywood", "film making" , "social media" , "cooking", "tech" ,"finances", "travel"] ; 
  let [pageState , setPageState] = useState("home"); 

  // blogs = {
  //   results : [{} , {} , {}],
  //   page : 2 , 
  //   totalDocs : 10 
  // }
  
  const fetchLatestBlogs = ({page = 1}) => {
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs" , {page})
    .then (async({data}) => {
      console.log(data.blogs);   
      let formatData = await FilterPaginationData({
        state : blogs , 
        data : data.blogs , 
        page : page , 
        countRoute : "/all-latest-blogs-count"
      })     
      console.log(formatData);
      setBlogs(formatData); 
    })
    .catch((err) => {
      console.log(err);
    })
  }

  const fetchTrendingBlogs = () => {
    axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
    .then (({data}) => {
      console.log(data.blogs);
      setTrendingBlogs(data.blogs); 
    })
    .catch((err) => {
      console.log(err);
    })
  }
  
  useEffect(() => {
      activeTabRef.current.click(); 
      if(pageState == "home"){
        fetchLatestBlogs({page : 1}); 
      }
      else{
        fetchBlogsByCategory({page : 1}); 
      }
      if(!trendingBlogs){ 
        fetchTrendingBlogs(); 
      }
  }, [pageState]);

  const loadBlogByCategory = (e) => {
    let category = e.target.innerText.toLowerCase() ; 
    setBlogs(null); 

    if(pageState == category){
      setPageState("home"); 
      return ; 
    }
    setPageState(category); 
  }

  const fetchBlogsByCategory = ({page = 1 }) => {
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs" , {tag : pageState , page })
    .then (async({data}) => {
      let formatData = await FilterPaginationData({
        state : blogs , 
        data : data.blogs , 
        page : page , 
        countRoute : "/search-blogs-count",
        data_to_send : {tag : pageState}
      })     
      setBlogs(formatData);
    })
    .catch((err) => {
      console.log(err);
    })
  }

  return (
    <div>
      <AnimationWrapper>
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full ">
                <InPageNavigation routes={[pageState , "Trending Blogs"]} defaultHidden={["Trending Blogs"]}>

                  <>
                    {blogs === null ? 
                      <Loader/> : 
                      blogs.results.length ? 
                        blogs.results.map((blog, i) => {
                          console.log(blog + "-" + i);
                          
                          return (
                          <AnimationWrapper key={blog.blog_id} transition={{duration : 1 , delay : i*0.1}}>
                              <BlogPostCard content={blog} author={blog.author.personal_info}/>
                          </AnimationWrapper>
                          )
                        }) 
                      : <NoDataMessage message="No Blogs Published" />
                    }
                    <LoadMoreDataBtn state={blogs} fetchDataFunc={(pageState == "home" ? fetchLatestBlogs : fetchBlogsByCategory)}/>
                  </>
                  
                  {trendingBlogs === null ? 
                    <Loader/> 
                    :
                    trendingBlogs.length ?  
                      trendingBlogs.map((blog, i) => {
                        console.log(blog + "-" + i);
                        
                        return (
                        <AnimationWrapper key={blog.blog_id} transition={{duration : 1 , delay : i*0.1}}>
                            <TrendingBlogPost blog={blog} index={i}/>
                        </AnimationWrapper>
                        )
                    }) 
                    :
                    <NoDataMessage message="No Trending Blogs"/>
                  }
                  
                </InPageNavigation>
            </div>
            <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden">
              <div className="flex flex-col gap-10">
                  <div>
                    <h1 className="font-medium text-xl mb-8">Stories from all interests</h1>
                    <div className="flex gap-3 flex-wrap">
                      {categories.map((category , i) => {
                        return <button onClick={loadBlogByCategory} className={"tag" + (pageState == category ? " bg-black text-white": " ")} key={category}>{category}</button>
                      })}
                    </div>
                  </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <h1 className="font-medium text-xl mb-8 flex items-center gap-2 pt-10">
                    Trending 
                    <FaArrowTrendUp className="text-lg" />
                  </h1>
                </div>
                {trendingBlogs === null ? <Loader/> : 
                  trendingBlogs.map((blog, i) => {
                  console.log(blog + "-" + i);
                        
                return (
                  <AnimationWrapper key={blog.blog_id} transition={{duration : 1 , delay : i*0.1}}>
                    <TrendingBlogPost blog={blog} index={i}/>
                  </AnimationWrapper>
                  )
                  }) 
                }
              </div>
            </div>
        </section>
      </AnimationWrapper>
    </div>
  )
}

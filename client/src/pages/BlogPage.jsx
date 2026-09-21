import axios from 'axios';
import { createContext, useState } from 'react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom'
import AnimationWrapper from '../common/page-animation';
import Loader from '../components/Loader';
import { getDay } from '../common/date';
import BlogInteraction from '../components/BlogInteraction';
import BlogPostCard from '../components/BlogPostCard';
import BlogContent from '../components/BlogContent';

export const blogStructure = {
  title : '' , 
  des : '' ,
  content : [],
  tags : [] ,
  author : {personal_info : {}},
  banner : '' ,  
  publishedAt : '' 
}

export const BlogContext = createContext({}); 

export default function BlogPage() {
    let {blog_id} = useParams() ;

    const [blog , setBlog] = useState(blogStructure); 
    const [loading , setLoading] = useState(true);
    const [similarBlogs , setSimilarBlogs] = useState(null); 

    let {title , content , banner , author : {personal_info : {fullName , username : author_username, profile_img}}, publishedAt , tags} = blog;

    const fetchBlog = () => {
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog" , {blog_id})
      .then(({data : {blog}}) => {
        // console.log("Current blog:", blog);
        // console.log("Current blog tags:", blog.tags);
        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs" , {tag : blog.tags[0] , limit : 6 , eliminate_blog : blog_id})
        .then(({data}) => {
          // console.log(blog);
          setSimilarBlogs(data.blogs) ;
        })
        
        setBlog(blog); 
        setLoading(false); 
        // console.log(blog);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false); 
      })
    }

    useEffect(() => {
      resetState() ; 
      fetchBlog(); 
    } , [blog_id]); 

    const resetState = () => {
      setBlog(blogStructure); 
      setSimilarBlogs(null); 
      setLoading(true); 
    }

    return (
    <AnimationWrapper>
      {loading ? <Loader/> : 
      <BlogContext.Provider value={{blog ,setBlog }}>

        <div className='max-w-[900px] center py-10 max-lg:px-[5vw]'>
          <img src={banner} className='aspect-video'/>

          <div className='mt-12'>
            <h2>{title}</h2>
            <div className='flex max-sm:flex-col justify-between my-8'>
              <div className='flex gap-5 items-start'>
                <img src={profile_img} className='w-12 h-12 rounded-full'/>
                <p className='capitalize'>{fullName}
                  <br/>
                  @
                  <Link to={`/user/${author_username}`} className='underline'>{author_username}</Link>
                </p>
              </div>
            </div>
            <p className='text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5'>Published on {getDay(publishedAt)}</p>
          </div>

          <BlogInteraction />

          {/* blog content  */}
          <div className='my-12 font-gelasio blog-page-content'>
            {
              content[0].blocks.map((block , i) => {
                return <div key={i} className='my-4 md:my-8'>
                  <BlogContent block={block}/>
                </div>
              })
            }
          </div>

          {
            similarBlogs != null && similarBlogs.length ? 
            <>
            <h1 className='text-2xl mt-14 mb-10 font-medium'>Similar Blogs</h1>
            {similarBlogs.map((blog , i) => {
              let {author : {personal_info}} = blog; 
              return <AnimationWrapper key={i} transition={{duration : 1 , delay : i * 0.08}}>
                <BlogPostCard content={blog} author={personal_info}/>
              </AnimationWrapper>
            })}
            </>
            : " "

          }
        </div>
        </BlogContext.Provider>
      }
    </AnimationWrapper>
  )
}

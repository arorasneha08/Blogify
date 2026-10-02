import { useContext, useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { FilterPaginationData } from "../common/FilterPaginationData";
import { Toaster } from "react-hot-toast";
import { IoSearch } from "react-icons/io5";
import InPageNavigation from "../components/InPageNavigation";
import Loader from "../components/Loader";
import NoDataMessage from "../components/NoDataMessage";
import AnimationWrapper from "../common/PageAnimation";
import ManagePublishedBlogCard, { ManageDraftBlogCard } from "../components/ManagePublishedBlogCard";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";
import { useSearchParams } from "react-router-dom";

const ManageBlogs = () => {

    const [blogs, setBlogs] = useState(null) ;
    const [drafts , setDrafts] = useState(null) ;
    const [query, setQuery] = useState("") ;
    let activeTab = useSearchParams()[0].get("tab") ; 

    let {userAuth : {access_token}} = useContext(UserContext) ;

    const getBlogs = ({page , draft , deleteDocCount}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/user-written-blogs" , {page , draft , query, deleteDocCount} , {headers : {Authorization : `Bearer ${access_token}`}})

        .then(async({data}) => {
            let formatedData = await FilterPaginationData({
                state : draft ? drafts : blogs ,
                data : data.blogs,
                page ,
                user : access_token ,
                countRoute : "/user-written-blogs-count",
                data_to_send : {draft , query}
            })
            console.log(formatedData) ;
            if(draft){
                setDrafts(formatedData) ;
            }
            else{
                setBlogs(formatedData) ;
            }
        })
        .catch(err => {
            console.log(err) ;
        })
    }

    useEffect(() => {
        if(access_token){
            if(blogs == null){
                getBlogs({page : 1 , draft : false}) ;
            }
            if(drafts == null){
                getBlogs({page : 1 , draft : true}) ;
            }
        }
    } , [access_token , blogs, drafts , query]); 

    const handleChange = (e) => {
        if(!e.target.value.length){
            setQuery("") ;
            setBlogs(null) ;
            setDrafts(null) ;
        }

    }
    const handleSearch = (e) => {
        let searchQuery = e.target.value; 
        setQuery(searchQuery);

        if(e.keyCode == 13 && searchQuery.length){
            setBlogs(null) ;
            setDrafts(null) ;
        }
    }


    return (
        <>
        <Toaster/>

        <div className="relative max-md:mt-5 ms:mt-8 mb-10">    
            <input type="search" className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey" placeholder="Search Blogs" onChange={handleChange} onKeyDown={handleSearch}/>
            <IoSearch className="absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"/>

        </div>

        <InPageNavigation routes={["Published Blogs" , "Drafts"]} defaultActiveIdx={activeTab === "drafts" ? 1 : 0}>
            { // published blogs
                blogs == null ? <Loader/> : 
                blogs.results.length ?
                <>
                {
                    blogs.results.map((blog , i) => {
                        return <AnimationWrapper key={i} transition={{delay : i * 0.04}}>
                            <ManagePublishedBlogCard  blog={{...blog , index : i, setStateFunc : setBlogs}}/>
                        </AnimationWrapper>
                    })
                }
                
                <LoadMoreDataBtn state={blogs} fetchDataFunc={getBlogs} additionalParams={{draft :false , deleteDocCount : blogs.deletedDocCount}}/>
                </>
                
                : <NoDataMessage message="No published blogs."/>
            }
            { // draft blogs
                drafts == null ? <Loader/> : 
                drafts.results.length ?
                <>
                {
                    drafts.results.map((blog , i) => {
                        return <AnimationWrapper key={i} transition={{delay : i * 0.04}}>
                            <ManageDraftBlogCard blog={{...blog , index : i, setStateFunc : setDrafts}}/>
                        </AnimationWrapper>
                    })
                }
                <LoadMoreDataBtn state={drafts} fetchDataFunc={getBlogs} additionalParams={{draft :true , deleteDocCount : drafts.deletedDocCount}}/>
                </>
                
                : <NoDataMessage message="No draft blogs"/>
            }
        </InPageNavigation>
        </>
    )
}

export default ManageBlogs ;
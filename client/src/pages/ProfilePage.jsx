import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import AboutUser from "../components/AboutUser";
import { FilterPaginationData } from "../common/FilterPaginationData";
import InPageNavigation from "../components/InPageNavigation";
import BlogPostCard from "../components/BlogPostCard";
import NoDataMessage from "../components/NoDataMessage";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";
import PageNotFound from "./404Page";

export const profileDataStructure = {
    personal_info : {
        fullName : "" , 
        username : "" , 
        profile_img : "" , 
        bio : "" , 
    },
    account_info : {
        total_posts : 0 ,
        total_blogs : 0, 
    },
    social_links : {} , 
    joinedAt : ""
}

const ProfilePage = () => {

    let {id : profileId} = useParams(); 
    let [profile , setProfile] = useState(profileDataStructure); 
    let [loading , setLoading] = useState(true); 
    let [blogs , setBlogs] = useState(null); 
    let [profileLoaded , setProfileLoaded] = useState(""); 

    let {personal_info : {fullName , username : profile_username , profile_img , bio} , account_info : {total_reads , total_posts} , social_links , joinedAt} = profile ; 

    let {userAuth : {username}} = useContext(UserContext); 
    
    const fetchUserProfile = () => {
        console.log("Fetching profile for:", profileId);
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile" , {username : profileId})
        .then(({data : user}) => {
            if(user != null){
                setProfile(user); 
            }
            console.log("API Response:", user);
            console.log(user);
            setProfileLoaded(profileId)
            getBlogs({user_id : user._id})
            setLoading(false); 
        })
        .catch((err) => {
            console.error("API Error:", err);
            setLoading(false); 
        })
    }

    const getBlogs = ({page = 1 , user_id}) => {
        user_id = (user_id == undefined) ? blogs.user_id : user_id; 
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
            author : user_id , 
            page 
        })

        .then(async( {data }) => {
            let formattedData = await FilterPaginationData({
                state : blogs ,
                data : data.blogs ,
                page ,
                countRoute : "/search-blogs-count" , 
                data_to_send : {author : user_id}
            })
            formattedData.user_id = user_id ; 
            console.log(formattedData);
            setBlogs(formattedData); 
        })
        .catch()
    }

    const resetState = () => {
        setProfile(profileDataStructure);
        setProfileLoaded("");  
        setLoading(true); 
    }

    useEffect(() => {
        if(profileId != profileLoaded){
            setBlogs(null); 
        }
        if(blogs == null){
            resetState(); 
            fetchUserProfile();   
        }
    }, [profileId]);

    return (
        <AnimationWrapper>
            {loading ? <Loader /> : 
                profile_username.length ? 
                    <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
                        <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:pl-8 md:border-1 border-grey md:sticky md:top-[100px] md:py-10">
                            <img src={profile_img} className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"/>
                            <h1 className="text-2xl font-medium">@{profile_username}</h1>
                            <p className="text-xl capitalize h-6">{fullName}</p>
                            <p>{total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} Reads</p>
                            <div className="flex gap-4 mt-2">
                                {profileId == username ? 
                                    <Link to="/settings/edit-profile" className="btn-light rounded-md">Edit Profile</Link> 
                                    : ""
                                }
                            </div>

                            <AboutUser className="max-md:hidden" bio={bio} social_links={social_links} joinedAt={joinedAt}/>
                        </div>
                        <div className="max-md:mt-12 w-full">
                            <InPageNavigation routes={["Blogs Published" , "About"]} defaultHidden={["About"]}>

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
                                <LoadMoreDataBtn state={blogs} fetchDataFunc={getBlogs}/>
                            </>

                            <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt}/>
                            </InPageNavigation>
                        </div>
                    </section>
                : <PageNotFound/>
            }
        </AnimationWrapper>
    )
}

export default ProfilePage; 

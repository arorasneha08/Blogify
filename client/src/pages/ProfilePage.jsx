import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";
import { UserContext } from "../App";

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
    let {personal_info : {fullName , username : profile_username , profile_img , bio} , account_info : {total_reads , total_posts} , social_links , joinedAt} = profile ; 

    let {userAuth : {username}} = useContext(UserContext); 
    
    const fetchUserProfile = () => {
        console.log("Fetching profile for:", profileId);
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile" , {username : profileId})
        .then(({data : user}) => {
            console.log("API Response:", user);
            console.log(user);
            setProfile(user); 
            setLoading(false); 
        })
        .catch((err) => {
            console.error("API Error:", err);
            setLoading(false); 
        })
    }

    const resetState = () => {
        setProfile(profileDataStructure);
        setLoading(true); 
    }

    useEffect(() => {
        resetState(); 
        fetchUserProfile(); 
    }, [profileId]);

    return (
        <AnimationWrapper>
            {loading ? <Loader /> : 
                <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
                    <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] ">
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
                    </div>
                </section>
            }
        </AnimationWrapper>
    )
}

export default ProfilePage; 

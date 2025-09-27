import { Link } from "react-router-dom";
import { FaYoutube } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { CiGlobe } from "react-icons/ci";
import { FaFacebook } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { getFullDay } from "../common/date";

const iconMap = {
    youtube: <FaYoutube />,
    instagram: <FaInstagram />,
    facebook : <FaFacebook/>, 
    twitter : <FaTwitter />, 
    github: <FaGithub />,
    website: <CiGlobe />
};

const AboutUser = ({className , bio , social_links , joinedAt}) => {
    return (
        <div className={"md:w-[90%] md:mt-7" + className} >
            <p className="text-xl leading-7">{bio.length ? bio : "Nothing to read here"}</p>
            <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey">
                {
                    Object.keys(social_links).map((key) => {
                        const link = social_links[key]; 
                        const icon = iconMap[key.toLowerCase()] || <CiGlobe/> ; 
                        return link ? <Link to={link} key={key} target="_blank" className="text-2xl hover:text-black">{icon}</Link> : null; 
                    })
                }
            </div>
            <p className="text-xl leading-7 text-dark-grey">Joined on {getFullDay(joinedAt)}</p>
        </div>
    )
}

export default AboutUser ; 
import { useState } from "react";
import { UserContext } from "../App";
import { useContext } from "react";
import { FilterPaginationData } from "../common/FilterPaginationData";
import AnimationWrapper from "../common/PageAnimation";
import NoDataMessage from "../components/NoDataMessage";
import NotificationCard from "../components/NotificationCard";
import { useEffect } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";

const Notification = () => {

    const [filter , setFilter] = useState("all");
    let {userAuth , userAuth : {access_token, new_notification_available}, setUserAuth} = useContext(UserContext);

    let filters = ["all", "like" , "comment" , "reply"];
    const [notifications, setNotifications] = useState(null);

    const fetchNotifications= ({page , deletedDocCount = 0}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/notifications" , {page , filter , deletedDocCount} , {headers : {Authorization : `Bearer ${access_token}`}})
        .then(async({data : {notifications: data}}) => {

            if(new_notification_available){
                setUserAuth({...userAuth, new_notification_available : false});
            }
            let formatedData = await FilterPaginationData({
                state : notifications ,
                data , page,
                countRoute : "/all-notifications-count",
                data_to_send: {filter},
                user : access_token
            });

            setNotifications(formatedData);
            console.log(formatedData);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    useEffect(() => {

        if(access_token){
            fetchNotifications({page : 1});
        }
    }, [access_token , filter]);

    const handleFilter = (e) => {
        let btn = e.target; 
        setFilter(btn.innerHTML); 
        setNotifications(null);
    }   

    return (
        <div>
            <h1 className="max-md:hidden"> Recent Notifications</h1>

            <div className="my-8 flex gap-6">
                {
                    filters.map((filtername , i) => {
                        return <button key={i} className={`py-2 ${filter == filtername ? "btn-dark" : "btn-light"}`} onClick={handleFilter}>{filtername}</button>
                    })
                }
            </div>

            {
                notifications == null ? <Loader /> : 
                <>
                {
                    notifications.results.length ? notifications.results.map((notification , i) => {
                        return <AnimationWrapper key={notification._id || i}>
                            <NotificationCard  key={i} transition={{delay : i * 0.08}} data={notification} index={i} notificationState={{notifications, setNotifications}}/>
                        </AnimationWrapper>
                    })
                    : <NoDataMessage message="No notification found"/>
                }
                <LoadMoreDataBtn state={notifications} fetchDataFunc={fetchNotifications} additionalParams={{deletedDocCount : notifications.deletedDocCount}}/>
                </>
            }
        </div>
    )
}

export default Notification ;
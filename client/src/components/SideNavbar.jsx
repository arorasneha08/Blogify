import { Outlet , Navigate, NavLink} from "react-router-dom";
import { UserContext } from "../App";
import { useContext , useState , useRef, useEffect} from "react";
import { IoDocumentTextOutline } from "react-icons/io5";
import { LuBell } from "react-icons/lu";
import { RiFileEditLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";
import { FaBarsStaggered } from "react-icons/fa6";

const SideNavbar = () => {
    let {userAuth : {access_token}} = useContext(UserContext);
    let page = location.pathname.split("/")[2];

    let [pageState , setPageState] = useState(page.replace('-' , ' ')); 
    let [showSideNav , setShowSideNav] = useState(false); 
    let activeTabLine = useRef(); 
    let sideBarIconTab = useRef(); 
    let pageStateTab = useRef(); 

    const changePageState = (e) => {
        let {offsetWidth , offsetLeft} = e.target; 

        activeTabLine.current.style.width = offsetWidth + "px" ; 
        activeTabLine.current.style.left = offsetLeft + "px" ;

        if(e.target == sideBarIconTab.current){
            setShowSideNav(true);
        }
        else{
            setShowSideNav(false);
        }
    }

    useEffect(() => {
        setShowSideNav(false);
        pageStateTab.current.click();
    }, [pageState])
    
    return (
        access_token === null ? <Navigate to="/signin"/> : 
        <>
        <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
            <div className="sticky top-[80px] z-30">
                <div className="md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto">
                    <button ref={sideBarIconTab} className="p-5 capitalize" onClick={changePageState}>
                        <FaBarsStaggered className="pointer-events-none"/>
                    </button>
                    <button ref={pageStateTab} className="p-5 capitalize" onClick={changePageState}>
                        {pageState}
                    </button>
                    <hr ref={activeTabLine} className="absolute bottom-0 duration-500"/>
                </div>


                <div className={"min-w-[200px] h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:fixed max-md:top-[144px] max-md:left-0 max-md:w-[280px] max-md:h-[calc(100vh-144px)] max-md:px-6 max-md:ml-0 duration-300 bg-white z-50 " + (showSideNav ? "max-md:translate-x-0": "max-md:-translate-x-full")}>
                    
                    <h1 className="text-xl text-dark-grey mb-3">Dashboard</h1>
                    <hr className="border-grey -ml-6 mb-8 mr-6"/>

                    <NavLink to="/dashboard/blogs" onClick={(e) => setPageState(e.target.innerText)} className="sidebar-link">
                        <IoDocumentTextOutline />
                        Blogs
                    </NavLink>

                    <NavLink to="/dashboard/notification" onClick={(e) => setPageState(e.target.innerText)} className="sidebar-link">
                        <LuBell />
                        Notification
                    </NavLink>

                    <NavLink to="/editor" onClick={(e) => setPageState(e.target.innerText)} className="sidebar-link">
                        <RiFileEditLine />
                        Write
                    </NavLink>

                    <h1 className="text-xl text-dark-grey mb-3 mt-20">Settings</h1>
                    <hr className="border-grey -ml-6 mr-6 mb-8"/>

                    <NavLink to="/settings/edit-profile" onClick={(e) => setPageState(e.target.innerText)} className="sidebar-link">
                        <FaRegUser />
                        Edit Profile
                    </NavLink>

                    <NavLink to="/settings/change-password" onClick={(e) => setPageState(e.target.innerText)} className="sidebar-link">
                        <MdLockOutline />
                        Change Password
                    </NavLink>
                </div>
            </div>
            <div className="max-md:-mt-8 mt-5 w-full">
                <Outlet/>
            </div>
        </section>

        </>
    )
}

export default SideNavbar; 
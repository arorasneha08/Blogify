import logo from "../imgs/logo.png";
import { Link , Outlet} from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import { RiFileEditLine } from "react-icons/ri";
import { useContext } from "react";
import { UserContext } from "../App";
import { SlBell } from "react-icons/sl";
import UserNavigationPanel from "./UserNavigationPanel";

export default function Navbar() {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const {userAuth , userAuth : {access_token , profile_img}} = useContext(UserContext); 
  
  return (
    <>
    <nav className="navbar flex items-center p-4 relative">
      <Link to="/" className="flex-none w-10">
        <img src={logo} alt="Logo" />
      </Link>

      <div
        className={`
          absolute w-full left-0 top-full mt-2 px-[5vw] md:static md:mt-0 md:px-0
          ${searchBoxVisibility ? 'block' : 'hidden'} 
          md:block
          `}
          >
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-14 md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
            />
          <FaSearch className="absolute right-4 md:left-4 top-1/2 -translate-y-1/2 text-xl text-dark-grey" />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 ml-auto">
        <button
          className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
          onClick={() => setSearchBoxVisibility((prev) => !prev)}
          >
          <FaSearch className="text-xl" />
        </button>
        <Link to="/editor" className="hidden md:flex gap-2 link"><RiFileEditLine className="text-xl" />Write</Link>

        {access_token ? 
        <>
          <Link to="/dashboard/notification">
            <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10 mt-1 text-center">
              <SlBell className="text-2xl ml-3"/>
            </button>
          </Link>
          <div className="relative">
            <button className="w-12 h-12 mt-1">
              <img src={profile_img} className="w-full h-full object-cover rounded-full"/>
            </button>
            <UserNavigationPanel/>
          </div>
        </>
         :
        <>
          <Link className="btn-dark py-2" to="/signin">
            Sign In
          </Link>
          <Link className="btn-light py-2 hidden md:block" to="/signup">
            Sign Up
          </Link>
        </>
        }
      </div>
    </nav>

    <Outlet/>
    </>
  );
}

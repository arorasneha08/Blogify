// import logo from "../imgs/logo.png"
// import {Link} from "react-router-dom"
// import { FaSearch } from "react-icons/fa";
// import { useState } from "react";

// export default function Navbar() {
//   const [searchBoxVisiblity , setSearchBoxVisibility] = useState(false); 


//   return (
//     <nav className="navbar">
//         <Link to="/" className="flex-none w-10">
//             <img src={logo}/>
//         </Link>
//         <div className={"absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:width-auto md:show" + ( searchBoxVisiblity ? "show" : "hide")}>
//             <input type="text" placeholder="Search" className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"/>
//             <FaSearch className="absolute right-[10%] md:pointer-events-none md:left-5 top-1/3 translate-x-2/3 text-xl text-dark-grey"/>
//         </div>
//         <div className="flex items-center gap-3 md:gap-6 ml-auto">
//           <button className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center" onClick={() => setSearchBoxVisibility(currVal => !currVal)}>
//             <FaSearch className="text-xl"/>
//           </button>
//         </div>
//     </nav>
//   )
// }

import logo from "../imgs/logo.png";
import { Link , Outlet} from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import { RiFileEditLine } from "react-icons/ri";

export default function Navbar() {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);

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
        <Link className="btn-dark py-2" to="/signin">
          Sign In
        </Link>
        <Link className="btn-light py-2 hidden md:block" to="/signup">
          Sign Up
        </Link>
      </div>
    </nav>

    <Outlet/>
    </>
  );
}

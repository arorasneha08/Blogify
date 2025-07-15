import { useEffect, useRef, useState } from "react"

export default function InPageNavigation({routes , defaultHidden = [],defaultActiveIdx = 0 , children}) {
    let [InPageNavIndex , setInPageNavIndex] = useState(defaultActiveIdx); 
    let activetabLineRef = useRef();
    let activeTabRef = useRef(); 

    // on clicking onn the tab the black line shifts 
    const changePageState = (btn , i) => {
        console.log(btn, i);
        let {offsetWidth , offsetLeft} = btn ; 
        activetabLineRef.current.style.width = offsetWidth + "px" ; 
        activetabLineRef.current.style.left = offsetLeft + "px" ; 
        setInPageNavIndex(i); 
    }
    useEffect(() => {
        changePageState(activeTabRef.current, defaultActiveIdx); 
    }, [])

    return (
    <>
        <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
            {routes.map((route , i) => {
                return (
                    <button ref={i == defaultActiveIdx ? activeTabRef : null} key={i} className={"p-4 px-5 capitalize" + (InPageNavIndex == i ? "text-black " : "text-dark-grey ") + ( defaultHidden.includes(route) ? "md:hidden ": " ")}
                        onClick={(e) => {changePageState(e.target , i)}}>
                        {route}
                    </button>
                )
            })}
            <hr ref={activetabLineRef} className="absolute bottom-0 duration-300"/>
        </div>

        {Array.isArray(children) ? children[InPageNavIndex] : children}

    </>
    )
}
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserAuthForm from "./pages/UserAuthForm";
import { createContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/Editor";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import PageNotFound from "./pages/404Page";
import ProfilePage from "./pages/ProfilePage";
import BlogPage from "./pages/BlogPage";
import SideNavbar from "./components/SideNavbar";
import ChangePassword from "./pages/ChangePassword";

export const UserContext = createContext({}) ; 

const App = () => {
    const [userAuth , setUserAuth] = useState({}); 

    useEffect(() =>{
        let userInSession = lookInSession("user"); 
        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({access_token : null})
    } , []); 

    return (
        <UserContext.Provider value={{userAuth , setUserAuth}}>
            <Routes>
                <Route path="/editor" element={<Editor/>}/>
                <Route path="/editor/:blog_id" element={<Editor/>}/>
                <Route path="/" element={<Navbar/>}>
                    <Route index element={<HomePage/>}/>
                    <Route path="settings" element={<SideNavbar/>}>
                        <Route path="edit-profile" element={<h1>Edit profile page</h1>}/>
                        <Route path="change-password" element={<ChangePassword/>}/>
                    </Route>

                    <Route path="signin" element={<UserAuthForm type="sign-in"/>}/>
                    <Route path="signup" element={<UserAuthForm type="sign-up"/>}/>
                    <Route path="search/:query" element={<SearchPage/>}/>
                    <Route path="user/:id" element={<ProfilePage />}/>
                    <Route path="blog/:blog_id" element={<BlogPage />} />
                    <Route path="*" element={<PageNotFound />}/>
                </Route>
            </Routes>
        </UserContext.Provider>
    );
}

export default App;
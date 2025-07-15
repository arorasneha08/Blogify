import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserAuthForm from "./pages/UserAuthForm";
import { createContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/Editor";
import HomePage from "./pages/HomePage";

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
                <Route path="/" element={<Navbar/>}>
                    <Route index element={<HomePage/>}/>
                    <Route path="signin" element={<UserAuthForm type="sign-in"/>}/>
                    <Route path="signup" element={<UserAuthForm type="sign-up"/>}/>
                </Route>
            </Routes>
        </UserContext.Provider>
    );
}

export default App;
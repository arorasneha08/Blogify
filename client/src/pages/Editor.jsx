import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/BlogEditor";
import PublishForm from "../components/PublishForm";

const Editor = () =>{
    let {userAuth : {access_token}} = useContext(UserContext); 
    const [editorState , setEditorState] = useState("editor"); 

    return (
        access_token === null ? <Navigate to="/signin"/> : 
        editorState === "editor" ? <BlogEditor/> : <PublishForm/>
    )
}

export default Editor; 
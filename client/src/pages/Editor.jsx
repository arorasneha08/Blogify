import { useContext, useState , createContext } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/BlogEditor";
import PublishForm from "../components/PublishForm";

const BlogStructure = {
    title : '' , 
    banner : '' ,
    comment : [],
    tags : [] , 
    des : '' , 
    author : {personal_info : {}}
}

export const EditorContext = createContext({}) ; 

const Editor = () =>{
    let {userAuth : {access_token}} = useContext(UserContext); 
    
    const [editorState , setEditorState] = useState("editor"); 
    const [blog , setBlog] = useState(BlogStructure); 

    return (
        <EditorContext.Provider value={{blog , setBlog , editorState , setEditorState}}>
            {
                access_token === null ? <Navigate to="/signin"/> : 
                editorState === "editor" ? <BlogEditor/> : <PublishForm/>
            }

        </EditorContext.Provider>
    )
}

export default Editor; 
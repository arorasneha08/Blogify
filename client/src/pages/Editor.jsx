import { useContext, useState , createContext, useEffect } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/BlogEditor";
import PublishForm from "../components/PublishForm";
import Loader from "../components/Loader";
import axios from "axios";

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
    const {blog_id} = useParams() ;
    
    const [editorState , setEditorState] = useState("editor"); 
    const [blog , setBlog] = useState(BlogStructure); 

    const [textEditor , setTextEditor] = useState({isReady : false}); 
    const [loading , setLoading] = useState(true);

    useEffect(() => {
        if(!blog_id){
            setLoading(false);
            return ; 
        }
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog" , {blog_id , draft : true , mode : "edit"})
        .then(({data : {blog}}) => {
            console.log(blog);
            setBlog(blog);
            setLoading(false);
        })
        .catch((err) => {
            setBlog(BlogStructure);
            setLoading(false);
            console.log(err);
        })
    }, [blog_id]);

    return (
        <EditorContext.Provider value={{blog , setBlog , editorState , setEditorState , textEditor, setTextEditor}}>
            {
                access_token === null ? <Navigate to="/signin"/> : 
                loading ? <Loader/> : 
                editorState === "editor" ? <BlogEditor/> : <PublishForm/>
            }

        </EditorContext.Provider>
    )
}

export default Editor; 
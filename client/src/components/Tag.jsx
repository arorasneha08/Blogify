import { useContext } from "react";
import { RxCross1 } from "react-icons/rx";
import { EditorContext } from "../pages/Editor";

const Tag = ({tag , tagIndex}) => {
    let {blog , blog: {tags} , setBlog} = useContext(EditorContext); 

    const handleTagDelete = () => {
        tags = tags.filter(t => t != tag); 
        setBlog({...blog , tags})
    }
    const handleTagEdit = (e) => {
        if(e.keyCode == 13 || e.keyCode == 188){
            e.preventDefault(); 
            let currentTag = e.target.innerText ; 
            tags[tagIndex] = currentTag;
            setBlog({...blog , tags}); 
            console.log(tags);
            e.target.setAttribute("contentEditable", false); 
        }
    }
    const addEditable = (e) => {
        e.target.setAttribute("contentEditable", true); 
        e.target.focus(); 
    }
    return (
        <div className="relative p-2 mt-2 mr-2 pxx-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10">
            <p className="outline-none ml-2" onClick={addEditable}
                onKeyDown={handleTagEdit} tagIndex={tagIndex}>
                {tag}
            </p>
            <button className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2"
                onClick={handleTagDelete}>
                <RxCross1 className="text-xl pointer-events-none"/>
            </button>
        </div>
    )
}

export default Tag ; 
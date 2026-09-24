import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/InputBox";
import {toast, Toaster} from "react-hot-toast"; 
import {useContext, useRef} from "react";
import { UserContext } from "../App";
import axios from "axios";

const changePassword = () => {
    let {userAuth : {access_token}} = useContext(UserContext);
    let changePasswordForm = useRef(); 
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    const handleSubmit = (e) => {
        e.preventDefault();

        let form = new FormData(changePasswordForm.current);
        let formData = {}; 

        for(let [key , value] of form.entries()){
            formData[key] = value;
        }

        let {currentPassword, newPassword} = formData ; 
        if(!currentPassword.length || !newPassword.length){
            return toast.error("All fields are required");
        }

        if(!passwordRegex.test(currentPassword) || (!passwordRegex.test(newPassword))){
            return toast.error("Invalid Password");
        }
        e.target.setAttribute("disabled" , true); 
        let loadingToast = toast.loading("Updating..."); 
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password" , formData, {
            headers : {
                "Authorization" : `Bearer ${access_token}`
            }
        })
        .then(() => {
            toast.dismiss(loadingToast); 
            e.target.removeAttribute("disabled"); 
            return toast.success("Password Updated Successfully");
        })
        .catch(({response}) => {
            toast.dismiss(loadingToast); 
            e.target.removeAttribute("disabled"); 
            return toast.error(response.data.error);
        })
    }
    return (
        <AnimationWrapper>
            <Toaster />
            <form ref={changePasswordForm}>
                <h1 className="max-wd:hidden">Change Password</h1>

                <div className="py-10 w-full md:max-w-[400px]">
                    <InputBox name="currentPassword" type="password" classname="profile-edit-input" placeholder="Current Password"/>
                    <InputBox name="newPassword" type="password" classname="profile-edit-input" placeholder="New Password"/>

                    <button onClick={handleSubmit} className="btn-dark px-10" type="submit">Change Password</button>
                </div>
            </form>
        </AnimationWrapper>
    )
}

export default changePassword; 
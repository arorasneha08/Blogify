import { Link, Navigate , useNavigate} from "react-router-dom";
import InputBox from "../components/InputBox";
import googleIcon from "../imgs/google.png";
import AnimationWrapper from "../common/page-animation";
import {Toaster , toast} from "react-hot-toast"
import axios from "axios" ; 
import { storeInSession } from "../common/session";
import { useRef } from "react";
import { useContext } from "react";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";

export default function UserAuthForm({ type }) {
  const navigate = useNavigate();
  const authForm = useRef(); 
  let {userAuth : {access_token} , setUserAuth} = useContext(UserContext); 
  console.log(access_token);

  const handleSubmit = (e) =>{
    e.preventDefault(); 

    let serverRoute = type === "sign-in" ? "/signin" : "/signup"; 

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    //  form data 
    let form = new FormData(formElement); 
    console.log(form);

    let formData = {} ; 
    for(let [key , value] of form.entries()){
      formData[key] = value;
    }
    console.log(formData);

    // form data validation 
    let {fullName , email , password} = formData ; 
    
    if(fullName){
      if (fullName.length < 3) {
        return toast.error("Full name must be at least 3 characters long");
      }
    }
    if (!email || !emailRegex.test(email)) {
      return toast.error("Invalid Email");
    }
    if (!passwordRegex.test(password)) {
      return toast.error("Password must be 6–20 characters with 1 uppercase, 1 lowercase, and a number");
    }
    userAuthThroughServer(serverRoute , formData); 

  }

  // const userAuthThroughServer = (serverRoute , formData) =>{
  //   axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute , formData)
  //   .then(({data}) => {
  //     console.log(data);
  //     storeInSession("user" , JSON.stringify(data)); 
  //     // console.log(sessionStorage);
  //     setUserAuth(data); 
  //   })
  //   // .catch(({response}) => {
  //   //   toast.error(response.data.error) ; 
  //   // })
  //   .catch((err) => {
  //     console.error(err);
  //     const errorMessage = err.response?.data?.error || "An unexpected error occurred.";
  //     toast.error(errorMessage);
  //   });
  // }

  const userAuthThroughServer = (serverRoute, formData) => {

    axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + serverRoute,
        formData
    )
    .then(({ data }) => {

        console.log(data);

        // Signup successful
        if (serverRoute === "/signup") {

            toast.success(
                "Account registered successfully! Please login."
            );
            setTimeout(() => {
                navigate("/signin");
            }, 1000);
            return;
        }


        // Login successful
        if (
            serverRoute === "/signin" ||
            serverRoute === "/google-auth"
        ) {

            storeInSession(
                "user",
                JSON.stringify(data)
            );

            setUserAuth(data);

            toast.success(
                "Login successful!"
            );

        }

    })
    .catch((err) => {

        console.error(err);

        const errorMessage =
            err.response?.data?.error ||
            "An unexpected error occurred.";

        toast.error(errorMessage);

    });

};
  const handleGoogleAuth = (e) =>{
    e.preventDefault();
    authWithGoogle()
    .then((user) =>{
      console.log(user);

      let serverRoute = "/google-auth"; 
      let formData = {
        access_token: user.access_token
      }
      userAuthThroughServer(serverRoute , formData);
    })
    .catch((err) =>{
      toast.error("trouble login with google");
      return console.log(err);
    })
  }
  return (
    access_token ? 
    <Navigate  to="/" /> 
    : 
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster/>
        <form id="formElement" className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type == "sign-in" ? "Welcome back" : "Join Us Today"}
          </h1>
          {type != "sign-in" ? (
            <InputBox name="fullName" type="text" placeholder="Full Name " />
          ) : (
            ""
          )}
          <InputBox name="email" type="email" placeholder="Email" />
          <InputBox name="password" type="password" placeholder="Password" />
          <button className="btn-dark center mt-14" type="submit" onClick={handleSubmit}>
            {type.replace("-", " ")}
          </button>
          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>
          <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={handleGoogleAuth}
          >
            <img src={googleIcon} className="w-5" />
            Continue with Google
          </button>
          {type == "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account ?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join us Today
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already have an account ?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here.
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
}

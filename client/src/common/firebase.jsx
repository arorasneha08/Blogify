import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAjJXEvNhlOfuQnM5MwsBtMhluEUmWsC8U",
  authDomain: "blog-platform-4f473.firebaseapp.com",
  projectId: "blog-platform-4f473",
  storageBucket: "blog-platform-4f473.firebasestorage.app",
  messagingSenderId: "919348489213",
  appId: "1:919348489213:web:c3e5277fbe4f2a95a38794",
  measurementId: "G-BBG2LSK7QX"
};

const app = initializeApp(firebaseConfig);

// google authentication 
const provider = new GoogleAuthProvider(); 
const auth = getAuth(); 
 
// export const authWithGoogle = async() =>{

//     let user =  null ; 

//     await signInWithPopup(auth , provider)
//     .then((result) => {
//         user = result.user
//     })
//     .catch((err)=>{
//         console.log(err);
//     })
//     return user ; 
// }

export const authWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const access_token = await user.getIdToken(); 

  return {
    access_token,
    ...user
  };
};

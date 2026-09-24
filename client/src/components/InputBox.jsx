import { useState } from "react";
import { FaRegUser } from "react-icons/fa6";
import { MdAlternateEmail, MdOutlineEmail } from "react-icons/md";
import { IoKeyOutline } from "react-icons/io5";
import { FaRegEyeSlash , FaRegEye} from "react-icons/fa";
import { CiLock, CiUnlock } from "react-icons/ci";

export default function InputBox({ name, type, id, value, placeholder , disable = false}) {
  const renderIcon = () => {
    if (name == "fullName") return <FaRegUser className="input-icon" />;
    if (name === "email") return <MdOutlineEmail className="input-icon" />;
    if (name === "password") return <IoKeyOutline className="input-icon" />;
    if (name == "currentPassword") return <CiUnlock className="input-icon"/> 
    if (name == "newPassword") return <CiLock className="input-icon"/>
    if (name == "username") return <MdAlternateEmail className="input-icon"/>

    return null;
  };

  // change password visibility
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className="relative w-[100%] mb-4">
      <input
        name={name}
        placeholder={placeholder}
        type={
          type == "password" ? (passwordVisible ? "text" : "password") : type
        }
        defaultValue={value}
        id={id}
        className="input-box"
        disabled={disable}
      />
      {renderIcon()}

      {type === "password" && (
        <>
          {passwordVisible ? (
            <FaRegEye
              className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-500 cursor-pointer"
              onClick={() => setPasswordVisible(false)}
            />
          ) : (
            <FaRegEyeSlash
              className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-500 cursor-pointer"
              onClick={() => setPasswordVisible(true)}
            />
          )}
        </>
      )}
    </div>
  );
}

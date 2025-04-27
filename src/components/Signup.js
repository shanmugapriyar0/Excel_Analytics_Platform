import React, { useEffect, useState } from "react";
import Image from "../assets/login.png";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
const Signup = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/");
  };
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-main">
      <div className="login-left">
        <img src={Image} alt="" />
      </div>
      <div className="login-right">
        <div className="login-right-container">
          <div className="login-center">
            <h2>Welcome!</h2>
            <p>Please enter your details</p>
            <form>
              <input type="text" placeholder="Username" />
              <input type="email" placeholder="Email" />
              <div className="pass-input-div">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                />
                {showPassword ? (
                  <FaEyeSlash
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  />
                ) : (
                  <FaEye
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  />
                )}
              </div>

              <div className="login-center-options"></div>
              <div className="login-center-buttons">
                <button type="button">Sign Up</button>
              </div>
              <br></br>
              <p className="login-bottom-p">
                have an account?
                <a onClick={handleClick} className="navigation-button">
                  login
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

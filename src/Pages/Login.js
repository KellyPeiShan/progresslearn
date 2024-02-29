import {React, useState} from "react";
import { useCookies } from "react-cookie";
import {useNavigate} from "react-router-dom";
import Typewriter from "typewriter-effect";
import usernameicon from './usernameicon.png';
import passwordicon from './Lock.png';

export default function Login () {

    return (
        <div className="login-page">
            <div className="login-box">
            <h1 style={{fontSize:"50px"}}>Welcome to ProgressLearn</h1>
            <h2 className="fade-in-word" style={{fontSize:"30px"}}><span>Learn</span> . <span>Master</span> . <span>Progress</span></h2>

            <br></br>
            <form className="login-form">
                <img src={usernameicon} className="icon" alt="Username"/>
                <input type="text" placeholder="    Username"></input>
                <br></br><br></br>
                <img src={passwordicon} className="icon" alt="Password" />
                <input type="password" placeholder="    Password"></input>
                <br></br><br></br><br></br>
                <button className="login-btn">LOGIN</button>
            </form>
            <p style={{position:"relative",left:"1%"}}>New to ProgressLearn? <a href="/SignUp">Sign Up</a></p>
            </div>
        </div>
    );
  
  };
  
import {React, useState} from "react";
import { useCookies } from "react-cookie";
import {useNavigate} from "react-router-dom";
import Typewriter from "typewriter-effect";
import learn from "./learnpng.png";

export default function SignUp () {

    return (
        <div style={{display:"flex",overflow:"hidden"}}>
            <div className="signupleft">
                <h1 style={{fontSize:"45px",marginTop:"9%"}}>Sign Up</h1>
                <br></br>
                <form>
                <label className="signuplabel">
                    Full Name:<br></br>
                    <input type="text" className="signupinput"/>
                    <br></br>
                </label>
                <br></br>
                <label className="signuplabel">
                    Username:<br></br>
                    <input type="text" className="signupinput"/>
                    <br></br>
                </label>
                <br></br>
                <label className="signuplabel">
                    Password:<br></br>
                    <input type="password" className="signupinput"/>
                    <br></br>
                </label>
                <br></br>
                <label className="signuplabel">
                    Confirm Password:<br></br>
                    <input type="password" className="signupinput"/>
                    <br></br>
                </label>
                <br></br>
                <label className="signuplabel">
                    I am a:<br></br>
                    <select name="acctype" style={{width:"10vw",height:"35px",fontSize:"15px"}}>
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                    </select>
                    <br></br>
                </label>
                <br></br><br></br>
                <button className="registerbtn">Register</button>
                </form>
                <p>Already have an account? <a href="/">Login</a></p>
            </div>
            <div className="signupright">
                <div className="embark">
                <Typewriter
                onInit={(typewriter) => {
                    typewriter.changeDelay(25).typeString("Embark on your learning journey").start();
                }}/>
                </div>
                <img src={learn} style={{width:"500px",height:"350px",position:"absolute",left:"40%",top:"60%"}}></img>
            </div>
        </div>
    );
  
  };
  
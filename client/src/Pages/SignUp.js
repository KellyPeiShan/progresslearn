import {React, useState} from "react";
import { useCookies } from "react-cookie";
import {useNavigate} from "react-router-dom";
import Typewriter from "typewriter-effect";
import learn from "./learnpng.png";

export default function SignUp () {

    const [formData, setFormData] = useState({
        fullname: '',
        username: '',
        password: '',
        field: '',
        type:'student',
    });

    const [confirmPassword, setConfirmPassword] = useState('');
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
          }
        try {
        const response = await fetch('http://localhost:5000/signup', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (!response.ok) {
            // Server responded with an error message
            alert(data.error);
        } else {
            // Sign-up successful
            alert(data.message);
            // Optionally, redirect to a different page
        }
    } catch (error) {
        console.error('Error:', error);
        // Handle network or server errors
        alert('An error occurred. Please try again later.');
    }
    };

    return (
        <div style={{display:"flex",overflow:"hidden"}}>
            <div className="signupleft">
                <h1 style={{fontSize:"45px",marginTop:"9%"}}>Sign Up</h1>
                <br></br>
                <form onSubmit={handleSubmit}>
                <label className="signuplabel">
                    Full Name:<br></br>
                    <input type="text" className="signupinput" name="fullname" value={formData.fullname} onChange={handleChange} required maxLength="50"/>
                    <br></br>
                </label>
                <br></br>
                <label className="signuplabel">
                    Username:<br></br>
                    <input type="text" className="signupinput" name="username" value={formData.username} onChange={handleChange} required maxLength="50"/>
                    <br></br>
                </label>
                <br></br>
                <label className="signuplabel">
                    Password:<br></br>
                    <input type="password" className="signupinput" name="password" value={formData.password} onChange={handleChange} required maxLength="50"/>
                    <br></br>
                </label>
                <br></br>
                <label className="signuplabel">
                    Confirm Password:<br></br>
                    <input type="password" className="signupinput" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required maxLength="50"/>
                    <br></br>
                </label>
                <br></br>
                <label className="signuplabel">
                    Field of Interest:<br></br>
                    <input type="text" className="signupinput" name="field" value={formData.field} onChange={handleChange} maxLength="50"/>
                    <br></br>
                </label>
                <br></br>
                <label className="signuplabel">
                    I am a:<br></br>
                    <select name="type" value={formData.type} onChange={handleChange} style={{width:"10vw",height:"35px",fontSize:"15px"}}>
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                    </select>
                    <br></br>
                </label>
                <br></br><br></br>
                <button className="registerbtn" type="submit">Register</button>
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
  
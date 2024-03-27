import {React, useState} from "react";
import { useCookies } from "react-cookie";
import {useNavigate} from "react-router-dom";
import usernameicon from '../Images/usernameicon.png';
import passwordicon from '../Images/Lock.png';

export default function Login () {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [cookies, setCookie] = useCookies(['token']);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (!response.ok) {
                // Login failed
                alert(data.error);
            } else {
                // Login successful
                alert(data.message);
                // Store the token in cookies
                setCookie('token', data.token, { path: '/' });
                // Redirect to a different page
                if(data.type === 'student'){
                    navigate('/StudentHome');
                }
                else{
                    navigate('/InstructorHome');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            // Handle network or server errors
            alert('An error occurred. Please try again later.');
        }
    };


    return (
        <div className="login-page">
            <div className="login-box">
            <h1 style={{fontSize:"50px"}}>Welcome to ProgressLearn</h1>
            <h2 className="fade-in-word" style={{fontSize:"30px"}}><span>Learn</span> . <span>Master</span> . <span>Progress</span></h2>

            <br></br>
            <form className="login-form" onSubmit={handleSubmit}>
                <img src={usernameicon} className="icon" alt="Username"/>
                <input type="text" placeholder="     Username" value={username} onChange={(e) => setUsername(e.target.value)}></input>
                <br></br><br></br>
                <img src={passwordicon} className="icon" alt="Password" />
                <input type="password" placeholder="     Password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
                <br></br><br></br><br></br>
                <button className="login-btn" type="submit">LOGIN</button>
            </form>
            <p style={{position:"relative",left:"1%"}}>New to ProgressLearn? <a href="/SignUp">Sign Up</a></p>
            </div>
        </div>
    );
  
  };
  
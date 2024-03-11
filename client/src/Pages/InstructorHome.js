import {React, useState, useEffect} from "react";
import { useCookies } from "react-cookie";
import {useNavigate} from "react-router-dom";
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import CourseComponent from "../Components/CourseComponent";

export default function InstructorHome () {

    const navigate = useNavigate();

    const [fullname, setFullName] = useState('');
    const [courses, setCourses] = useState([]);
    const [cookies] = useCookies(['token']);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch(`http://localhost:5000/instructorinfo`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${cookies.token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setFullName(data.fullname); //set user info received from server
                    setCourses(data.courses);//set course info received from server
                } else {
                    console.error('Error fetching user information:', data.error);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchUserInfo();
    }, [cookies.token]);

    //logout function
    const handleLogout = () => {
        //ask for confirmation
        const confirmed = window.confirm('Are you sure you want to log out?');
        if(confirmed){
            // Clear the authentication token cookie
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
            // Redirect to logout endpoint or any other logout actions
            navigate('/'); // Redirect to login page
        }
    };

    return (
        <div>
            <div className="home-header" >
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{paddingTop:"2%",paddingLeft:"5%"}}>
                        <h1 >Welcome, instructor {fullname}</h1>
                    </div>
                    <div className="logout" style={{top:"2%"}}>
                        <Tooltip title="Logout">
                        <IconButton onClick={handleLogout}>
                            <LogoutIcon style={{ color: "#8339ED", fontSize: "40px" }}/>
                        </IconButton>
                        </Tooltip>
                    </div>
                </div>
            </div>
            {/* List of instructor's course */}
            <div className="homepagediv">
                <p style={{fontSize:"25px", fontWeight:"500"}}>My Courses</p>
                <div className="flexcourselist">
                    {courses.map(course => (
                     <CourseComponent key={course.course_id} course={course} />
                    ))}
                </div>
            </div>
        </div>
    );
};
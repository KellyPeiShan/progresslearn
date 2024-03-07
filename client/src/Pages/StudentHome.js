import {React, useState, useEffect} from "react";
import { useCookies } from "react-cookie";
import {useNavigate} from "react-router-dom";
import TextField from "@mui/material/TextField";
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import businessimg from '../Images/business.png';
import artimg from '../Images/art.png';
import languageimg from '../Images/language.png';
import scienceimg from '../Images/science.png';
import computingimg from '../Images/computing.png';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function LinearProgressWithLabel({ course }) {
    const percentage = (course.progress / course.max_progress) * 100;
    return (
        <div>
            <p>{course.course_title}</p>
            <Box sx={{ display: 'flex', alignItems: 'center'}}>
                <Box sx={{ width: '100%', mr: 1, borderRadius:30, overflow:'hidden'}}>
                    <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        sx={{
                            height: 10, // Adjust the height of the progress bar
                            bgcolor: '#F1EBFA', // Background color of the progress bar
                            '& .MuiLinearProgress-bar': {
                                bgcolor: '#8339ED', // Color of the progress bar
                                borderRadius: 5, // Border radius of the progress bar
                            },
                        }}
                    />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">{`${Math.round(percentage)}%`}</Typography>
                </Box>
            </Box>
        </div>
    );
}

const CourseComponent = ({ course }) => {
    let courseImage = '';

    // Determine image based on course field
    switch (course.course_field) {
        case 'business':
            courseImage = businessimg; 
            break;
        case 'art':
            courseImage = artimg; 
            break;
        case 'language':
            courseImage = languageimg;
            break;
        case 'science':
            courseImage = scienceimg; 
            break;
        case 'computing':
            courseImage = computingimg;
            break;
    }

    return ( 
     <div className="coursecomponent">
        <img src={courseImage} width="300px" height="120px"></img>
        <p className="coursetitle">{course.course_title}</p>
     </div>
    );
  };

export default function StudentHome () {

    const navigate = useNavigate();

    //for user info
    const [fullname, setFullName] = useState('');
    const [cookies] = useCookies(['token']);
    const [courses, setCourses] = useState([]);

    //for searchbar
    const [inputText, setInputText] = useState("");
    let inputHandler = (e) => {
      //convert input text to lower case
      var lowerCase = e.target.value.toLowerCase();
      setInputText(lowerCase);
    };

    //fetch student info
    useEffect(() => {
        const fetchStudentInfo = async () => {
            try {
                const response = await fetch(`http://localhost:5000/studentinfo`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${cookies.token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setFullName(data.fullname); //set user info received from server
                    setCourses(data.courses);
                } else {
                    console.error('Error fetching user information:', data.error);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchStudentInfo();
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
                        <h1 >Welcome, {fullname}</h1>
                    </div>
                    <div className="logout">
                        <Tooltip title="Logout">
                        <IconButton onClick={handleLogout}>
                            <LogoutIcon style={{ color: "#8339ED", fontSize: "40px" }}/>
                        </IconButton>
                        </Tooltip>
                    </div>
                </div>
                <TextField
                    onChange={inputHandler}
                    variant="outlined"
                    label="Search for new courses"
                    style={{backgroundColor:"white", width:"90%", marginLeft:"5%",marginBottom:"2%"}}
                    size="small"
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                        ),
                        }}
                    />
            </div>
            {/* List of student's course */}
            <div className="homepagediv">
                <p style={{fontSize:"25px", fontWeight:"500"}}>My Courses</p>
                <div className="courselist">
                    {courses.map(course => (
                     <CourseComponent key={course.course_id} course={course} />
                    ))}
                </div>
            </div>
            {/* List of Student's Progress */}
            <div className="homepagediv">
                <p style={{fontSize:"25px", fontWeight:"500"}}>Overall Progress</p>       
                <div>
                    {courses.map(course => (
                        <Box sx={{ width: '70%' }}>
                        <LinearProgressWithLabel course={course}/>
                        </Box>
                     ))}
                </div>
            </div>
        </div>
    );
};
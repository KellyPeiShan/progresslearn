import {React, useState, useEffect} from "react";
import { useCookies } from "react-cookie";
import {useNavigate} from "react-router-dom";
import TextField from "@mui/material/TextField";
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import waveimg from '../Images/wave.png'
import Modal from '@mui/material/Modal';
import CourseComponent from "../Components/CourseComponent";
import boxStyle from "../Components/boxstyle";

//student progress component
function LinearProgressWithLabel({ course }) {
    var percentage;
    if(course.max_progress === 0){
        percentage = 0;
    }else{
    percentage = (course.progress / course.max_progress) * 100;
    }
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

export default function StudentHome () {

    const navigate = useNavigate();

    //for user info
    const [fullname, setFullName] = useState('');
    const [cookies] = useCookies(['token']);
    const [courses, setCourses] = useState([]);

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

    //for searchbar
    const [inputText, setInputText] = useState("");
    const [searchSubmitted, setSearchSubmitted] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    let inputHandler = (e) => {
      //convert input text to lower case
      var lowerCase = e.target.value.toLowerCase();
      setInputText(lowerCase);
    };
    //search query
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSearchSubmitted(true); // Set search submitted flag
        try {
            // Perform search based on input text
            const response = await fetch(`http://localhost:5000/searchCourses?query=${inputText}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cookies.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                // Set search results
                setSearchResults(data.results);
            } else {
                console.error('Error fetching search results:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    //back to my course 
    const handleBack = () => {
        setSearchSubmitted(false);
    }

    //for enrollment
    const [showModal, setShowModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const handleCourseClick = (course) => {
        setSelectedCourse(course);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCourse(null);
    };

    const handleEnroll = async (courseId) => {
        try {
          const response = await fetch('http://localhost:5000/enroll', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cookies.token}`
            },
            body: JSON.stringify({ courseId })
          });
          const data = await response.json();
          if (response.ok) {
            alert(data.message); // Enrollment successful
            handleCloseModal();//close modal
            window.location.reload();
          } else {
            alert(data.error); // Error message from backend
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred. Please try again later.');
        }
      };

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
                <form onSubmit={handleSubmit}>
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
                </form>
            </div>
            {/* Conditional rendering based on whether search is submitted */}
            {searchSubmitted ? (
             <div className="homepagediv">
                <p style={{ fontSize: "25px", fontWeight: "500" }}>Search Results&nbsp;&nbsp;&nbsp;<u onClick={handleBack} style={{fontSize:"15px", color:"#8339ED"}}>Back to My Courses</u></p>
                <div className="flexcourselist">
                    {searchResults.map(result => (
                        <><CourseComponent key={result.course_id} course={result}  onCourseClick={handleCourseClick}/></>
                    ))}
                </div>
                {showModal && selectedCourse && (
                <Modal open={showModal} onClose={handleCloseModal}>
                    <Box sx={boxStyle}>
                    <h2 style={{margin:'0px', borderBottom:'1px solid black'}}>{selectedCourse.course_title}</h2>
                    <p>{selectedCourse.description}</p>
                    <button onClick={() => handleEnroll(selectedCourse.course_id)} className="purplebtnstyle" style={{width:"30%", marginLeft:"33%", marginTop:"10px"}}>Enroll</button>
                    </Box>
                </Modal>
            )}
             </div>
         ) : (
            <div>
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
            )}

             {/* Image sticky at the bottom right */}
            <div id="waveimg">
                <img src={waveimg} alt="Wave" style={{ width: '300px', height: '150px' }} />
            </div>
        </div> 
    );
};
import {React, useState, useEffect} from "react";
import { useCookies } from "react-cookie";
import {useNavigate} from "react-router-dom";
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import CourseComponent from "../Components/CourseComponent";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import boxStyle from "../Components/boxstyle";

export default function InstructorHome () {

    const navigate = useNavigate();

    //for instructor info
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

    //for add new course
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        field: 'art' // Default value
      });

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('http://localhost:5000/createCourse', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cookies.token}`
            },
            body: JSON.stringify(formData)
          });
          const data = await response.json();
          if (response.ok) {
            alert(data.message); // Course created successfully
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
                <div style={{display:'flex'}}>                
                    <p style={{fontSize:"25px", fontWeight:"500"}}>My Courses</p>
                    <button className="blendbtn" style={{marginTop: '1.7%', marginLeft: '2%'}} onClick={()=>setShowModal(true)}>Add Course</button>
                </div>
                <div className="flexcourselist">
                    {courses.map(course => (
                     <CourseComponent key={course.course_id} course={course} onCourseClick={()=> navigate(`/Instructor/Dashboard/Course/${course.course_id}`)}/>
                    ))}
                </div>
                <Modal open={showModal} onClose={handleCloseModal}>
                    <Box sx={boxStyle}>
                        <h2 style={{marginTop:'0px'}}>Add New Course</h2>
                        <form className="newcourseform" onSubmit={handleSubmit}>
                            <label>Course Title:&nbsp;
                                <input type="text" name="title" maxLength="100" value={formData.title} onChange={handleChange} required/>
                            </label><br></br><br></br>
                            <label>Course Description:&nbsp;
                                <input type="text" name="description" maxLength="500" value={formData.description} onChange={handleChange} required/>
                            </label><br></br><br></br>
                            <label>Course Field:&nbsp;
                                <select name="field" style={{width:"30%"}} value={formData.field} onChange={handleChange}>
                                    <option value="art">Art</option>
                                    <option value="business">Business</option>
                                    <option value="computing">Computing</option>
                                    <option value="language">Language</option>
                                    <option value="science">Science</option>
                                </select>
                            </label><br></br>
                            <button type="submit" className="blendbtn" style={{marginLeft:'44%',marginTop:'8%'}}>Add</button>
                        </form>
                    </Box>
                </Modal>
            </div>
        </div>
    );
};
import {React, useState, useEffect} from "react";
import { useCookies } from "react-cookie";
import {useNavigate, useParams} from "react-router-dom";
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import boxStyle from "../Components/boxstyle";
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';


export default function StudentDashboard () {
    const navigate = useNavigate();
    //get user id from token
    const [cookies] = useCookies(['token']);
    //get course id from url
    const { id } = useParams();
    //store course info
    const [course, setCourse] = useState('');
    //fetch course info
    useEffect(() => {
        // Fetch course info using course id
        fetch(`http://localhost:5000/courseinfo/${id}`)
          .then(response => response.json())
          .then(data => {
            setCourse(data);
          })
          .catch(error => {
            console.error('Error fetching course:', error);
            // Handle error
          });
      }, [id]); // Execute the effect whenever id changes

    //for fetch topic info
    const [topics, setTopics] = useState([]);

    useEffect(() => {
        // Fetch topics for the given course ID
        fetch(`http://localhost:5000/studenttopics/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${cookies.token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch topics');
            }
            return response.json();
        })
        .then(data => {
            setTopics(data);
        })
        .catch(error => {
            console.error('Error fetching topics:', error);
        });
    }, [id, cookies.token]);
    

    //topic component
    const TopicComponent = ({ topic , isLast  }) => {
      
        return (
          <div className="whitebox" style={{ padding: '10px', display: 'flex', marginBottom: '10px' }}>
            <div style={{ width: '91%' }}>
              <h3>{topic.topic_title}</h3>
              <h4>Learning Material:</h4>
              {topic.materials.map(material => (
                <div key={material.tm_id} style={{marginBottom:"5px"}}>
                  <button className="filedlbtn" onClick={() => downloadFile(material.file.file_id, material.file.file_name)}>
                    {material.file.file_name}
                  </button>
                </div>
              ))}
              <div style={{display:'flex'}}>
              <h4 style={{marginRight:'1%'}}>Quiz:</h4>
              {topic.quiz_count === 0 ? (
                    <p style={{marginTop:'2%'}}>No Quiz have been created for this topic.</p>
                ) : (
                    isLast ? (
                        <button className="blendbtn" style={{marginTop:'1.6%'}} onClick={()=>navigate(`/Student/TakeQuiz/${id}/${topic.topic_id}`)}>Take Quiz</button>
                      ) : (
                        <p style={{marginTop:'2%'}}>You have scored {topic.quizResult.score}% for this quiz</p>
                      )
                )}
              </div>
            </div> 
          </div>
        );
      };

      //endpoint for file download
      const downloadFile = async (fileId, fileName) => {
        try {
          const response = await fetch(`http://localhost:5000/downloadFile/${fileId}`);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        } catch (error) {
          console.error('Error downloading file:', error);
        }
      };
    
    //for fetching additional materials
    const [additionalmaterials,setAdditionalMaterials] = useState([]);

    //get additional material
    useEffect(() => {
      // Fetch additional material for the given course ID
      fetch(`http://localhost:5000/getAM/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch additional materials');
          }
          return response.json();
        })
        .then(data => {
          setAdditionalMaterials(data);
        })
        .catch(error => {
          console.error('Error fetching additional materials:', error);
        });
    }, [id]);

    //get student progress by course
    const [progress, setProgress] = useState('');
    var percentage;
    if(progress.max_progress === 0){
        percentage = 0;
    }else{
    percentage = (progress.progress / progress.max_progress) * 100;
    }

    useEffect(() => {
        // Fetch topics for the given course ID
        fetch(`http://localhost:5000/studentProgress/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${cookies.token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch progress');
            }
            return response.json();
        })
        .then(data => {
            setProgress(data);
        })
        .catch(error => {
            console.error('Error fetching progress:', error);
        });
    }, [id, cookies.token]);

    //for give feedback
    const [feedbackmodal, setFeedbackModal] = useState(false);
    const [feedback, setFeedback] = useState('');

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to submit this feedback?')) {
            try {
            const response = await fetch(`http://localhost:5000/submitFeedback/${id}`, {
                method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${cookies.token}` // Assuming you have access to cookies
                    },
                    body: JSON.stringify({feedback})
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message); // Log success message
                setFeedbackModal(false);//close feedback modal
            } else {
                console.error(data.error); // Log error message
            }
            } catch (error) {
            console.error('Error submit feedback:', error); // Log any fetch errors
            }
        }
      };

    return (
        <div>
            <div className="home-header" style={{paddingBottom:'5px'}}>
            <a href="/StudentHome" className="backbtn">&lt; Back</a>
               <div  style={{paddingTop:"4%",paddingLeft:"10%",width:"80%"}}>
                <h1 className="linecoursetitle">{course.course_title}</h1>
               </div>
            </div>
            <div className="dashboarddiv">
            <Box sx={{ display: 'flex', alignItems: 'center'}}>
            <h3 style={{marginRight:'2%'}}>Progress:</h3>
                <Box sx={{ width: '90%', mr: 1, borderRadius:30, overflow:'hidden'}}>
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
            <div>
                {/* Announcement */}
                <div className="dashboarddiv">
                    <h2 className="dashboardheader"><u>Announcement</u></h2>
                    <div className="whitebox" style={{height:'200px',overflowY: 'scroll', padding:'10px',display:'flex'}}>
                    <p style={{ width: '92%' }}>
                    {course.announcement === null || course.announcement === '' ? 'There is no announcement at the moment.' : course.announcement}
                    </p>
                    </div>
                </div>
                {/* Topics */}
                <div className="dashboarddiv">
                    <div style={{display:'flex'}}>
                    <h2 className="dashboardheader"><u>Learning Path</u></h2>
                    <button className="blendbtn" style={{marginTop: '1.7%', marginLeft: '2%'}} onClick={()=>setFeedbackModal(true)}>Give Feedback</button>
                    </div>
                    <div>
                    {topics.slice(0, progress.progress+1).map((topic,index) => (
                        <TopicComponent key={topic.id} topic={topic} isLast={index === topics.slice(0, progress.progress+1).length - 1} />
                    ))}
                    </div>
                    <Modal open={feedbackmodal} onClose={()=>setFeedbackModal(false)}>
                      <Box sx={boxStyle}>
                          <h2 style={{marginTop:'0px'}}>Give Feedback</h2>
                          <form>
                              <textarea name="announcement" rows="4" cols="50" maxLength='1000' onChange={e => setFeedback(e.target.value)}></textarea><br></br><br></br>
                              <button className='blendbtn' type="submit" style={{marginLeft:'43%'}} onClick={handleSubmitFeedback}>Done</button>
                          </form>
                      </Box>
                  </Modal>
                </div>
                {/* Additional Material */}
                <div className="dashboarddiv">
                    <h2 className="dashboardheader"><u>Additional Material</u></h2>
                    <div className="whitebox" style={{minHeight:'200px', padding:'10px',display:'flex', paddingTop:'20px'}}>
                    <div style={{width:"91%"}}>
                        {additionalmaterials.map(material => (
                        <div key={material.am_id} style={{marginBottom:"5px"}}>
                            <button className="filedlbtn" onClick={() => downloadFile(material.file.file_id, material.file.file_name)}>
                            {material.file.file_name}
                            </button>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
            </div>
         </div>
    );
};
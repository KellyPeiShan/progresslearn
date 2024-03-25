import {React, useState, useEffect} from "react";
import { useCookies } from "react-cookie";
import {useNavigate, useParams} from "react-router-dom";
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import boxStyle from "../Components/boxstyle";


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
    }, [id, cookies.token]); // Include cookies.token in the dependency array
    

    //topic component
    const TopicComponent = ({ topic }) => {
      
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
                    <p>No Quiz have been created for this topic.</p>
                ) : (
                    <p>You have scored {topic.quizResult ? topic.quizResult.score : 'N/A'} for this quiz</p>
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


    return (
        <div>
            <div className="home-header" >
            <a href="/StudentHome" className="backbtn">&lt; Back</a>
               <div  style={{paddingTop:"4%",paddingLeft:"10%",width:"80%"}}>
                <h1 className="linecoursetitle">{course.course_title}</h1>
               </div>
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
                    <h2 className="dashboardheader"><u>Topic</u></h2>
                    <button className="blendbtn" style={{marginTop: '1.7%', marginLeft: '2%'}}>Give Feedback</button>
                    </div>
                    <div>
                        {topics.map(topic => (
                            <TopicComponent key={topic.id} topic={topic} />
                        ))}
                    </div>
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
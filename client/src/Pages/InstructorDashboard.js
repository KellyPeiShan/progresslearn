import {React, useState, useEffect} from "react";
import { useCookies } from "react-cookie";
import {useNavigate, useParams} from "react-router-dom";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import boxStyle from "../Components/boxstyle";
import InstructorProgress from "../Components/InstructorProgress";
import InstructorPerformance from "../Components/InstructorPerformance";
import InstructorFeedback from "../Components/InstructorFeedback";

export default function InstructorDashboard () {
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

    //for tab
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    //for add topic
    const [addtopicmodal, setAddTopicModal] = useState(false);

    const [title, setTitle] = useState('');
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles); // Set the selected files directly, replacing the previous files
  };
    //end point for adding topic
    const handleAddTopic = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        files.forEach(file => {
            formData.append('files', file);
        });         

        try {
            const response = await fetch(`http://localhost:5000/addTopic/${id}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message); // Topic added successfully
                window.location.reload();//reload the page
            } else {
                alert(data.error); // Error message from backend
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    };

    //for fetch topic info
    const [topics, setTopics] = useState([]);

    useEffect(() => {
      // Fetch topics for the given course ID
      fetch(`http://localhost:5000/topics/${id}`)
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
    }, [id]);

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
              {topic.quiz_count === 0? 
              <button className="blendbtn" style={{marginTop:'1.5%'}}>Add Quiz</button> : <p>You have created a quiz for this topic.</p>}
              </div>
            </div>
            <Tooltip title="Edit">
              <IconButton style={{ height: '35px', marginLeft: '3%' }} onClick={()=>{setTargetTopic(topic);setTMmodal(true);}}>
                <EditIcon style={{ color: 'lightgrey', fontSize: '33px' }} />
              </IconButton>
            </Tooltip>   
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

      //for edit topic material
      const [TMmodal,setTMmodal] = useState(false);
      const [targettopic,setTargetTopic] = useState(null);

      //add topic material
      const handleAddTopicMaterial = async (e,topicId) => {
        e.preventDefault();
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch(`http://localhost:5000/addTM/${topicId}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message); // Topic material added successfully
                window.location.reload();//reload page
            } else {
                alert(data.error); // Error message from backend
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    };

     //delete topic material
     const handleDeleteTopicMaterial = (materialId) => {
      if (window.confirm('Are you sure you want to delete this material?')) {
        fetch(`http://localhost:5000/deleteTM/${materialId}`, {
          method: 'DELETE',
        })
        .then(response => {
          if (response.ok) {
            // Remove the DOM element
            const element = document.getElementById('tm_'+ materialId);
            if (element) {
              element.remove();
            }            
          } else {
            console.error('Failed to delete material:', response.statusText);
          }
        })
        .catch(error => {
          console.error('Error deleting material:', error);
        });
      }
    };

      //for edit additional material
      const [AMmodal,setAMmodal]= useState(false);
      const [additionalmaterials,setAdditionalMaterials] = useState([]);

      //add additional material
      const handleAddAdditionalMaterial = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch(`http://localhost:5000/addAM/${id}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message); // Additional material added successfully
                window.location.reload();//reload page
            } else {
                alert(data.error); // Error message from backend
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    };

    //get additional material
    useEffect(() => {
      // Fetch topics for the given course ID
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

    //delete additional material
    const handleDeleteAdditionalMaterial = (materialId) => {
      if (window.confirm('Are you sure you want to delete this material?')) {
        fetch(`http://localhost:5000/deleteAM/${materialId}`, {
          method: 'DELETE',
        })
        .then(response => {
          if (response.ok) {
            // Remove the DOM element
            const element = document.getElementById('am_'+ materialId);
            if (element) {
              element.remove();
            }            
          } else {
            console.error('Failed to delete material:', response.statusText);
          }
        })
        .catch(error => {
          console.error('Error deleting material:', error);
        });
      }
    };

    //for edit announcement
    const [announcementmodal,setAnnouncementModal] = useState(false);
    const [announcement,setAnnouncement] = useState('');

    const handleUpdateAnnouncement = async () => {
      try {
        const response = await fetch(`http://localhost:5000/updateAnnouncement/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ announcement })
        });
        const data = await response.json();
        if (response.ok) {
          console.log(data.message); // Log success message
          window.location.reload();
        } else {
          console.error(data.error); // Log error message
        }
      } catch (error) {
        console.error('Error update announcement:', error); // Log any fetch errors
      }
    };


    return (
        <div>
            <div className="home-header" >
            <a href="/InstructorHome" className="backbtn">&lt; Back</a>
               <div  style={{paddingTop:"4%",paddingLeft:"10%",width:"80%"}}>
                <h1 className="linecoursetitle">{course.course_title}</h1>
                <Tabs
                        value={value}
                        onChange={handleChange}
                        centered
                        textColor="none"
                        sx={{
                            "& .MuiTabs-indicator": {
                                backgroundColor: "#8339ED",
                            },
                            "& .MuiTab-root": {
                                minWidth: "25%",
                            },
                            "& .Mui-selected": {
                                color: "#8339ED", 
                            },
                        }}                    >
                        <Tab label="Dashboard" value={0}/>
                        <Tab label="Progress" value={1}/>
                        <Tab label="Performance" value={2}/>
                        <Tab label="Feedback" value={3}/>
                    </Tabs>
               </div>
            </div>
            {/* When Dashboard Tab is selected */}
            {value === 0 &&
            <div>
              {/* Announcement */}
              <div className="dashboarddiv">
                  <h2 className="dashboardheader"><u>Announcement</u></h2>
                  <div className="whitebox" style={{height:'200px',overflowY: 'scroll', padding:'10px',display:'flex'}}>
                    <p style={{ width: '92%' }}>
                    {course.announcement === null || course.announcement === '' ? 'There is no announcement at the moment.' : course.announcement}
                    </p>
                    <Tooltip title="Edit">
                        <IconButton style={{height:'35px',marginLeft:'3%'}} onClick={()=>setAnnouncementModal(true)}>
                            <EditIcon style={{ color: "lightgrey", fontSize: "33px" }}/>
                        </IconButton>
                    </Tooltip>
                    <Modal open={announcementmodal} onClose={()=>setAnnouncementModal(false)}>
                      <Box sx={boxStyle}>
                          <h2 style={{marginTop:'0px'}}>Edit Announcement</h2>
                          <form>
                              <textarea name="announcement" rows="4" cols="50" maxLength='1000' onChange={e => setAnnouncement(e.target.value)}>{course.announcement}</textarea><br></br><br></br>
                              <button className='blendbtn' type="submit" style={{marginLeft:'43%'}} onClick={handleUpdateAnnouncement}>Done</button>
                          </form>
                      </Box>
                  </Modal>
                  </div>
              </div>
              {/* Topics */}
              <div className="dashboarddiv">
                  <div style={{display:'flex'}}>
                  <h2 className="dashboardheader"><u>Topic</u></h2>
                  <button className="blendbtn" style={{marginTop: '1.7%', marginLeft: '2%'}} onClick={()=>setAddTopicModal(true)}>Add Topic</button>
                  </div>
                  <Modal open={addtopicmodal} onClose={()=>setAddTopicModal(false)}>
                      <Box sx={boxStyle}>
                          <h2 style={{marginTop:'0px'}}>Add Topic</h2>
                          <form onSubmit={handleAddTopic}>
                              <label>Topic Title:</label>
                              <input style={{marginLeft:'4%', width:'70%'}} type="text" value={title} onChange={(e) => setTitle(e.target.value)} required /><br></br><br></br>
                              <label>Upload File:</label>
                              <input style={{marginLeft:'2%'}} type="file" name='files' onChange={handleFileChange} multiple required /><br></br><br></br>
                              <button className='blendbtn' type="submit" style={{marginLeft:'45%'}}>Add</button>
                          </form>
                      </Box>
                  </Modal>
                  <div>
                      {topics.map(topic => (
                          <TopicComponent key={topic.id} topic={topic} />
                      ))}
                      {TMmodal && targettopic && (
                        <Modal open={TMmodal} onClose={()=>{setTMmodal(false);setTargetTopic(null);}}>
                          <Box sx={boxStyle}>
                            <h2 style={{marginTop:'0px'}}>Edit Topic Material</h2>
                            <h4>Existing Material:</h4>
                            {targettopic.materials.map(material => (
                              <div id={"tm_"+material.tm_id} key={material.tm_id} style={{marginBottom:"5px",display:'flex', height:'20px'}}>
                                <p style={{marginTop:'0',marginRight:'10px'}}> {material.file.file_name}</p>
                                <button onClick={()=>handleDeleteTopicMaterial(material.tm_id)}>Delete</button>
                              </div>
                            ))}
                            <h4>Add Topic Material:</h4>
                            <form onSubmit={(e)=>handleAddTopicMaterial(e,targettopic.topic_id)}>
                                <input style={{marginLeft:'2%'}} type="file" name='files' onChange={handleFileChange} multiple/><br></br><br></br>
                                <button className='blendbtn' type="submit" style={{marginLeft:'45%'}}>Done</button>
                            </form>
                          </Box>
                      </Modal>
                    )}
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
                    <Tooltip title="Edit">
                        <IconButton style={{height:'35px',marginLeft:'3%'}} onClick={()=>setAMmodal(true)}>
                            <EditIcon style={{ color: "lightgrey", fontSize: "33px" }}/>
                        </IconButton>
                    </Tooltip>
                  </div>
                  <Modal open={AMmodal} onClose={()=>setAMmodal(false)}>
                      <Box sx={boxStyle}>
                          <h2 style={{marginTop:'0px'}}>Edit Additional Material</h2>
                          <h4>Existing Material:</h4>
                          {additionalmaterials.map(material => (
                            <div id={"am_"+material.am_id} key={material.am_id} style={{marginBottom:"5px",display:'flex', height:'20px'}}>
                              <p style={{marginTop:'0',marginRight:'10px'}}> {material.file.file_name}</p>
                              <button onClick={()=>handleDeleteAdditionalMaterial(material.am_id)}>Delete</button>
                            </div>
                          ))}
                          <h4>Add Additional Material:</h4>
                          <form onSubmit={handleAddAdditionalMaterial}>
                              <input style={{marginLeft:'2%'}} type="file" name='files' onChange={handleFileChange} multiple/><br></br><br></br>
                              <button className='blendbtn' type="submit" style={{marginLeft:'45%'}}>Done</button>
                          </form>
                      </Box>
                  </Modal>
              </div>
            </div>
            }
            {/* When Progress Tab is clicked */}
            {value === 1 && <InstructorProgress courseId={id}/>}
            {/* When Performance Tab is clicked */}
            {value === 2 && <InstructorPerformance courseId={id}/>}
            {/* When Feedback Tab is clicked */}
            {value === 3 && <InstructorFeedback courseId={id}/>}
         </div>
    );
};
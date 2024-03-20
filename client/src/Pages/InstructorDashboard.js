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
        setFiles([...files, ...selectedFiles]);
    };

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
                setAddTopicModal(false); // Close modal
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
              <h4>Quiz:</h4>
            </div>
            <Tooltip title="Edit">
              <IconButton style={{ height: '35px', marginLeft: '3%' }}>
                <EditIcon style={{ color: 'lightgrey', fontSize: '33px' }} />
              </IconButton>
            </Tooltip>
          </div>
        );
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
                        <Tab label="Dashboard" />
                        <Tab label="Progress" />
                        <Tab label="Performance" />
                        <Tab label="Feedback" />
                    </Tabs>
               </div>
            </div>
            <div className="dashboarddiv">
                <h2 className="dashboardheader"><u>Announcement</u></h2>
                <div className="whitebox" style={{height:'200px',overflowY: 'scroll', padding:'10px',display:'flex'}}>
                <p style={{ width: '92%' }}>
                {course.announcement === null || course.announcement === '' ? 'There is no announcement at the moment.' : course.announcement}
                </p>
                <Tooltip title="Edit">
                    <IconButton style={{height:'35px',marginLeft:'3%'}}>
                        <EditIcon style={{ color: "lightgrey", fontSize: "33px" }}/>
                    </IconButton>
                </Tooltip>
                </div>
            </div>
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
                </div>
            </div>
        </div>
    );
};
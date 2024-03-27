import {React, useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";

export default function TakeQuiz () {

    const { courseId, topicId } = useParams();
    const [topicname,setTopicName] = useState('');
    const navigate = useNavigate();

    //get topic information
    useEffect(() => {
        // Fetch topic info from backend
        fetch(`http://localhost:5000/topicinfo/${topicId}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch topic information');
            }
            return response.json();
          })
          .then(data => {
            setTopicName(data.topic_title);
          })
          .catch(error => {
            console.error('Error fetching topic information:', error);
          });
      }, [topicId]);

    
    return (
        <div>
           <div className="home-header" >
            <a href={`/Student/Dashboard/Course/${courseId}`} className="backbtn">&lt; Back</a>
               <div  style={{paddingTop:"4%",paddingLeft:"10%",width:"80%",paddingBottom:"0.2%"}}>
                 <h1>Topic: {topicname}</h1>
               </div>
            </div>
            <div className="dashboarddiv">
            <p>Question</p>
            </div>
        </div>
    );
  
  };
  
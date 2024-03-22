import {React, useState, useEffect} from "react";
import { useCookies } from "react-cookie";
import {useNavigate, useParams} from "react-router-dom";

export default function AddQuiz () {

    const {id} = useParams();
    const [topicname,setTopicName] = useState('');

    //get topic information
    useEffect(() => {
        // Fetch topic info from backend
        fetch(`http://localhost:5000/topicinfo/${id}`)
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
      }, [id]);
    
    return (
        <div>
           <div className="home-header" >
            <a onClick={()=>{window.history.back();}} className="backbtn" style={{ textDecoration: 'underline', cursor: 'pointer', color: 'purple' }}>&lt; Back</a>
               <div  style={{paddingTop:"4%",paddingLeft:"10%",width:"80%",paddingBottom:"0.2%"}}>
                 <h1>You are creating quiz for: {topicname}</h1>
                 <h2>Set passing rate:&nbsp;&nbsp;<input type="text" style={{width:"30px",height:"30px"}}></input>&nbsp;%</h2>
                 <h2>Set number of questions:&nbsp;&nbsp;<input type="text" style={{width:"30px",height:"30px"}}></input></h2>
               </div>
            </div>
            <div className="dashboarddiv">
                <h2>Question:</h2>
                <input type="text" placeholder="Question Content" style={{width:"40%",height:'30px'}}/><br></br><br></br>
                <input type="radio" value="1" name="answer"/>&nbsp;<input type="text" placeholder="Selection 1" className="quizinput"/><br></br><br></br>
                <input type="radio" value="2" name="answer"/>&nbsp;<input type="text" placeholder="Selection 2" className="quizinput"/><br></br><br></br>
                <input type="radio" value="3" name="answer"/>&nbsp;<input type="text" placeholder="Selection 3" className="quizinput"/><br></br><br></br>
                <input type="radio" value="4" name="answer"/>&nbsp;<input type="text" placeholder="Selection 4" className="quizinput"/><br></br><br></br>
            </div>
        </div>
    );
  
  };
  
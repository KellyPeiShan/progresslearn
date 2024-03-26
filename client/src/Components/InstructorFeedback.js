import {React, useState, useEffect} from "react";
import { useCookies } from "react-cookie";
import {useNavigate, useParams} from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import boxStyle from "../Components/boxstyle";

const InstructorFeedback = ({ courseId }) => {

  const[feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    // Fetch feedback data from the server
    fetch(`http://localhost:5000/getFeedback/${courseId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch feedback');
        }
        return response.json();
      })
      .then(data => {
        setFeedbacks(data);
      })
      .catch(error => {
        console.error('Error fetching feedback:', error);
      });
  }, [courseId]);

  return(
    <div className="dashboarddiv">
        {feedbacks.map(feedback => (
        <div key={feedback.feedback_id} className="whitebox" style={{ minHeight: '100px', padding: '10px', marginTop: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <p style={{ margin: '0px' }}>{feedback.content}</p>
          <p style={{ margin: '0px', alignSelf: 'flex-end' }}>Feedback from: {feedback.full_name}</p>
        </div>
      ))}
    </div>
  );
};

export default InstructorFeedback;
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

    const [quiz, setQuiz] = useState([]);
    
    //fetch quiz 
    useEffect(() => {
        fetch(`http://localhost:5000/fetchQuiz/${topicId}`)
        .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch quiz');
            }
            return response.json();
          })
        .then(data => {
            setQuiz(data);
        })
        .catch(error => {
            console.error('Error fetching quiz and questions:', error);
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
            {quiz && quiz.questions &&(
            <div className="dashboarddiv">
                <form>
                {quiz.questions.map((question, index) => (
                    <div key={question.question_id}>
                    <h3>{index + 1}. {question.question}</h3>
                    <label>
                        <input type="radio" name={`question_${index}`} value={question.selection_1} />
                        {question.selection_1}
                    </label><br /><br />
                    <label>
                        <input type="radio" name={`question_${index}`} value={question.selection_2} />
                        {question.selection_2}
                    </label><br /><br />
                    <label>
                        <input type="radio" name={`question_${index}`} value={question.selection_3} />
                        {question.selection_3}
                    </label><br /><br />
                    <label>
                        <input type="radio" name={`question_${index}`} value={question.selection_4} />
                        {question.selection_4}
                    </label>
                    </div>
                ))}
                </form>
            </div>
            )}
        </div>
    );
  
  };
  
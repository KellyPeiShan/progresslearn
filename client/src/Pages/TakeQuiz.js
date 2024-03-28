import {React, useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import { useCookies } from "react-cookie";

// Lehmer random number generator function
function lehmerRandom(seed) {
  return function() {
    seed = (seed * 48271) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export default function TakeQuiz () {

    const { courseId, topicId } = useParams();
    const [topicname,setTopicName] = useState('');
    const navigate = useNavigate();
     //get user id from token
     const [cookies] = useCookies(['token']);

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
    
    //for fetching quiz
    const [quiz, setQuiz] = useState(null);
    
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
            setQuiz(prevQuiz => {
              // Select random questions using previous state
              const selectedQuestions = selectRandomQuestions(data.questions, data.no_of_ques);
              return { ...data, questions: selectedQuestions };
          });
        })
        .catch(error => {
            console.error('Error fetching quiz and questions:', error);
        });
    }, [topicId]);

    // Use Lehmer random number generator to select questions
    const selectRandomQuestions = (questionPool, count) => {
      const randomQuestions = [];
      const rand = lehmerRandom(Math.floor(Math.random() * 2147483646)); // Seed with a random number
      const usedIndices = new Set();
      
      // Select random questions
      while (randomQuestions.length < count) {
        const index = Math.floor(rand() * questionPool.length);
        if (!usedIndices.has(index)) {
          randomQuestions.push(questionPool[index]);
          usedIndices.add(index);
        }
      }
      return randomQuestions;
    };

    //for handling submission of quiz
    const [score, setScore] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [passed, setPassed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to submit your answers?')) {
          let newScore = 0;
          const incorrectlyAnsweredQuestions = [];
          
          // Check each question
          quiz.questions.forEach(question => {
            const selectedAnswer = parseInt(e.target[`question_${question.question_id}`].value);
            document.getElementById(`question_${question.question_id}_${question.answer}`).classList.add('correct-selection');
            if (selectedAnswer === question.answer) {
              newScore++;
              document.getElementById(`question_${question.question_id}_question`).classList.add('correct-question');
            } else {
              incorrectlyAnsweredQuestions.push(question.question_id);
              document.getElementById(`question_${question.question_id}_question`).classList.add('incorrect');
              document.getElementById(`question_${question.question_id}_${selectedAnswer}`).classList.add('incorrect');
            }
          });

          const newPercentage = Math.round((newScore / quiz.no_of_ques) * 100);
        
          // Update score
          setScore(newScore);
          setPercentage(newPercentage);
          setSubmitted(true);

          // Send data to backend
          fetch(`http://localhost:5000/submitQuiz/${quiz.quiz_id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cookies.token}`
            },
            body: JSON.stringify({
              percentage: newPercentage,
              incorrectlyAnswered: incorrectlyAnsweredQuestions,
            })
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to submit quiz');
              }
              return response.json();
            })
            .then(data => {
              alert(data.message); // Log success message
            })
            .catch(error => {
              console.error('Error submitting quiz:', error);
            });

            if(newPercentage > quiz.pass_rate){
              setPassed(true);
              handleUpdateProgress(e);
            }
        }
      };

      const handleUpdateProgress = async (e) => {
        e.preventDefault();
        try {
          const response = await fetch(`http://localhost:5000/updateProgress/${courseId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cookies.token}` // Assuming you have access to cookies
            }
          });
          const data = await response.json();
          if (response.ok) {
            console.log(data.message); // Log success message
          } else {
            console.error(data.error); // Log error message
          }
        } catch (error) {
          console.error('Error updating progress:', error); // Log any fetch errors
        }
      };

    return (
        <div>
           <div className="home-header" >
            <a href={`/Student/Dashboard/Course/${courseId}`} className="backbtn">&lt; Back</a>
               <div  style={{paddingTop:"4%",paddingLeft:"10%",width:"80%",paddingBottom:"0.2%"}}>
                 <h1>Topic: {topicname}</h1>
               </div>
            </div>
            <div className="dashboarddiv">
                {submitted && (
                <div>
                    <p>Your score: {score} out of {quiz.no_of_ques}</p>
                    <p>Percentage: {percentage}%</p>
                    {passed ? <p>Congratulations, you have passed the test.</p> : <p>You have failed the test.</p>}
                </div>
                )}
                {quiz && quiz.questions && (
                <form onSubmit={handleSubmit}>
                    {quiz.questions.map((question, index) => (
                    <div key={question.question_id}>
                        <h3 id={`question_${question.question_id}_question`}>{index + 1}. {question.question}</h3>
                        <label id={`question_${question.question_id}_1`}>
                        <input type="radio" name={`question_${question.question_id}`} value='1' />
                        {question.selection_1}
                        </label><br /><br />
                        <label id={`question_${question.question_id}_2`}>
                        <input type="radio" name={`question_${question.question_id}`} value='2' />
                        {question.selection_2}
                        </label><br /><br />
                        <label id={`question_${question.question_id}_3`}>
                        <input type="radio" name={`question_${question.question_id}`} value='3' />
                        {question.selection_3}
                        </label><br /><br />
                        <label id={`question_${question.question_id}_4`}>
                        <input type="radio" name={`question_${question.question_id}`} value='4' />
                        {question.selection_4}
                        </label>
                    </div>
                    ))}
                    <br />
                    {submitted === false && (<button type="submit" className="blendbtn">Submit</button>)}
                </form>
            )}
         </div>
        </div>
    );
  
  };
  
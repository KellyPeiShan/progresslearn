import {React, useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";

export default function AddQuiz () {

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
    
    const [questionNumber, setQuestionNumber] = useState('');
    const [questionCount, setQuestionCount] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [passingRate, setPassingRate] = useState('');
    const [setButtonClicked, setSetButtonClicked] = useState(false);

    // Function to handle submission of question count
    const handleQuestionCountSubmit = () => {
        if (window.confirm('Are you sure you want to reset the question number? This will reset all your current input.')) {
            const inputValue = parseInt(document.getElementById('questionCountInput').value);
            if (!isNaN(inputValue) && inputValue > 0) {
            setQuestionCount(inputValue);
            setQuestions(Array.from({ length: inputValue }, () => ({ question: '', selections: ['', '', '', ''], answer: null })));
            setSetButtonClicked(true);
            } else {
            alert('Please enter a valid number greater than 0.');
            }
        }
    };
  
    // Function to handle changes in question content
    const handleQuestionChange = (index, content) => {
      const updatedQuestions = [...questions];
      updatedQuestions[index].question = content;
      setQuestions(updatedQuestions);
    };
  
    // Function to handle changes in answer content
    const handleAnswerChange = (questionIndex, answer) => {
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex].answer = answer;
      setQuestions(updatedQuestions);
    };

    const handleSubmit = async(e) => {
        e.preventDefault();

        if(passingRate === ''){
          alert('Please set a passing rate for the quiz.')
        }
        else if(questionNumber === ''){
          alert('Please set number of questions to be answered for the quiz.')
        }
        else{
        // Prepare data to send to backend
        const FormData = {
          topicId: topicId,
          questionNumber: questionNumber,
          questions: questions,
          passingRate: passingRate
        };

        try {
            const response = await fetch(`http://localhost:5000/addQuiz`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(FormData)
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message); // Quiz added successfully
                navigate(`/Instructor/Dashboard/Course/${courseId}`);          
            } else {
                alert(data.error); // Error message from backend
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
        }
      };

    
    return (
        <div>
           <div className="home-header" >
            <a href={`/Instructor/Dashboard/Course/${courseId}`} className="backbtn">&lt; Back</a>
               <div  style={{paddingTop:"4%",paddingLeft:"10%",width:"80%",paddingBottom:"0.2%"}}>
                 <h1>You are creating quiz for: {topicname}</h1>
                 <h2>Set passing rate:&nbsp;&nbsp;<input type="text" style={{width:"30px",height:"30px"}} onChange={(e) => setPassingRate(e.target.value)}></input>&nbsp;%</h2>
                 <h2>Set number of questions to be answered:&nbsp;&nbsp;<input type="text" style={{width:"30px",height:"30px"}} onChange={(e) => setQuestionNumber(e.target.value)}></input>&nbsp;</h2>
                 <div style={{display:'flex'}}>
                 <h2>Set number of questions in pool:&nbsp;&nbsp;<input type="text" id="questionCountInput" style={{width:"30px",height:"30px"}}></input></h2>
                 <button className='blendbtn'style={{border:'1px solid black', marginLeft:'2%', marginTop:'1.8%',width:'50px'}} onClick={handleQuestionCountSubmit}>Set</button>
                 </div>
               </div>
            </div>
            <div className="dashboarddiv">
            <form onSubmit={handleSubmit}>
            {questions.map((question, index) => (
                <div key={index}>
                <h2>Question {index + 1}:</h2>
                <input type="text" placeholder={`Question Content ${index + 1}`} style={{ width: "40%", height: '30px' }}
                    value={question.question} onChange={(e) => handleQuestionChange(index, e.target.value)} /><br /><br />
                {[1, 2, 3, 4].map(answerIndex => (
                    <div key={answerIndex}>
                    <input type="radio" value={answerIndex} name={`answer${index}`}
                        checked={question.answer === answerIndex} onChange={(e) => handleAnswerChange(index, answerIndex)} required/>&nbsp;
                    <input required type="text" placeholder={`Selection ${answerIndex}`} className="quizinput"
                        value={question.selections[answerIndex - 1]} onChange={(e) => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[index].selections[answerIndex - 1] = e.target.value;
                        setQuestions(updatedQuestions);
                        }} /><br /><br />
                    </div>
                ))}
                </div>
            ))}
             {setButtonClicked && ( 
            <button className="blendbtn" style={{ marginLeft: '2%' }} type="submit">Done</button>
              )}
            </form>
            </div>
        </div>
    );
  
  };
  
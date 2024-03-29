import {React, useState, useEffect} from "react";
import { useCookies } from "react-cookie";
import {useNavigate, useParams} from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import boxStyle from "../Components/boxstyle";
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { BarPlot } from '@mui/x-charts/BarChart';
import { LinePlot } from '@mui/x-charts/LineChart';

const InstructorPerformance = ({ courseId }) => {

  const [quizPerformance, setQuizPerformance] = useState([]);

  //get quiz performance
  useEffect(() => {
    // Fetch additional material for the given course ID
    fetch(`http://localhost:5000/quizPerformance/${courseId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch quiz performance');
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        setQuizPerformance(data);
      })
      .catch(error => {
        console.error('Error fetching quiz performance:', error);
      });
  }, [courseId]);

    // Ensure quizPerformance is set before filtering and processing data
    if (quizPerformance.length === 0) {
      return <div>Loading...</div>;
    }
  
   // Filter out topics with null quiz data
   const topicsWithQuiz = quizPerformance.filter(topic => topic.quiz !== null);
   console.log(topicsWithQuiz);
    
    let xAxisData = [];
    let yAxisData = [];

    if (topicsWithQuiz.length > 0) {
      // Map each topic's average score to the corresponding topic number
      const data = topicsWithQuiz.map((topic, index) => ({
        topicNumber: index + 1,
        avgScore: topic.quiz.avgScore
      }));

      // Extract x-axis data (topic numbers) and y-axis data (average scores)
      xAxisData = data.map(topic => `Topic ${topic.topicNumber}`);
      yAxisData = data.map(topic => topic.avgScore);
    }

  return(
    <div>
        <div className="dashboarddiv">
          <h2 className="dashboardheader"><u>Overall Quiz Performance</u></h2>
          <div className="whitebox" style={{minHeight:'200px', padding:'10px',display:'flex',justifyContent:'center',alignItems:'center'}}>
            {topicsWithQuiz.length > 0?( 
              <ChartContainer
                series={[
                  {
                    type: 'bar',
                    stack: '',
                    yAxisKey: 'avgScore',
                    data: yAxisData,
                  },
                  {
                    type: 'line',
                    yAxisKey: 'avgScore',
                    color: 'red', // Adjust line color as needed
                    data: yAxisData,
                  },
                ]}
                width={900}
                height={400}
                xAxis={[
                  {
                    id: 'topics',
                    data: xAxisData,
                    scaleType: 'band',
                    valueFormatter: (value) => value.toString(),
                  },
                ]}
                yAxis={[
                  {
                    id: 'avgScore',
                    scaleType: 'linear',
                  },
                ]}
              >
              <BarPlot />
              <LinePlot />
              <ChartsXAxis label="Topics" position="bottom" axisId="topics" />
              <ChartsYAxis label="Avg Score" position="left" axisId="avgScore" />
            </ChartContainer>
            ):(
              <h3>No Quiz Performance Available</h3>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default InstructorPerformance;
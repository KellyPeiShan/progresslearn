import {React, useState, useEffect} from "react";
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

const InstructorProgress = ({ courseId }) => {

    const[studentProgress,setStudentProgress] = useState([]);

    //get student progress
    useEffect(() => {
        // Fetch student progress for the given course id
        fetch(`http://localhost:5000/studentProgressByCourse/${courseId}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch student progress');
            }
            return response.json();
          })
          .then(data => {
            setStudentProgress(data);
          })
          .catch(error => {
            console.error('Error fetching student progress:', error);
          });
      }, [courseId]);

    //student progress component
    function LinearProgressWithLabel({ student }) {
        var percentage;
        if(student.max_progress === 0){
            percentage = 0;
        }else{
        percentage = (student.progress / student.max_progress) * 100;
        }
        return (
            <div>
                <p>{student.full_name}</p>
                <Box sx={{ display: 'flex', alignItems: 'center'}}>
                    <Box sx={{ width: '80%', mr: 1, borderRadius:30, overflow:'hidden'}}>
                        <LinearProgress 
                            variant="determinate" 
                            value={percentage} 
                            sx={{
                                height: 10, // Height of the progress bar
                                bgcolor: '#F1EBFA', // Background color of the progress bar
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: '#8339ED', // Color of the progress bar
                                    borderRadius: 5, // Border radius of the progress bar
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">{`${Math.round(percentage)}%`}</Typography>
                    </Box>
                </Box>
            </div>
        );
    }      

    return(
        <div>
            <div className="dashboarddiv">
                {studentProgress.map(student => (
                            <Box>
                            <LinearProgressWithLabel student={student}/>
                            </Box>
                    ))}
            </div>
        </div>
    );
    };

export default InstructorProgress;
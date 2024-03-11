import React from 'react';
import businessimg from '../Images/business.png';
import artimg from '../Images/art.png';
import languageimg from '../Images/language.png';
import scienceimg from '../Images/science.png';
import computingimg from '../Images/computing.png';

const CourseComponent = ({ course , onCourseClick }) => {
    let courseImage = '';

    // Determine image based on course field
    switch (course.course_field) {
        case 'business':
            courseImage = businessimg; 
            break;
        case 'art':
            courseImage = artimg; 
            break;
        case 'language':
            courseImage = languageimg;
            break;
        case 'science':
            courseImage = scienceimg; 
            break;
        case 'computing':
            courseImage = computingimg;
            break;
    }

    return ( 
     <div className="coursecomponent" onClick={() => onCourseClick(course)}>
        <img src={courseImage} width="300px" height="120px" alt="Course Image"></img>
        <p className="coursetitle">{course.course_title}</p>
     </div>
    );
};

export default CourseComponent;

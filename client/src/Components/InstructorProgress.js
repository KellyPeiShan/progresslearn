import {React, useState, useEffect} from "react";
import { useCookies } from "react-cookie";
import {useNavigate, useParams} from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import boxStyle from "../Components/boxstyle";

const InstructorProgress = ({ courseId }) => {
  return(
    <div>
        <p>Progress</p>
        <p>{courseId}</p>
    </div>
  );
};

export default InstructorProgress;
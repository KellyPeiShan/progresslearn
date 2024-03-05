import {React, useState, useEffect} from "react";
import { useCookies } from "react-cookie";
import {useNavigate} from "react-router-dom";
import TextField from "@mui/material/TextField";
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';

export default function StudentHome () {

    //for user info
    const [userInfo, setUserInfo] = useState('');
    const [cookies] = useCookies(['token']);

    //for searchbar
    const [inputText, setInputText] = useState("");
    let inputHandler = (e) => {
      //convert input text to lower case
      var lowerCase = e.target.value.toLowerCase();
      setInputText(lowerCase);
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch(`http://localhost:5000/userinfo`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${cookies.token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setUserInfo(data); //set user info received from server
                } else {
                    console.error('Error fetching user information:', data.error);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchUserInfo();
    }, [cookies.token]);

    return (
        <div>
            <div className="home-header" >
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{paddingTop:"2%",paddingLeft:"5%"}}>
                        <h1 >Welcome, {userInfo.fullname}</h1>
                    </div>
                    <div className="logout">
                        <Tooltip title="Logout">
                        <IconButton >
                            <LogoutIcon style={{ color: "#8339ED", fontSize: "40px" }}/>
                        </IconButton>
                        </Tooltip>
                    </div>
                </div>
                <TextField
                    onChange={inputHandler}
                    variant="outlined"
                    label="Search for new courses"
                    style={{backgroundColor:"white", width:"90%", marginLeft:"5%",marginBottom:"2%"}}
                    size="small"
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                        ),
                        }}
                    />
            </div>
            {/* List of student's course */}
            <div className="mycourses">
                <p style={{fontSize:"25px", fontWeight:"500"}}>My Courses</p>
                <div className="courselist">
                    
                </div>
            </div>
        </div>
    );
};
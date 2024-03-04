import {React, useState, useEffect} from "react";
import { useCookies } from "react-cookie";
import {useNavigate} from "react-router-dom";
import TextField from "@mui/material/TextField";
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

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
            <div className="home-header">
                <h1 style={{padding:"2%"}}>Welcome, {userInfo.fullname}</h1>
                <TextField
            onChange={inputHandler}
            variant="outlined"
            fullWidth
            label="Search for topics or content"
            style={{backgroundColor:"white"}}
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
        </div>
    );
};
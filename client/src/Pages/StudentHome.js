import {React, useState, useEffect} from "react";
import { useCookies } from "react-cookie";
import {useNavigate} from "react-router-dom";

export default function StudentHome () {

    const [userInfo, setUserInfo] = useState('');
    const [cookies] = useCookies(['token']);

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
        <div className="home-page">
            <h1>Welcome, {userInfo.fullname}</h1>
        </div>
    );
};
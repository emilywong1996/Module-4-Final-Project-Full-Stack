import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Components.css';

export const LoginPage = () => {
    const [usernameValue, setUsernameValue] = useState(null);
    const [passwordValue, setPasswordValue] = useState(null);

    const navigate = useNavigate();

    const output = document.getElementById("output");

    async function logIn(username, password) {
        const fetchResponse = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
          });

        const data = await fetchResponse.json();

        return data;
    };

    const handleSubmitLogInClick = async (e) => {
        e.preventDefault();

        const data = await logIn(usernameValue, passwordValue);
        
        if (data != 'Email not found') {
            if (data != 'Password not found') {
                sessionStorage.setItem('appjwt', data.jwt);
                navigate('/graphs');
            }
            else {
                output.innerHTML = JSON.stringify(data)
                Array.from(document.querySelectorAll("input")).forEach(input => (input.value = ""));
                setUsernameValue(null);
                setPasswordValue(null);
            }
        } else {
            output.innerHTML = JSON.stringify(data)
            Array.from(document.querySelectorAll("input")).forEach(input => (input.value = ""));
            setUsernameValue(null);
            setPasswordValue(null);
        }
    }

    return (
        <div>
            <div>
                <h2>Log In</h2>
                <form autoComplete="off" onSubmit={handleSubmitLogInClick}>
                
                    <label>Username:</label>
                    <input onChange = {(e) => setUsernameValue(e.target.value)} placeholder="Enter Username" required/>

                    <label>Password:</label>
                    <input type="password" onChange = {(e) => setPasswordValue(e.target.value)} placeholder="Enter Password" required/>

                    <button type="submit">Login</button>
                </form>
            </div>
            <div>
                <Link id="link" to="/register">If you don't have an account yet, click here to register</Link>
            </div>
            <div id="output"></div>
        </div>
    )
}
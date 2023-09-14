import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Components.css';

export const RegisterPage = () => {
    const [usernameValue, setUsernameValue] = useState(null);
    const [passwordValue, setPasswordValue] = useState(null);

    const navigate = useNavigate();

    async function register(username, password) {
        const fetchResponse = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
          });

        const data = await fetchResponse.json();

        return data;
    };

    const handleSubmitRegisterClick = async (e) => {
        e.preventDefault();

        const data = await register(usernameValue, passwordValue);

        if (!data.error) {
            sessionStorage.setItem('appjwt', data.jwt);
            navigate('/graphs');
        } else {

        }
    }

    return (
        <div>
            <div>
                <h2>Register</h2>
                <form autoComplete="off" onSubmit={handleSubmitRegisterClick}>
                
                    <label>Username:</label>
                    <input onChange = {(e) => setUsernameValue(e.target.value)} placeholder="Enter Username" required/>

                    <label>Password:</label>
                    <input type="password" onChange = {(e) => setPasswordValue(e.target.value)} placeholder="Enter Password" required/>

                    <button type="submit">Register</button>
                </form>
            </div>
            <div>
                <Link id="link" to="/">Click here if you already have an account</Link>
            </div>
        </div>
    )
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const backendUrl = process.env.REACT_APP_BACKEND_URL;
console.log('backendUrl', backendUrl);

const Auth = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(true);
    const navigate = useNavigate();


    const handleSignUp = async () => {
        console.log('Request Payload:', { username, password });
        try {
            const response = await fetch(`${backendUrl}/game/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include',
            });
            // parsing response
            const data = await response.json();

            if (response.ok) {
                alert('Sign up successful. Please sign in.');
                setIsSignUp(false);
            }
            else if (response.status === 400 && data.message === 'Username already exists') {
                alert('User already exists. Please sign in.');
                setIsSignUp(false);
            } else {
                alert('Sign up failed. Here is the message from the server:', data.message);
            }
        } catch (error) {
            console.error('Error during sign up:', error);
            alert('Error during sign up:', error);
        }
        };

        const handleSignIn = async () => {
            try {
                const response = await fetch(`${backendUrl}/game/signin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include',
                });
                
                // parsing response
                const data = await response.json();

                if (response.ok) {
                    alert('Sign in successful.');
                    localStorage.setItem('username', username);
                    navigate('/game'); // Redirect to home page after sign in
                } else {
                    alert('Sign in failed. Here is the message from the server:', response.message);
                }
            } catch (error) {
                console.error('Error during sign in:', error);
                alert('Error during sign in:', error);
            }
        };

        const handleSubmit = (e) => {
            e.preventDefault(); // prevent the default form submission
            if (isSignUp) {
                handleSignUp();
            } else {
                handleSignIn();
            }
        };

        //renders differently: if the user is not signed up, the page will show as a Sign up page, otherwise it'll show as a Sign in page.
        return (
            <div>
                <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
                </form>

                {/* The button under the form allows users to toggle between sign up and sign in. When clicked, it will change the SignUp state to the opposite value, i.e. if the user is in the Sign in page, after submission the page will show as a Sign up page.*/}
                <button onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? 'Already have an account? Sign In' : 'New user? Sign Up'}
                </button>
            </div>
        );
    };

export default Auth;

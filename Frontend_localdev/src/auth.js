import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const backendUrl = process.env.REACT_APP_BACKEND_URL;
console.log('backendUrl', backendUrl);

const Auth = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const reset = () => {
        setUsername('');
        setPassword('');
    };

    const handleSignUp = async () => {
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
                setMessage('Sign up successful. Now redirected to the sign in page.');
                setIsSignUp(false);
                reset();
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            }
            else if (response.status === 400 && data.message === 'Username already exists') {
                setMessage('User already exists. Please sign in.');
                setIsSignUp(false);
                reset();
                setTimeout(() => {
                    navigate('/'); 
                }, 2000);
            } else {
                setMessage('Sign up failed. Please ensure you provide a valid username and password.');
                reset();
            }
        } catch (error) {
            console.error('Error during sign up:', error);
            setMessage('Error during sign up:', error.message);
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
                    setMessage('Sign in successful. Now redirecting to the game session.');
                    localStorage.setItem('username', username);
                    reset();
                    setTimeout(() => {
                        navigate('game'); 
                    }, 2000);
                } else {
                    setMessage('Sign in failed. Please ensure you provide a valid username and password.');
                    reset();
                }
            } catch (error) {
                console.error('Error during sign in:', error);
                setMessage(`Error during sign in: ${error.message}`);
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
            <div className="auth-container">
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

                <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
                    {message}
                </p>
            </div>
        );
    };

export default Auth;

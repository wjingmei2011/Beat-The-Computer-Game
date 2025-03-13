import React, {useState, useEffect} from 'react';
import { useNavigate} from 'react-router-dom';

export default function App () {
    console.log('App is running');
// define the state variables

const [targetNumber, setTargetNumber]=useState(null);
const [userNumber, setUserNumber]=useState('');
const [computerNumber, setComputerNumber]=useState(null);
const [roundsLeft, setRoundsLeft]=useState(10);
const [wins, setWins]=useState(0);
const [losses, setLosses]=useState(0);
const [isGameOver, setGameOver]=useState(false);
const [result, setResult]=useState('');
const [finalResult, setFinalResult]=useState(0);
const navigate = useNavigate();


// first look up for the final result by username stored in local storage
const username = localStorage.getItem('username');
// checking user name
console.log('username:', username);

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const getFinalResult = async () => {
    const response = await fetch(`${backendUrl}/game/getFinalResult`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    const data= await response.json();
    //checking the finalResult data in frontend
    console.log('Data::', data);

    if (response.ok) {
        setFinalResult(data.finalResult);
    } else {
        alert(`Error during retrieving final result: ${data.message}`);
    } 
};


// define the useEffect for the final result by retrieving it from the database
useEffect(()=>{
    if(username) {
        getFinalResult();
    }
}, [username]);


// define the event handler: 
// 1. the computer determines a target number. the user picks a number between 0~10; and the computer generates a random integer in the same range; whoever is closer to that target number wins. 
// 2. once a single result is determined, all numbers are scratched and back to initial setting.
// 3. the user tries 10 times and if total wins is > total losses, the user win. 

const gameHandler = () => {
    if (userNumber ==='')
        {return alert ('Please enter a number!')};

    const newTarget = Math.floor(Math.random()*11);
    setTargetNumber(newTarget); 

    const newCompNumber = Math.floor(Math.random()*11);
    setComputerNumber(newCompNumber);

    const userGap = Math.abs(newTarget - userNumber);
    const computerGap = Math.abs(newTarget - newCompNumber);

    let resultMessage = `Your guess: ${userNumber} | Computer's guess: ${newCompNumber} | Target number: ${newTarget} -> `

    if (userGap === computerGap) {
        resultMessage += "It's a tie!";
    } else if (userGap < computerGap) {
        resultMessage += "You win this round!"
        setWins(wins => wins+1);
    } else {
        resultMessage += "You lose this round!"
        setLosses(losses => losses+1);
    };

    setResult(resultMessage);

    setRoundsLeft(roundsLeft => roundsLeft-1); 

    if (roundsLeft-1 === 0) {
        setGameOver(true);
    }
};

const resetGame=()=>{
    setRoundsLeft(10);
    setWins(0);
    setLosses(0);
    setGameOver(false);
    setComputerNumber(null);
    setUserNumber('');
    setTargetNumber(null);
    setResult('');
};

// define the useEffect when the game is over

useEffect(()=>{
    if (isGameOver) {
        alert('Game Over!');
        if (wins > losses) {
            setFinalResult(finalResult => finalResult+1);
        }
    }
   }, [isGameOver, wins, losses]);

const logOut= async ()=>{
    // store the final result in the local storage, send it to the database and log out
    const response = await fetch(`${backendUrl}/game/updateFinalResult`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, finalResult }),
    });
    // parsing response
    const data = await response.json();
    console.log('Data:', data);

    if (response.ok) {
        alert('Final result is saved. You are logged out.');
    } else {
        alert('Error during saving final result:', data.message);}
    localStorage.removeItem('username');
    navigate('/');
};

return (
    <div className='container'>
        <div className='game-section'>
            <h2>Wanna try your luck today?</h2>
            <p>Pick a number between 0 - 10. The computer will also pick a number. Whoever is closer to the target wins! </p>

            {!isGameOver?(
                <>
                 <input 
                    type="number"
                    value={userNumber}
                    min="0"
                    max="10"
                    onChange={(e)=>setUserNumber(Number(e.target.value))}
                 />
                    <button onClick={gameHandler}>Submit</button>
                
                {targetNumber !== null && (
                    <p>{result}</p>
                )}
                <p>Total wins: {wins} | Total losses: {losses} | Rounds Left: {roundsLeft}</p>

                </>
            ):(
                <div className="game-over">
                    <p>Total wins: {wins} | Total losses: {losses}</p>
                    <p>{wins > losses? '🎉Congratulations🎉':'😢 Try Again Next Time!'}</p>
                    <p>So far you've won {finalResult} round(s) - keep crushing it! </p>
                    <button onClick={resetGame}>Try Again!</button>
                    <button onClick={logOut}>Log Out</button>
                </div>
            )}
        </div>
    </div>
    );
}
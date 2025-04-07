import React, {useState, useEffect} from 'react';
import { useNavigate} from 'react-router-dom';

export default function App () {
    console.log('App is running');
// define the state variables

const [targetNumber, setTargetNumber]=useState(null);
const [userNumber, setUserNumber]=useState(null);
const [computerNumber, setComputerNumber]=useState(null);
const [prevUserNumber, setPrevUserNumber]=useState(null);
const [prevComputerNumber, setPrevComputerNumber]=useState(null);
const [roundsLeft, setRoundsLeft]=useState(10);
const [wins, setWins]=useState(0);
const [losses, setLosses]=useState(0);
const [ties, setTies]=useState(0);
const [isGameOver, setGameOver]=useState(false);
const [result, setResult]=useState('');
const [finalResult, setFinalResult]=useState(0);
const [message,setMessage]=useState('');
const navigate = useNavigate();

// first look up for the final result by username stored in local storage
const username = localStorage.getItem('username');

const backendUrl = process.env.REACT_APP_BACKEND_URL;

//printing username and backendURL
console.log('username:', username);
console.log('backendUrl:', backendUrl);

// define the useEffect for the final result by retrieving it from the database
useEffect(()=>{
    if(!username) {
        alert('Please sign in first');
        navigate('/');
    } else {
        getFinalResult();
    }
    }, [username]);


const getFinalResult = async () => {
    const response = await fetch(`${backendUrl}/game/getFinalResult`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    const data= await response.json();
    //printing the finalResult data in frontend
    console.log('Data:', data);

    if (response.ok) {
        setFinalResult(data.finalResult);
    } else if (response.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('username');
        navigate('/');
    } 
    else {
        alert(`Error during retrieving final result: ${data.message}`);
    } 
};


// define the event handler: 
// 1. the computer determines a target number. the user picks a number between 0~10; and the computer generates a random integer in the same range; whoever is closer to that target number wins. 
// 2. once a single result is determined, all numbers are scratched and back to initial setting.
// 3. the user tries 10 times and if total wins is > total losses, the user win. 

const gameHandler = () => {
    if (userNumber ==='')
        {return alert ('Please enter a number!')};

    // dynamically set the target number based on the previous user and computer number
    let newTarget;
    if (prevUserNumber === null || prevComputerNumber === null) {
        newTarget = Math.floor(Math.random()*11);
    } else {
    const average = (prevUserNumber + prevComputerNumber) / 2;
    const bias = Math.random() > 0.5 ? 1 : -1;
    newTarget = Math.round(average + bias);
    newTarget = Math.max(0, Math.min(10, newTarget)); // ensure the target is between 0 and 10
    }

    setTargetNumber(newTarget); 

    let newCompNumber;
    if(userNumber === prevUserNumber) {
    newCompNumber = userNumber + (Math.random() > 0.5 ? 0 : -1);
    newCompNumber = Math.max(0, Math.min(10, newCompNumber)); // ensure the number is between 0 and 10
    } else { 
    newCompNumber = Math.floor(Math.random()*11);
    };

    setComputerNumber(newCompNumber);

    setPrevUserNumber(userNumber);
    setPrevComputerNumber(newCompNumber);

    const userGap = Math.abs(newTarget - userNumber);
    const computerGap = Math.abs(newTarget - newCompNumber);

    let resultMessage = `Your guess: ${userNumber} | Computer's guess: ${newCompNumber} | Target number: ${newTarget} -> `

    if (userGap === computerGap) {
        resultMessage += "It's a tie!";
        setTies(ties => ties+1);
    } else if (userGap < computerGap) {
        resultMessage += "You win this round!"
        setWins(wins => wins+1);
    } else {
        resultMessage += "You lose this round!"
        setLosses(losses => losses+1);
    };
    setResult(resultMessage);
    setRoundsLeft(roundsLeft => roundsLeft-1); 
};

const resetGame=()=>{
    setRoundsLeft(10);
    setWins(0);
    setLosses(0);
    setTies(0);
    setPrevComputerNumber(null);
    setPrevUserNumber(null);
    setGameOver(false);
    setComputerNumber(null);
    setUserNumber(null);
    setTargetNumber(null);
    setResult('');
};

// define the useEffect when the game is over


useEffect(()=>{
    if (roundsLeft === 0 && !isGameOver) {
        setMessage('Game is Over!');
        setTimeout(() => {
            setGameOver(true);
        }, 1000);
    }   
   }, [roundsLeft, isGameOver]);


useEffect(()=>{
    if (isGameOver) {
        if (wins > losses) {
        setFinalResult((finalResult) => finalResult + 1);
        }
    }
    },[isGameOver, wins, losses]);


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
        setMessage('Final result is saved. You are being logged out.');
        setTimeout(() => {
            navigate('/');
            localStorage.removeItem('username');
        }, 2000);
    } else {
        alert(`Error during saving final result:, ${data.message}`)}
};

return (
    <div className='app-container'>
        <div className='game-section'>
            <h1>Wanna try your luck today?</h1>
            <p>Pick a number between 0 and 10. The computer will also pick a random number. The one closer to the <strong>target number</strong> wins the round!</p>
            <div className="game-hints">
                <p>💡Hint 1: Repeating the same number (e.g. 5) is a losing strategy. Try to vary your guesses!</p>
                <p>💡Hint 2: There’s a hidden pattern in the game. If you know it, you can almost always win against the computer!</p>
                <p>🎁Hint 3: If you’ve figured out the secret, let me know—there’s a little gift waiting for you!</p>
            </div>

            {!isGameOver?(
                <>
                 <input 
                    type="number"
                    value={userNumber}
                    min="0"
                    max="10"
                    placeholder='Enter a number (0-10)'
                    onChange={(e)=>setUserNumber(Number(e.target.value))}
                 />
                    <button onClick={gameHandler} disabled={roundsLeft ===0} > 
                    Submit
                    </button>
                
                {targetNumber !== null && (
                    <p>{result}</p>
                )}
                <p className="game-stats">Total wins: {wins} | Total losses: {losses} | Rounds Left: {roundsLeft}</p>

                </>
            ):(
                <div className="game-over">
                    <p className="gameover">{message}</p>
                    <p>Total wins: {wins} | Total losses: {losses} | Total ties: {ties}</p>
                    <p className="congratulations">{wins > losses? '🎉Congratulations🎉':'😢 Try Again Next Time!😢'}</p>
                    <div>
                        <p>So far you've won {finalResult} game(s) - keep crushing it! </p>
                    </div>
                    <button onClick={resetGame}>Try Again!</button>
                    <button onClick={logOut}>Save Result & Log Out</button>
                </div>
            )}
        </div>
    </div>
    );
}
import React, {useState, useEffect, useRef} from 'react';
import './Pomodoro.css';
import Sidebar from './Sidebar';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


const Pomodoro = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user.id;
    const [greeting, setGreeting] = useState('');
    const [firstName, setFirstName] = useState('');
    const [focusTime, setFocusTime] = useState(25 * 60);
    const [breakTime, setBreakTime] = useState(5 * 60);
    const [isFocus, setIsFocus] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [mode, setMode] = useState('focus');
    const [cycles, setCycles] = useState(0);
    const focusInterval = useRef(null);
    const breakInterval = useRef(null);

    useEffect(() => {
        const updateGreeting = () => {
          const currentHour = new Date().getHours();
          let newGreeting = '';
          if (currentHour < 12) {
            newGreeting = 'Good Morning';
          } else if (currentHour >= 12 && currentHour < 18) {
            newGreeting = 'Good Afternoon';
          } else {
            newGreeting = 'Good Evening';
          }
          setGreeting(newGreeting);
        };

        updateGreeting();
        const interval = setInterval(updateGreeting, 60 * 60 * 1000);
        return () => clearInterval(interval);
      }, []);

    useEffect(() => {
        async function userFirstName() {
            const response = await fetch(`http://localhost:5000/api/user/${userId}`);
            const data = await response.json();
            setFirstName(data.firstName);
        }
        userFirstName();
    }, [userId]);

    useEffect(() => {
        if (isFocus && mode === 'focus') {
            focusInterval.current = setInterval(() => {
                setFocusTime((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(focusInterval.current);
                        setIsFocus(false);
                        setIsBreak(true);
                        setMode('break');
                        setBreakTime(5 * 60);
                        setCycles(cycles + 1);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(focusInterval.current);
    }, [isFocus, mode]);

    useEffect(() => {
        if (isBreak && mode === 'break') {
            breakInterval.current = setInterval(() => {
                setBreakTime((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(breakInterval.current);
                        setIsBreak(false);
                        setIsFocus(true);
                        setMode('focus');
                        setFocusTime(25 * 60);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(breakInterval.current);
    }, [isBreak, mode]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    const handleFocus = () => {
        setIsFocus(true);
        setIsBreak(false);
        setMode('focus');
    }
    const handleBreak = () => {
        setIsBreak(true);
        setIsFocus(false);
        setMode('break');
    }
    const handlePause = () => {
        setIsFocus(false);
        setIsBreak(false);
    }
    const handleReset = () => {
        handlePause();
        if (mode === 'focus') {
            setFocusTime(25 * 60);
        } else {
            setBreakTime(5 * 60);
        }
    }

    return (
        <div className='pomodoro'>
            <Sidebar />
            <div className='pomodoro-header'>
                <h1> {greeting} {firstName}</h1>
                <h2>Let's get Productive</h2>
            </div>
            <div className='pomodoro-content'>
                <div className='focus-timer'>
                    <h1>Focus</h1>
                    <h2><CircularProgressbar value={focusTime} text={formatTime(focusTime)} maxValue={1500} strokeWidth={2} styles={buildStyles({
                        textColor: '#000000', pathColor: '#000000', strokeLinecap: 'round',
                    })}/></h2>
                    <button className={`btn ${mode === 'focus' && isFocus}`} onClick={() => {
                        if (mode === 'focus' && isFocus) {
                            handlePause();
                        } else {
                            handleFocus();
                        }
                    }}> {mode === 'focus' && isFocus ? "Pause Focus" : "Start Focus"} </button>
                </div>
                <div className='break-timer'>
                    <h1>Break</h1>
                    <h2><CircularProgressbar value={breakTime} text={formatTime(breakTime)} maxValue={300} strokeWidth={2} styles={buildStyles({
                        textColor: '#000000', pathColor: '#000000',
                    })}/></h2>
                    <button className={`btn ${mode === 'break' && isBreak}`} onClick={() => {
                        if (mode === 'break' && isBreak) {
                            handlePause();
                        } else {
                            handleBreak();
                        }
                    }}> {mode === 'break' && isBreak ? "Pause Break" : "Take a Break"} </button>
                </div>
            </div>
            <p className='cycle'>Pomodoros Completed: {cycles}</p>
            <button className='reset-btn' onClick={handleReset}>Reset</button>
            <div className='progress-bar'>

            </div>
        </div>
    );
}
export default Pomodoro;

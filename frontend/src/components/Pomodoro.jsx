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
    const [focusTime, setFocusTime] = useState(() => {
        const savedTime = localStorage.getItem('focusTime');
        return savedTime ? parseInt(savedTime, 10) : 25 * 60;
    });
    const [breakTime, setBreakTime] = useState(() => {
        const savedTime = localStorage.getItem('breakTime');
        return savedTime ? parseInt(savedTime, 10) : 5 * 60;
    });
    const [isFocus, setIsFocus] = useState(() => {
        const savedState = localStorage.getItem('isFocus');
        return savedState === 'true';
    });
    const [isBreak, setIsBreak] = useState(() => {
        const savedState = localStorage.getItem('isBreak');
        return savedState === 'true';
    });
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('mode');
        return savedMode || 'focus';
    });
    const [cycles, setCycles] = useState(0);
    const focusInterval = useRef(null);
    const breakInterval = useRef(null);

    useEffect(() => { localStorage.setItem('focusTime', focusTime.toString()); }, [focusTime]);
    useEffect(() => { localStorage.setItem('breakTime', breakTime.toString()); }, [breakTime]);
    useEffect(() => { localStorage.setItem('isFocus', isFocus.toString()); }, [isFocus]);
    useEffect(() => { localStorage.setItem('isBreak', isBreak.toString()); }, [isBreak]);
    useEffect(() => { localStorage.setItem('mode', mode); }, [mode]);

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
        if (focusTime === 0) {
            setFocusTime(25 * 60);
        }
        setIsFocus(true);
        setIsBreak(false);
        setMode('focus');
    }
    const handleBreak = () => {
        if (breakTime === 0) {
            setBreakTime(5 * 60);
        }
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
    const focusButtonDisplay = () => {
        if (isFocus) {
            return "Pause Focus";
        } if (focusTime < 25 * 60) {
            return "Continue Focus";
        }
        return "Start Focus";
    }
    const breakButtonDisplay = () => {
        if (isBreak) {
            return "Pause Break";
        }
        if (breakTime < 5 * 60) {
            return "Continue Break";
        }
        return "Take a Break";
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
                    }}> {focusButtonDisplay()} </button>
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
                    }}> {breakButtonDisplay()} </button>
                </div>
            </div>
            <p className='cycle'>Pomodoros Completed: {cycles}</p>
            <button className='reset-btn' onClick={handleReset}>Reset</button>
        </div>
    );
}
export default Pomodoro;

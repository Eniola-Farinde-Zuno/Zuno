import React, {useState, useEffect, useRef} from 'react';
import './Pomodoro.css';
import Sidebar from './Sidebar';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { faPause } from '@fortawesome/free-solid-svg-icons';


const Pomodoro = () => {
    const SECS_IN_MIN = 60;
    const TEXT_COLOR = '#000000';
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user.id;
    const [greeting, setGreeting] = useState('');
    const [firstName, setFirstName] = useState('');
    const [focusTime, setFocusTime] = useState(() => {
        const savedTime = localStorage.getItem('focusTime');
        return savedTime ? parseInt(savedTime, 10) : 25 * SECS_IN_MIN;
    });
    const [breakTime, setBreakTime] = useState(() => {
        const savedTime = localStorage.getItem('breakTime');
        return savedTime ? parseInt(savedTime, 10) : 5 * SECS_IN_MIN;
    });
    const [isTimer, setIsTimer] = useState(() => {
        const savedFocus = localStorage.getItem('isFocus');
        const savedBreak = localStorage.getItem('isBreak');
        return savedFocus === 'true' || savedBreak === 'true';
    });
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('mode');
        return savedMode || 'focus';
    });
    const [cycles, setCycles] = useState(0);
    const interval = useRef(null);

    useEffect(() => { localStorage.setItem('focusTime', focusTime.toString()); }, [focusTime]);
    useEffect(() => { localStorage.setItem('breakTime', breakTime.toString()); }, [breakTime]);
    useEffect(() => { localStorage.setItem('isFocus', isTimer && mode === 'focus'); }, [isTimer, mode]);
    useEffect(() => { localStorage.setItem('isBreak', isTimer && mode === 'break'); }, [isTimer, mode]);
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
        if (isTimer) {
            if (interval.current) {
                clearInterval(interval.current);
            }
            interval.current = setInterval(() => {
                if (mode === 'focus') {
                    setFocusTime((prevTime) => {
                        if (prevTime <= 1) {
                            clearInterval(interval.current);
                            setIsTimer(false);
                            setCycles(cycles + 1);
                            return 0;
                        }
                        return prevTime - 1;
                    })
                } else {
                    setBreakTime((prevTime) => {
                        if (prevTime <= 1) {
                            clearInterval(interval.current);
                            setIsTimer(false);
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }
            }, 1000);
        }
        return () => clearInterval(interval.current);
    }, [isTimer, mode]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    const handleTimer = (mode) => {
        if (mode === 'focus') {
            if (focusTime === 0) {
                setFocusTime(25 * SECS_IN_MIN);
            }
            setMode('focus');
            setIsTimer(true);
        } else {
            if (breakTime === 0) {
                setBreakTime(5 * SECS_IN_MIN);
            }
            setMode('break');
            setIsTimer(true);
        }
    }
    const handlePause = () => {
        setIsTimer(false);
    }
    const handleReset = () => {
        handlePause();
        if (mode === 'focus') {
            setFocusTime(25 * SECS_IN_MIN);
        } else {
            setBreakTime(5 * SECS_IN_MIN);
        }
    }
    const addFive = () => {
        if (mode === 'focus') {
            setFocusTime(focusTime + 5 * SECS_IN_MIN);
        } else {
            setBreakTime(breakTime + 5 * SECS_IN_MIN);
        }
    };
    const minusFive = () => {
        if (mode === 'focus') {
            setFocusTime(focusTime - 5 * SECS_IN_MIN);
        } else {
            setBreakTime(breakTime - 5 * SECS_IN_MIN);
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
                        textColor: TEXT_COLOR, pathColor: TEXT_COLOR,
                    })}/></h2>
                    <div className='focus-btns'>
                        <button className='btn' onClick={minusFive}>-5 : 00</button>
                        <button className={`btn ${mode === 'focus' && isTimer}`} onClick={() => {
                            if (mode === 'focus' && isTimer) {
                                handlePause();
                            } else {
                                handleTimer('focus');
                            }
                        }}> {mode == 'focus' && isTimer ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />} </button>
                        <button className='btn' onClick={addFive}>+5 : 00</button>
                    </div>
                </div>
                <div className='break-timer'>
                    <h1>Break</h1>
                    <h2><CircularProgressbar value={breakTime} text={formatTime(breakTime)} maxValue={300} strokeWidth={2} styles={buildStyles({
                        textColor: TEXT_COLOR, pathColor: TEXT_COLOR,
                    })}/></h2>
                    <div className='break-btns'>
                        <button className='btn' onClick={minusFive}>-5 : 00</button>
                        <button className={`btn ${mode === 'break' && isTimer}`} onClick={() => {
                            if (mode === 'break' && isTimer) {
                                handlePause();
                            } else {
                                handleTimer('break');
                            }
                        }}> {mode === 'break' && isTimer ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />} </button>
                        <button className='btn' onClick={addFive}>+5 : 00</button>
                    </div>
                </div>
            </div>
            <p className='cycle'>Pomodoros Completed: {cycles}</p>
            <button className='reset-btn' onClick={handleReset}>Reset</button>
        </div>
    );
}
export default Pomodoro;

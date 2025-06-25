import React, {useState} from 'react';
import './Pomodoro.css';

const Pomodoro = () => {
    const [firstName, setFirstName] = useState('');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState('focus');

    return (
        <div className='pomodoro'>
            <h1>Good evening Eniola</h1>
            <h2>Let's get Productive</h2>
        </div>
    );

}
export default Pomodoro;

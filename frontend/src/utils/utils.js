import { useEffect, useState } from "react";

const utils = () => {
    const [greeting, setGreeting] = useState('');
    const [firstName, setFirstName] = useState('');
    const URL_PREFIX = 'http://localhost:5000/api';
    const MORNING = 'Good Morning';
    const AFTERNOON = 'Good Afternoon';
    const EVENING = 'Good Evening';
    const HOUR = 60 * 60 * 1000;
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user.id;

    useEffect(() => {
        const updateGreeting = () => {
            const currentHour = new Date().getHours();
            let newGreeting = '';
            if (currentHour < 12) {
            newGreeting = MORNING;
            } else if (currentHour >= 12 && currentHour < 18) {
            newGreeting = AFTERNOON;
            } else {
            newGreeting = EVENING;
            }
            setGreeting(newGreeting);
        };
        updateGreeting();
        const interval = setInterval(updateGreeting, HOUR);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        async function userFirstName() {
            const response = await fetch(`${URL_PREFIX}/user/${userId}`);
            const data = await response.json();
            setFirstName(data.firstName);
        }
        userFirstName();
    }, [userId]);

    return {
        greeting,
        firstName,
    };
}
export default utils;

import { initializeApp } from "firebase/app"; // Keep this line
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2vHsvIGugXVwOID5LSyTh6h87TYm_xps",
  authDomain: "hamyak-a2aaa.firebaseapp.com",
  projectId: "hamyak-a2aaa",
  storageBucket: "hamyak-a2aaa",
  messagingSenderId: "1055715393530",
  appId: "1:1055715393530:web:7bd1b841e758cccd12ee43",
  measurementId: "G-VRKWZ5HD4B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Game variables
let coins = Number(localStorage.getItem('coins')) || 0;
let total = Number(localStorage.getItem('total')) || 750;
let power = Number(localStorage.getItem('power')) || 750;
let count = Number(localStorage.getItem('count')) || 1;
let multitap = Number(localStorage.getItem('multitap')) || 1;
let lastUpdateTime = Number(localStorage.getItem('lastUpdateTime')) || Date.now();

const body = document.body;
const image = body.querySelector('#coin');
const h1 = body.querySelector('h1');
const totalDisplay = body.querySelector('#total');
const powerDisplay = body.querySelector('#power');
const progressBar = body.querySelector('.progress');
const rankDisplay = body.querySelector('#rank');
const backgroundParticlesContainer = document.getElementById('background-particles');

// Preload the sound effect
const clickSound = new Audio('./6a6ad928cfac061.mp3');
clickSound.preload = 'auto';

h1.textContent = coins.toLocaleString();
totalDisplay.textContent = `${total}`;
powerDisplay.textContent = power;

const ranks = [
    { name: '🥇 Bronze', threshold: 1000, image: './assets/images/bronze.png', increment: 2 },
    { name: '🥈 Silver', threshold: 5000, image: './assets/images/silver.png', increment: 4 },
    { name: '📀 Gold', threshold: 10000, image: './assets/images/gold.png', increment: 6 },
    { name: '💎 Diamond', threshold: 20000, image: './assets/images/diamond.png', increment: 8 }
];

// Initialize current rank and highest rank from localStorage
let currentRank = localStorage.getItem('currentRank');
let highestRank = localStorage.getItem('highestRank') || '';

// Function to update the rank based on current coins
function updateRank() {
    let newRank = null;
    let currentImage = './assets/images/golden.png';
    let increment = 2;

    for (let i = ranks.length - 1; i >= 0; i--) {
        if (coins >= ranks[i].threshold) {
            newRank = ranks[i].name;
            currentImage = ranks[i].image;
            increment = ranks[i].increment;
            break;
        }
    }

    // Check if new rank is higher than the highest rank achieved
    if (newRank && (!highestRank || ranks.findIndex(rank => rank.name === newRank) >= ranks.findIndex(rank => rank.name === highestRank))) {
        highestRank = newRank;
        localStorage.setItem('highestRank', highestRank);
    }

    // Update only if the new rank is higher than or equal to the current rank
    if (newRank && (!currentRank || ranks.findIndex(rank => rank.name === newRank) >= ranks.findIndex(rank => rank.name === currentRank))) {
        currentRank = newRank;
        localStorage.setItem('currentRank', currentRank);
        rankDisplay.textContent = currentRank;
        image.src = currentImage;
    }

    return increment;
}

let currentIncrement = updateRank();

image.addEventListener('click', async (e) => {
    let x = e.offsetX;
    let y = e.offsetY;

    navigator.vibrate(5);

    const soundClone = clickSound.cloneNode();
    soundClone.play();

    if (power > 0) {
        coins += multitap;
        power -= multitap;

        await updateUserData('your-unique-user-id', {
            coins,
            power,
            lastUpdateTime: Date.now()
        });

        h1.textContent = coins.toLocaleString();
        powerDisplay.textContent = power;

        generateCoinParticles(image, multitap, x, y);
        currentIncrement = updateRank();

        if (x < image.clientWidth && y < image.clientHeight) {
            if (x < 150 && y < 150) {
                image.style.transform = 'translate(-0.25rem, -0.25rem) skewY(-10deg) skewX(5deg)';
            } else if (x < 150 && y > 150) {
                image.style.transform = 'translate(-0.25rem, 0.25rem) skewY(-10deg) skewX(5deg)';
            } else if (x > 150 && y > 150) {
                image.style.transform = 'translate(0.25rem, 0.25rem) skewY(10deg) skewX(-5deg)';
            } else if (x > 150 && y < 150) {
                image.style.transform = 'translate(0.25rem, -0.25rem) skewY(10deg) skewX(-5deg)';
            }
        }

        setTimeout(() => {
            image.style.transform = 'translate(0px, 0px)';
        }, 100);

        updateProgressBar();
    }

    await saveUserData('your-unique-user-id', {
        coins,
        total,
        power,
        count,
        multitap,
        lastUpdateTime,
        currentRank,
        highestRank
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    const userId = 'your-unique-user-id'; // Replace with actual user ID
    await loadUserData(userId);
    accumulateOfflinePower();
});

setInterval(async () => {
    const now = Date.now();
    const elapsedTime = now - lastUpdateTime;
    const secondsElapsed = elapsedTime / 1000;

    if (power < total) {
        let increment = (Math.floor(Math.random() * 4 + 2 + currentIncrement)) * (secondsElapsed / 1000);
        power = Math.min(power + increment, total);

        await updateUserData('your-unique-user-id', { power, lastUpdateTime: now });
        powerDisplay.textContent = power;
        updateProgressBar();
    }

    lastUpdateTime = now;
    localStorage.setItem('lastUpdateTime', lastUpdateTime);
}, 1000);

const saveUserData = async (userId, data) => {
    try {
        await setDoc(doc(db, 'users', userId), data);
        console.log('User data saved successfully');
    } catch (error) {
        console.error('Error saving user data:', error);
    }
};

const loadUserData = async (userId) => {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('User data:', data);

            coins = data.coins || 0;
            total = data.total || 750;
            power = data.power || 750;
            count = data.count || 1;
            multitap = data.multitap || 1;
            lastUpdateTime = data.lastUpdateTime || Date.now();
            currentRank = data.currentRank || '';
            highestRank = data.highestRank || '';

            h1.textContent = coins.toLocaleString();
            totalDisplay.textContent = `${total}`;
            powerDisplay.textContent = power;
            rankDisplay.textContent = currentRank;

            updateProgressBar();
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
};

const updateUserData = async (userId, updatedData) => {
    try {
        await updateDoc(doc(db, 'users', userId), updatedData);
        console.log('User data updated successfully');
    } catch (error) {
        console.error('Error updating user data:', error);
    }
};

function accumulateOfflinePower() {
    const now = Date.now();
    const elapsedTime = now - lastUpdateTime;
    const secondsElapsed = elapsedTime / 1000;

    if (power < total) {
        let increment = Math.floor(Math.random() * 4 + 2 + currentIncrement) * (secondsElapsed / 1000);
        power = Math.min(power + increment, total);
        updateUserData('your-unique-user-id', { power, lastUpdateTime: now });
        powerDisplay.textContent = power;
        updateProgressBar();
    }

    lastUpdateTime = now;
}

function generateCoinParticles(image, multitap, x, y) {
    for (let i = 0; i < multitap; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.textContent = '+1';

        body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

function updateProgressBar() {
    const progress = (power / total) * 100;
    progressBar.style.width = `${progress}%`;
}

// Generate random background particles
for (let i = 0; i < 100; i++) {
    const particle = document.createElement('div');
    particle.className = 'bg-particle';
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.top = `${Math.random() * 100}vh`;
    particle.style.width = `${Math.random() * 5}px`;
    particle.style.height = `${Math.random() * 5}px`;
    particle.style.setProperty('--directionX', Math.random() < 0.5 ? -1 : 1);
    particle.style.setProperty('--directionY', Math.random() < 0.5 ? -1 : 1);

    backgroundParticlesContainer.appendChild(particle);
}

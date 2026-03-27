// Get or create user ID from localStorage
let userId = localStorage.getItem('userId');
if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
}

let yourScore = 0;

// Load data on page load
async function loadData() {
    try {
        const response = await fetch(`/api/stats?userId=${userId}`);
        const data = await response.json();

        yourScore = data.userScore || 0;
        document.getElementById('yourScore').textContent = yourScore;

        document.getElementById('globalRed').textContent = data.globalRed || 0;
        document.getElementById('globalBlue').textContent = data.globalBlue || 0;
        document.getElementById('globalTotal').textContent = data.globalTotal || 0;
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Update score in database
async function updateScore(color) {
    try {
        const response = await fetch('/api/click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                color: color
            })
        });

        const data = await response.json();

        yourScore = data.userScore;
        document.getElementById('yourScore').textContent = yourScore;

        document.getElementById('globalRed').textContent = data.globalRed;
        document.getElementById('globalBlue').textContent = data.globalBlue;
        document.getElementById('globalTotal').textContent = data.globalTotal;
    } catch (error) {
        console.error('Error updating score:', error);
    }
}

// Reset user score
async function resetScore() {
    try {
        const response = await fetch('/api/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId
            })
        });

        const data = await response.json();
        yourScore = 0;
        document.getElementById('yourScore').textContent = 0;

        document.getElementById('globalRed').textContent = data.globalRed;
        document.getElementById('globalBlue').textContent = data.globalBlue;
        document.getElementById('globalTotal').textContent = data.globalTotal;
    } catch (error) {
        console.error('Error resetting score:', error);
    }
}

// Event listeners
document.getElementById('redBtn').addEventListener('click', () => updateScore('red'));
document.getElementById('blueBtn').addEventListener('click', () => updateScore('blue'));
document.getElementById('resetBtn').addEventListener('click', resetScore);

// Load initial data
loadData();

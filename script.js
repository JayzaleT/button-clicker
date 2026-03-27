let score = 0;
const scoreElement = document.getElementById('score');
const redBtn = document.getElementById('redBtn');
const blueBtn = document.getElementById('blueBtn');
const resetBtn = document.getElementById('resetBtn');

function updateScore() {
    scoreElement.textContent = score;
}

redBtn.addEventListener('click', () => {
    score++;
    updateScore();
});

blueBtn.addEventListener('click', () => {
    score++;
    updateScore();
});

resetBtn.addEventListener('click', () => {
    score = 0;
    updateScore();
});
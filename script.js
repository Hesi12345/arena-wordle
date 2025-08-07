let currentItem = null;
let attempts = 0;
let maxAttempts = 3;
let isForbidden = false;
let lang = navigator.language.startsWith('pl') ? 'pl' : 'en';

const emojisWin = ['🎉', '🏆', '👏', '🔥', '✅'];
const emojisTooHigh = ['📉', '⬇️', '🔻'];
const emojisTooLow = ['📈', '⬆️', '🔺'];
const emojisLose = ['❌', '💀', '😢', '😭'];

const text = {
    pl: {
        item: "Przedmiot",
        guess: "Zgadnij",
        playAgain: "Zagraj ponownie",
        win: "Trafione! Cena:",
        lose: "Przegrana! Prawidłowa cena:",
        tooHigh: "Za dużo!",
        tooLow: "Za mało!",
        attemptsLeft: "Pozostało prób:",
        nextIn: "Następny przedmiot za"
    },
    en: {
        item: "Item",
        guess: "Guess",
        playAgain: "Play again",
        win: "Correct! Price:",
        lose: "You lost! Correct price:",
        tooHigh: "Too high!",
        tooLow: "Too low!",
        attemptsLeft: "Attempts left:",
        nextIn: "Next item in"
    }
};

function t(key) {
    return text[lang][key];
}

function randomEmoji(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function updateTexts() {
    document.getElementById('guess-button').textContent = t("guess");
    document.getElementById('reset-button').textContent = t("playAgain");
    document.getElementById('item-name').textContent = `${t("item")}: ${currentItem?.name || ""}`;
    updateAttemptsLabel();
    updateLangSwitch();
    const forbiddenInfoText = lang === 'pl'
        ? "Tryb trudny: tylko jedna próba na trafienie poprawnej ceny"
        : "Hard mode: one chance to guess the correct price";
    const forbiddenBtn = document.getElementById('forbidden-button');
    forbiddenBtn.textContent = `Forbidden Mode ${isForbidden ? 'ON' : 'OFF'}`;
    forbiddenBtn.classList.toggle('active', isForbidden);
    forbiddenBtn.title = lang === 'pl'
        ? (isForbidden ? "Kliknij, aby dezaktywować tryb trudny" : "Kliknij, aby aktywować tryb trudny")
        : (isForbidden ? "Click to disable hard mode" : "Click to enable hard mode");
    const infoIcon = document.getElementById('info-icon');
    if (infoIcon) {
        infoIcon.title = forbiddenInfoText;
    }
}

function updateAttemptsLabel() {
    const left = Math.max(maxAttempts - attempts, 0);
    document.getElementById('attempts-label').textContent = `${t("attemptsLeft")} ${left}`;
}

function updateLangSwitch() {
    const langButton = document.getElementById('lang-switch');
    langButton.textContent = lang.toUpperCase();
    langButton.className = lang.toLowerCase();
}

function updateCountdown() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = Math.floor((midnight - now) / 1000);
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    document.getElementById('countdown').textContent = `${t("nextIn")}: ${h}:${m}:${s}`;
}
setInterval(() => {
    updateCountdown();
    if (new Date().getSeconds() === 0) loadItem();
}, 1000);

async function loadItem() {
    const res = await fetch('./items.json');
    const items = await res.json();
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today - start + ((start.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000);
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    currentItem = items[dayOfYear % items.length];

    document.getElementById('item-name').textContent = `${t("item")}: ${currentItem.name}`;
    const img = document.getElementById('item-image');
    img.src = currentItem.image;
    img.style.display = 'block';
    updateAttemptsLabel();
}

function flashEffect(type) {
    const container = document.querySelector('.container');
    const className = type === 'win' ? 'flash-win' : 'flash-lose';
    container.classList.remove('flash-win', 'flash-lose');
    void container.offsetWidth;
    container.classList.add(className);
    setTimeout(() => container.classList.remove(className), 800);
}

function triggerConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

function playWinSound() {
    const sound = document.getElementById("win-sound");
    if (sound) sound.play();
}

function evaluateGuess() {
    const input = document.getElementById('guess-input');
    const guess = parseFloat(input.value);
    if (isNaN(guess) || guess <= 0 || !currentItem || attempts >= maxAttempts) {
        input.classList.add('input-error');
        return;
    } else {
        input.classList.remove('input-error');
    }

    const price = currentItem.price;
    const margin = price * 0.05;
    attempts++;

    let result = '';
    if (Math.abs(guess - price) <= margin) {
        result = `${randomEmoji(emojisWin)} ${t("win")} ${price}`;
        flashEffect('win');
        playWinSound();
        triggerConfetti();
        endGame();
    } else {
        flashEffect('lose');
        if (attempts >= maxAttempts) {
            result = `${randomEmoji(emojisLose)} ${t("lose")} ${price}`;
            endGame();
        } else if (guess > price + margin) {
            result = `${randomEmoji(emojisTooHigh)} ${t("tooHigh")}`;
        } else {
            result = `${randomEmoji(emojisTooLow)} ${t("tooLow")}`;
        }
    }

    document.getElementById('result').textContent = result;
    updateAttemptsLabel();
}

function endGame() {
    document.getElementById('guess-button').disabled = true;
    document.getElementById('guess-input').disabled = true;
}

document.getElementById('guess-button').addEventListener('click', evaluateGuess);
document.getElementById('reset-button').addEventListener('click', () => location.reload());
document.getElementById('lang-switch').addEventListener('click', () => {
    lang = lang === 'pl' ? 'en' : 'pl';
    updateTexts();
});

document.getElementById('forbidden-button').addEventListener('click', () => {
    isForbidden = !isForbidden;
    maxAttempts = isForbidden ? 1 : 3;
    attempts = 0;
    document.getElementById('guess-button').disabled = false;
    document.getElementById('guess-input').disabled = false;
    document.getElementById('result').textContent = '';
    updateTexts();
});

loadItem();
updateTexts();
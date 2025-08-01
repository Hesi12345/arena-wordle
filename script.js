let currentItem = null;
let attempts = 0;
const maxAttempts = 3;
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

setInterval(updateCountdown, 1000);

async function loadItem() {
    const res = await fetch('items.json');
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
    document.getElementById('attempts').textContent = `${t("attemptsLeft")} ${maxAttempts - attempts}`;
}

function evaluateGuess() {
    const guess = parseFloat(document.getElementById('guess-input').value);
    if (isNaN(guess) || !currentItem) return;

    const price = currentItem.price;
    const margin = price * 0.05;

    attempts++;

    let result = '';
    if (Math.abs(guess - price) <= margin) {
        result = `${randomEmoji(emojisWin)} ${t("win")} ${price}`;
        endGame();
    } else if (attempts >= maxAttempts) {
        result = `${randomEmoji(emojisLose)} ${t("lose")} ${price}`;
        endGame();
    } else if (guess > price + margin) {
        result = `${randomEmoji(emojisTooHigh)} ${t("tooHigh")}`;
    } else {
        result = `${randomEmoji(emojisTooLow)} ${t("tooLow")}`;
    }

    document.getElementById('result').textContent = result;
    document.getElementById('attempts').textContent = `${t("attemptsLeft")} ${maxAttempts - attempts}`;
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
    document.getElementById('item-name').textContent = `${t("item")}: ${currentItem.name}`;
});

loadItem();
updateTexts();

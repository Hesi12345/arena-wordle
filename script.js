let currentItem = null;
let attempts = 0;
const maxAttempts = 3;

async function loadItem() {
    const res = await fetch('items.json');
    const items = await res.json();

    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today - start + ((start.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000);
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    currentItem = items[dayOfYear % items.length];

    document.getElementById('item-name').textContent = `Przedmiot: ${currentItem.name}`;
    const img = document.getElementById('item-image');
    img.src = currentItem.image;
    img.style.display = 'block';
    document.getElementById('attempts').textContent = `Pozostało prób: ${maxAttempts - attempts}`;
}

function evaluateGuess() {
    const guess = parseFloat(document.getElementById('guess-input').value);
    if (isNaN(guess) || !currentItem) return;

    const price = currentItem.price;
    const margin = price * 0.05;

    attempts++;

    let result = '';
    if (Math.abs(guess - price) <= margin) {
        result = `🎉 Trafione! Cena: ${price}`;
        endGame();
    } else if (attempts >= maxAttempts) {
        result = `❌ Przegrana! Prawidłowa cena: ${price}`;
        endGame();
    } else if (guess > price + margin) {
        result = '📉 Za dużo!';
    } else {
        result = '📈 Za mało!';
    }

    document.getElementById('result').textContent = result;
    document.getElementById('attempts').textContent = `Pozostało prób: ${maxAttempts - attempts}`;
}

function endGame() {
    document.getElementById('guess-button').disabled = true;
    document.getElementById('guess-input').disabled = true;
}

document.getElementById('guess-button').addEventListener('click', evaluateGuess);
document.getElementById('reset-button').addEventListener('click', () => location.reload());

loadItem();

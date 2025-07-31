let currentItem = null;

async function loadItem() {
    const res = await fetch('items.json');
    const items = await res.json();

    // Wyliczamy dzień roku jako indeks
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today - start + ((start.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000);
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    currentItem = items[dayOfYear % items.length]; // cyklicznie po liście
    document.getElementById('item-name').textContent = `Przedmiot: ${currentItem.name}`;
}

function evaluateGuess() {
    const guess = parseFloat(document.getElementById('guess-input').value);
    if (isNaN(guess)) return;

    const price = currentItem.price;
    const margin = price * 0.05;

    let result = '';
    if (Math.abs(guess - price) <= margin) {
        result = '🎉 Trafione!';
    } else if (guess > price + margin) {
        result = '📉 Za dużo!';
    } else {
        result = '📈 Za mało!';
    }
    document.getElementById('result').textContent = result;
}

document.getElementById('guess-button').addEventListener('click', evaluateGuess);
document.getElementById('reset-button').addEventListener('click', () => {
    location.reload();
});

loadItem();

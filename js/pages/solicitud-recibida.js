document.addEventListener('DOMContentLoaded', () => {
    const selectedCardName = document.querySelector('#selectedCardName');
    const requestCode = document.querySelector('#requestCode');
    const countdownEl = document.querySelector('#countdown');
    const dashboardRedirect = 'dashboard.html';

    const cardName = sessionStorage.getItem('selectedCard') || 'classic';
    const cardLabel = cardName === 'classic'
        ? 'ASTRO Classic'
        : cardName === 'gold'
            ? 'ASTRO Gold'
            : cardName === 'platinum'
                ? 'ASTRO Platinum'
                : 'ASTRO Classic';

    if (selectedCardName) {
        selectedCardName.textContent = cardLabel;
    }

    if (requestCode) {
        const randomCode = 'SOL-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        requestCode.textContent = randomCode;
    }

    let timeLeft = 20;
    const interval = setInterval(() => {
        if (!countdownEl) return;
        timeLeft -= 1;
        countdownEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(interval);
            window.location.href = dashboardRedirect;
        }
    }, 1000);
});

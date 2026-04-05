document.addEventListener('DOMContentLoaded', () => {
    const contactEmail = document.querySelector('#contactEmail');
    const countdownEl = document.querySelector('#countdown');
    const dashboardRedirect = 'dashboard.html';

    const email = sessionStorage.getItem('contactEmail') || 'tu@email.com';

    if (contactEmail) {
        contactEmail.textContent = email;
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
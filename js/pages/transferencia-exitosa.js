/* =========================================
   PÁGINA DE ÉXITO - TRANSFERENCIA
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const countdownEl = document.querySelector('#countdown');
    const dashboardRedirect = 'dashboard.html';

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

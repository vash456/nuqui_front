document.addEventListener('DOMContentLoaded', () => {
    const cardForm = document.querySelector('#cardForm');

    if (cardForm) {
        cardForm.addEventListener('submit', (event) => {
            event.preventDefault();

            if (cardForm.checkValidity()) {
                window.location.href = 'solicitud-recibida.html';
            } else {
                cardForm.reportValidity();
            }
        });
    }
});

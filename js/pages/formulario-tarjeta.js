import uiService from '../services/uiService.js';

// Validar sesión al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  uiService.checkSession();
});

// Manejar cierre de sesión
const logoutLink = document.querySelector('#logoutLink');
logoutLink?.addEventListener('click', event => {
  event.preventDefault();
  uiService.manageLogoutLink();
});

// Funcionalidad específica para formulario de tarjeta
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

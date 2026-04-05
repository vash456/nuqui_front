import uiService from '../services/uiService.js';

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('#contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.querySelector('#email').value;
            const message = document.querySelector('#message').value;

            // Guardar el email en sessionStorage
            sessionStorage.setItem('contactEmail', email);

            // Redirigir a la página de éxito
            window.location.href = 'mensaje-enviado.html';
        });
    }
});

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
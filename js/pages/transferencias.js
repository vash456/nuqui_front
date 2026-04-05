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

/* =========================================
   FUNCIONALIDAD DE TRANSFERENCIAS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const transferForm = document.querySelector('#transferForm');

    if (transferForm) {
        transferForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Redirigir a la página de éxito
            window.location.href = 'transferencia-exitosa.html';
        });
    }
});

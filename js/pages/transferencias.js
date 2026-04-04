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

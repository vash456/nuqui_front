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

document.addEventListener('DOMContentLoaded', () => {
    const cardItems = document.querySelectorAll('.card-selection-item');
    const continueBtn = document.querySelector('#continueBtn');
    const validationMessage = document.querySelector('#validationMessage');
    let selectedCard = null;

    // Manejar click en las tarjetas
    cardItems.forEach(card => {
        card.addEventListener('click', () => {
            // Remover selección anterior
            cardItems.forEach(c => c.classList.remove('selected'));
            
            // Agregar selección a la tarjeta clickeada
            card.classList.add('selected');
            selectedCard = card.dataset.card;
            
            // Ocultar mensaje de validación
            validationMessage.style.display = 'none';
        });
    });

    // Manejar click en el botón continuar
    continueBtn.addEventListener('click', () => {
        if (!selectedCard) {
            // Mostrar mensaje de validación
            validationMessage.style.display = 'block';
        } else {
            // Guardar la tarjeta seleccionada en sessionStorage
            sessionStorage.setItem('selectedCard', selectedCard);
            // Redirigir al formulario
            window.location.href = 'formulario-tarjeta.html';
        }
    });
});
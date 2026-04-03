import authService from '../services/authService.js';

const logoutLink = document.querySelector('#logoutLink');
const eyeIcon = document.querySelector('.eye-icon');
const balanceAmount = document.querySelector('.balance-info h2');

let balanceVisible = true;
const originalBalance = balanceAmount?.textContent || '$43,871.25';

logoutLink?.addEventListener('click', event => {
  event.preventDefault();
  authService.logout();
  window.location.href = 'login.html';
});

// Funcionalidad para ocultar/mostrar balance
eyeIcon?.addEventListener('click', () => {
  if (balanceVisible) {
    // Ocultar balance
    balanceAmount.textContent = '*****';
    eyeIcon.className = 'fas fa-eye-slash eye-icon';
  } else {
    // Mostrar balance
    balanceAmount.textContent = originalBalance;
    eyeIcon.className = 'far fa-eye eye-icon';
  }
  balanceVisible = !balanceVisible;
});
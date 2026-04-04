import { Cliente } from '../models/Cliente.js';
import authService from '../services/authService.js';
import uiService from '../services/uiService.js';

// Validar sesión al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  uiService.checkSession();
});

// Manejar cierre de sesión
const logoutLink = document.querySelector('#logoutLink');
const eyeIcon = document.querySelector('.eye-icon');
const balanceAmount = document.querySelector('.balance-info h2');
const cardAmounts = document.querySelectorAll('.account-card .amount');

let balanceVisible = true;
const originalBalance = balanceAmount?.textContent || '$43,871.25';
const originalAmounts = Array.from(cardAmounts).map(el => el.textContent);

logoutLink?.addEventListener('click', event => {
  event.preventDefault();
  uiService.manageLogoutLink();
});

// Funcionalidad para ocultar/mostrar balance
eyeIcon?.addEventListener('click', () => {
  if (balanceVisible) {
    // Ocultar balance
    balanceAmount.textContent = '*****';
    cardAmounts.forEach(el => {
      el.textContent = '*****';
    });
    eyeIcon.className = 'fas fa-eye-slash eye-icon';
  } else {
    // Mostrar balance
    balanceAmount.textContent = originalBalance;
    cardAmounts.forEach((el, index) => {
      el.textContent = originalAmounts[index];
    });
    eyeIcon.className = 'far fa-eye eye-icon';
  }
  balanceVisible = !balanceVisible;
});
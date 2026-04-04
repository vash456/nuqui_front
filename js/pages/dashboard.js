import { Cliente } from '../models/Cliente.js';
import authService from '../services/authService.js';
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
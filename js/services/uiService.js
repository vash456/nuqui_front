import authService from './authService.js';
import sesionService from './sesionService.js';
import { Cliente } from '../models/Cliente.js';

const uiService = {
  showMessage(element, message, type = 'error') {
    if (!element) return;
    element.textContent = message;
    element.className = type === 'success' ? 'form-message success' : 'form-message error';
    element.style.display = 'block';
  },

  clearMessage(element) {
    if (!element) return;
    element.textContent = '';
    element.className = 'form-message';
    element.style.display = 'none';
  },

  showLoading(button, text = 'Cargando...') {
    if (!button) return;
    button.disabled = true;
    button.textContent = text;
  },

  hideLoading(button, originalText = 'Enviar') {
    if (!button) return;
    button.disabled = false;
    button.textContent = originalText;
  },

  checkSession(redirectUrl = 'login.html') {
    const currentUser = sesionService.getCurrentUser();
    if (!currentUser) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  },

  manageLogoutLink(redirectUrl = 'login.html') {
    const currentUser = sesionService.getCurrentUser();
    if (currentUser) {
      const cliente = new Cliente(
        currentUser.id,
        currentUser.identificacion,
        currentUser.nombre,
        currentUser.telefono,
        currentUser.usuario,
        currentUser.email,
        currentUser.fechaNacimiento,
        null,
        currentUser.fechaRegistro
      );
      cliente.cerrarSesion();
    } else {
      authService.logout();
    }

    window.location.href = redirectUrl;
  }
};

export default uiService;
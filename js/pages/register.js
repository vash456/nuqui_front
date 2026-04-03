import authService from '../services/authService.js';
import uiService from '../services/uiService.js';

const registerForm = document.querySelector('#registerForm');
const messageBox = document.querySelector('#registerMessage');

registerForm?.addEventListener('submit', event => {
  event.preventDefault(); // Evita el envío del formulario
  uiService.clearMessage(messageBox);

  const formData = new FormData(registerForm);
  const password = formData.get('password')?.toString().trim() || '';
  const confirmPassword = formData.get('confirmPassword')?.toString().trim() || '';

  if (password !== confirmPassword) {
    uiService.showMessage(messageBox, 'Las contraseñas no coinciden.');
    return;
  }

  const userData = {
    nombre: formData.get('nombre')?.toString().trim() || '',
    identificacion: formData.get('identificacion')?.toString().trim() || '',
    usuario: formData.get('usuario')?.toString().trim() || '',
    email: formData.get('email')?.toString().trim() || '',
    telefono: formData.get('telefono')?.toString().trim() || '',
    password,
  };

  const result = authService.register(userData);

  if (!result.success) {
    uiService.showMessage(messageBox, result.message);
    return;
  }

  uiService.showMessage(messageBox, result.message, 'success');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1200);
});

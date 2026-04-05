import authService from '../services/authService.js';
import uiService from '../services/uiService.js';
import iniciarProductosService from '../services/iniciarProductosService.js';

const registerForm = document.querySelector('#registerForm');
const messageBox = document.querySelector('#registerMessage');

// Hacer que el icono de calendario abra el selector de fecha
const fechaInput = document.querySelector('#fechaNacimiento');
const calendarIcon = fechaInput?.parentElement.querySelector('.fa-calendar-alt');

calendarIcon?.addEventListener('click', () => {
  if (fechaInput.showPicker) {
    fechaInput.showPicker(); // Para browsers que lo soportan
  } else {
    fechaInput.focus(); // Fallback
    fechaInput.click();
  }
});

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
    fechaNacimiento: formData.get('fechaNacimiento')?.toString() || '',
    password,
  };

  const result = authService.register(userData);

  if (!result.success) {
    uiService.showMessage(messageBox, result.message);
    return;
  }

  // Inicializar productos para el nuevo usuario
  iniciarProductosService.inicializarProductosCliente(result.user);
  

  uiService.showMessage(messageBox, result.message, 'success');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1200);
});

import authService from '../services/authService.js';

const logoutLink = document.querySelector('#logoutLink');

logoutLink?.addEventListener('click', event => {
  event.preventDefault();
  authService.logout();
  window.location.href = 'login.html';
});
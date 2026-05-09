import uiService from '../services/uiService.js';

document.addEventListener('DOMContentLoaded', () => {
  uiService.setupPublicPageNav();

  const contactForm = document.querySelector('#contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();

      const email = document.querySelector('#email').value;

      sessionStorage.setItem('contactEmail', email);
      window.location.href = 'mensaje-enviado.html';
    });
  }
});

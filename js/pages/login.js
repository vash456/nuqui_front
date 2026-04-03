import authService from "../services/authService.js";  
import uiService from "../services/uiService.js";

const loginForm = document.querySelector('#loginForm');
const messageBox = document.querySelector('#loginMessage');

loginForm?.addEventListener('submit', event => {
    event.preventDefault(); // Evita el envío del formulario
    uiService.clearMessage(messageBox);

    const formData = new FormData(loginForm);
    const identifier = formData.get('identifier')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';

    const result = authService.login(identifier, password);
console.log(result);
    if (!result.success) {
        uiService.showMessage(messageBox, result.message);
        return;
    }
    
    

    uiService.showMessage(messageBox, result.message, 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1200);

});
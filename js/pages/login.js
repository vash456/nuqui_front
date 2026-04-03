import authService from "../services/authService";  
import uiService from "../services/uiService";

const loginForm = document.querySelector('#loginForm');
const messageBox = document.querySelector('#loginMessage');

loginForm?.addEventListener('submit', event => {
    event.preventDefault();
    uiService.clearMessage(messageBox);
});
import { Cliente } from '../models/Cliente.js';
import authService from '../services/authService.js';
import sesionService from '../services/sesionService.js';
import uiService from '../services/uiService.js';
import productosService from '../services/productosService.js';

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

// Funcionalidad específica para perfil de usuario
document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.querySelector('#profileForm');
    const nameInput = document.querySelector('#profileName');
    const userInput = document.querySelector('#profileUser');
    const identificationInput = document.querySelector('#profileIdentification');
    const emailInput = document.querySelector('#profileEmail');
    const phoneInput = document.querySelector('#profilePhone');
    const birthdateInput = document.querySelector('#profileBirthdate');
    const saveMessage = document.querySelector('#saveMessage');
    const sidebarName = document.querySelector('.user-summary-card h3');
    const sidebarEmail = document.querySelector('.user-email');
    const clientSinceDate = document.querySelector('#clientSinceDate');
    const activeProductsCount = document.querySelector('#activeProductsCount');
    const avatarCircle = document.querySelector('.avatar');

    // Password change elements
    const changePasswordBtn = document.querySelector('#changePasswordBtn');
    const changePasswordForm = document.querySelector('#changePasswordForm');
    const passwordForm = document.querySelector('#passwordForm');
    const currentPasswordInput = document.querySelector('#currentPassword');
    const newPasswordInput = document.querySelector('#newPassword');
    const confirmPasswordInput = document.querySelector('#confirmPassword');
    const passwordMessage = document.querySelector('#passwordMessage');
    const cancelChangePassword = document.querySelector('#cancelChangePassword');

    function getInitials(name) {
        if (!name) return '';
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length === 0) return '';
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        const firstInitial = parts[0].charAt(0).toUpperCase();
        const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
        return `${firstInitial}${lastInitial}`;
    }

    function updateAvatarInitials(name) {
        if (avatarCircle) {
            avatarCircle.textContent = getInitials(name);
        }
    }

    function formatDateInSpanish(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return dateString;
        
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Intl.DateTimeFormat('es-ES', options).format(date);
    }

    function countActiveProducts(userId) {
        try {
            const productos = productosService.obtenerProductosCliente(userId);
            if (!productos) return 0;

            const cuentas = productos.listarCuentas() || [];
            const tarjetas = productos.listarTarjetas() || [];

            const activeAccounts = cuentas.filter(c => c.estado === 'activa').length;
            const activeCards = tarjetas.filter(t => t.estado === 'activa').length;

            return activeAccounts + activeCards;
        } catch (error) {
            console.error('Error contando productos activos:', error);
            return 0;
        }
    }

    function loadProfile() {
        const currentUser = sesionService.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        const users = authService.getUsers();
        const storedUser = users.find(user => user.id === currentUser.id);
        if (!storedUser) {
            window.location.href = 'login.html';
            return;
        }

        if (nameInput) nameInput.value = storedUser.nombreCompleto || '';
        if (userInput) userInput.value = storedUser.usuario || '';
        if (identificationInput) identificationInput.value = storedUser.identificacion || '';
        if (emailInput) emailInput.value = storedUser.email || '';
        if (phoneInput) phoneInput.value = storedUser.celular || '';
        if (birthdateInput) birthdateInput.value = storedUser.fechaNacimiento || '';
        if (sidebarName) sidebarName.textContent = storedUser.nombreCompleto || '';
        if (sidebarEmail) sidebarEmail.textContent = storedUser.email || '';
        if (clientSinceDate) clientSinceDate.textContent = formatDateInSpanish(storedUser.fechaRegistro || '');
        
        const activeCount = countActiveProducts(currentUser.id);
        if (activeProductsCount) {
            activeProductsCount.textContent = activeCount > 0 ? `${activeCount} producto${activeCount > 1 ? 's' : ''}` : '0 productos';
        }
        
        updateAvatarInitials(storedUser.nombreCompleto || storedUser.usuario || '');
    }

    function saveProfile(event) {
        event.preventDefault();

        const currentUser = sesionService.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        const users = authService.getUsers();
        const storedUser = users.find(user => user.id === currentUser.id);
        if (!storedUser) {
            window.location.href = 'login.html';
            return;
        }

        const cliente = new Cliente(
            storedUser.id,
            storedUser.identificacion,
            storedUser.nombreCompleto,
            storedUser.celular,
            storedUser.usuario,
            storedUser.email,
            storedUser.fechaNacimiento,
            storedUser.contrasena
        );

        const result = cliente.editarPerfil({
            nombreCompleto: nameInput.value.trim(),
            usuario: userInput.value.trim(),
            email: emailInput.value.trim(),
            celular: phoneInput.value.trim(),
            fechaNacimiento: storedUser.fechaNacimiento || ''
        });

        if (!result.success) {
            uiService.showMessage(saveMessage, result.message, 'error');
            return;
        }

        const updatedUser = sesionService.getCurrentUser();
        if (sidebarName) sidebarName.textContent = updatedUser.nombreCompleto || '';
        if (sidebarEmail) sidebarEmail.textContent = updatedUser.email || '';
        updateAvatarInitials(updatedUser.nombreCompleto || updatedUser.usuario || '');

        uiService.showMessage(saveMessage, result.message, 'success');
        setTimeout(() => {
            saveMessage.style.display = 'none';
        }, 3000);
    }

    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }

    // Password change functionality
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            changePasswordForm.style.display = changePasswordForm.style.display === 'none' ? 'block' : 'none';
        });
    }

    if (cancelChangePassword) {
        cancelChangePassword.addEventListener('click', () => {
            changePasswordForm.style.display = 'none';
            passwordForm.reset();
            passwordMessage.style.display = 'none';
        });
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (newPassword !== confirmPassword) {
                showPasswordMessage('Las contraseñas nuevas no coinciden.', 'error');
                return;
            }

            if (newPassword.length < 6) {
                showPasswordMessage('La nueva contraseña debe tener al menos 6 caracteres.', 'error');
                return;
            }

            try {
                const currentUser = sesionService.getCurrentUser();
                if (!currentUser || !currentUser.id) {
                    showPasswordMessage('No se pudo identificar al usuario actual.', 'error');
                    return;
                }

                const result = authService.updatePassword(currentUser.id, currentPassword, newPassword);

                if (result.success) {
                    showPasswordMessage(result.message, 'success');
                    passwordForm.reset();
                    setTimeout(() => {
                        changePasswordForm.style.display = 'none';
                    }, 2000);
                } else {
                    showPasswordMessage(result.message, 'error');
                }
            } catch (error) {
                showPasswordMessage('Error al cambiar la contraseña.', 'error');
            }
        });
    }

    function showPasswordMessage(message, type) {
        if (passwordMessage) {
            passwordMessage.textContent = message;
            passwordMessage.className = `form-message ${type}`;
            passwordMessage.style.display = 'block';
        }
    }

    loadProfile();
});
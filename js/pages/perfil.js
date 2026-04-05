import authService from '../services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
    const storageKey = 'astroUserProfile';
    const profileForm = document.querySelector('#profileForm');
    const nameInput = document.querySelector('#profileName');
    const emailInput = document.querySelector('#profileEmail');
    const phoneInput = document.querySelector('#profilePhone');
    const addressInput = document.querySelector('#profileAddress');
    const birthdateInput = document.querySelector('#profileBirthdate');
    const saveMessage = document.querySelector('#saveMessage');
    const sidebarName = document.querySelector('.user-summary-card h3');
    const sidebarEmail = document.querySelector('.user-email');
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

    function loadProfile() {
        const profileData = localStorage.getItem(storageKey);
        if (!profileData) return;

        const profile = JSON.parse(profileData);
        if (nameInput && profile.name) nameInput.value = profile.name;
        if (emailInput && profile.email) emailInput.value = profile.email;
        if (phoneInput && profile.phone) phoneInput.value = profile.phone;
        if (addressInput && profile.address) addressInput.value = profile.address;
        if (birthdateInput && profile.birthdate) birthdateInput.value = profile.birthdate;
        if (sidebarName && profile.name) sidebarName.textContent = profile.name;
        if (sidebarEmail && profile.email) sidebarEmail.textContent = profile.email;
        if (profile.name) updateAvatarInitials(profile.name);
    }

    function saveProfile(event) {
        event.preventDefault();

        const profile = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            address: addressInput.value.trim(),
            birthdate: birthdateInput.value
        };

        localStorage.setItem(storageKey, JSON.stringify(profile));

        if (sidebarName) sidebarName.textContent = profile.name;
        if (sidebarEmail) sidebarEmail.textContent = profile.email;
        updateAvatarInitials(profile.name);

        if (saveMessage) {
            saveMessage.style.display = 'block';
            saveMessage.textContent = 'Tus cambios se guardaron correctamente.';
            setTimeout(() => {
                saveMessage.style.display = 'none';
            }, 3000);
        }
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
                const currentUser = authService.getCurrentUser();
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
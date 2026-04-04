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

    loadProfile();
});
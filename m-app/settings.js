import { API, utils } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const accountSettingsForm = document.getElementById('accountSettingsForm');
    const preferencesForm = document.getElementById('preferencesForm');
    const deleteAccountButton = document.getElementById('delete-account');
    const profileButton = document.querySelector('.profile-button');
    const dropdown = document.querySelector('.dropdown');
    
    // Handle profile dropdown toggle
    profileButton.addEventListener('click', () => {
        const expanded = profileButton.getAttribute('aria-expanded') === 'true';
        profileButton.setAttribute('aria-expanded', !expanded);
        dropdown.style.display = expanded ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!profileButton.contains(event.target) && !dropdown.contains(event.target)) {
            profileButton.setAttribute('aria-expanded', 'false');
            dropdown.style.display = 'none';
        }
    });
    
    // Add logout functionality
    const logoutLink = document.querySelector('.logout');
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }
    
    deleteAccountButton.addEventListener('click', handleDeleteAccount);


    // Load user settings
    utils.showLoader();
    try {
        const userSettings = await API.getUserSettings();
        populateSettings(userSettings);
    } catch (error) {
        console.error('Error loading user settings:', error);
    } finally {
        utils.hideLoader();
    }

    accountSettingsForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(accountSettingsForm);
        const accountSettings = Object.fromEntries(formData.entries());
        
        // Validate passwords before API call
        const password = accountSettings.password;
        const confirmPassword = accountSettings['confirm-password'];
        if (password && password !== confirmPassword) {
            showMessage('Passwords do not match. Please try again.', true);
            return;
        }
        
        utils.showLoader();
        try {
            await API.updateAccountSettings(accountSettings);
            showMessage('Account settings saved successfully!');
        } catch (error) {
            console.error('Error saving account settings:', error);
            showMessage('An error occurred while saving account settings. Please try again.', true);
        } finally {
            utils.hideLoader();
        }
    });

    preferencesForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        utils.showLoader();

        const formData = new FormData(preferencesForm);
        const preferences = Object.fromEntries(formData.entries());
        preferences.notifications = formData.get('notifications') === 'on';

        try {
            await API.updatePreferences(preferences);
            showMessage('Preferences saved successfully!');
        } catch (error) {
            console.error('Error saving preferences:', error);
            showMessage('An error occurred while saving preferences. Please try again.', true);
        } finally {
            utils.hideLoader();
        }
    });

    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }
});

function populateSettings(userSettings) {
    document.getElementById('username').value = userSettings.username;
    document.getElementById('email').value = userSettings.email;
    document.getElementById('theme').value = userSettings.theme;
    document.getElementById('notifications').checked = userSettings.notifications;
}

async function handleLogout() {
    utils.showLoader();
    try {
        await API.logout();
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('An error occurred during logout. Please try again.', true);
    } finally {
        utils.hideLoader();
    }
}


function showMessage(message, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isError ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    messageDiv.style.animation = 'slideIn 0.3s ease-out';
    
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

async function handleDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        utils.showLoader();
        try {
            await API.deleteAccount();
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error deleting account:', error);
            showMessage('An error occurred while deleting your account. Please try again.', true);
        } finally {
            utils.hideLoader();
        }
    }
}

function handleError(error) {
    console.error('An error occurred:', error);
    showMessage('An error occurred. Please try again later.', true);
}

@keyframes slideIn {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-100%); opacity: 0; }
}

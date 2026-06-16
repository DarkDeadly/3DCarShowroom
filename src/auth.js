
const authToggleTrigger = document.getElementById('auth-toggle-trigger');
const usernameGroup = document.getElementById('username-group');
const authFormTitle = document.getElementById('auth-form-title');
const authFormSubtitle = document.getElementById('auth-form-subtitle');
const forgotPassAnchor = document.getElementById('forgot-pass-anchor');
const submitBtnText = document.getElementById('submit-btn-text');
const toggleSwitchPrompt = document.getElementById('toggle-switch-prompt');

let isLoginState = true; // Baseline state

authToggleTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginState = !isLoginState;

    if (isLoginState) {
        authFormTitle.textContent = "Welcome Back";
        authFormSubtitle.textContent = "Enter your credentials to access your CarSphere showroom.";
        submitBtnText.textContent = "Sign In";
        toggleSwitchPrompt.textContent = "Don't have an account?";
        authToggleTrigger.textContent = "Create one";
        
        usernameGroup.classList.add('d-none');
        forgotPassAnchor.classList.remove('d-none');
    } else {
        authFormTitle.textContent = "Create Account";
        authFormSubtitle.textContent = "Join CarSphere to explore and manage interactive 3D automotive profiles.";
        submitBtnText.textContent = "Register";
        toggleSwitchPrompt.textContent = "Already have an account?";
        authToggleTrigger.textContent = "Sign in here";
        
        usernameGroup.classList.remove('d-none');
        forgotPassAnchor.classList.add('d-none');
    }
});
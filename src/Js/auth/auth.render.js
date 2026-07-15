



const clearFeedback = (element) => {
    if (!element) return
    element.className = 'auth-feedback d-none'
    element.textContent = ''
}

const setLoadingState = (isLoading, isLoginState , element) => {
    element.disabled = isLoading
    element.textContent = isLoading
        ? (isLoginState ? 'Verifying...' : 'Creating Account...')
        : (isLoginState ? 'Sign In' : 'Register')
}

const renderLoginMode = (title, subtitle, submitBtn, toggleSwitchPrompt, authToggleTrigger, usernameGroup, forgotPassAnchor) => {
    title.textContent = 'Welcome Back'
    subtitle.textContent = 'Enter your credentials to access your CarSphere showroom.'
    submitBtn.textContent = 'Sign In'
    toggleSwitchPrompt.textContent = "Don't have an account?"
    authToggleTrigger.textContent = 'Create one'
    usernameGroup?.classList.add('d-none')
    forgotPassAnchor?.classList.remove('d-none')
}

const renderRegisterMode = (title, subtitle, submitBtn, toggleSwitchPrompt, authToggleTrigger, usernameGroup, forgotPassAnchor) => {
    title.textContent = 'Create Account'
    subtitle.textContent = 'Join CarSphere to explore and manage interactive 3D automotive profiles.'
    submitBtn.textContent = 'Register'
    toggleSwitchPrompt.textContent = 'Already have an account?'
    authToggleTrigger.textContent = 'Sign in here'
    usernameGroup?.classList.remove('d-none')
    forgotPassAnchor?.classList.add('d-none')
}


export { clearFeedback, setLoadingState, renderLoginMode, renderRegisterMode }
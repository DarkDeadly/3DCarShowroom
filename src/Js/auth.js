// auth.js — corrected with HTML knowledge
import * as Data from './data.js'
import { initNavAuth } from './uiChanges.js'
import { showFeedback , navigateTo , navigateToWithDelay } from './utils.js'
import * as Render from "./auth/auth.render.js"
import * as Service from "./auth/auth.service.js"

const initAuthPage = () => {
    // These IDs all confirmed in HTML
    const authToggleTrigger = document.getElementById('auth-toggle-trigger')
    const usernameGroup = document.getElementById('username-group')
    const authFormTitle = document.getElementById('auth-form-title')
    const authFormSubtitle = document.getElementById('auth-form-subtitle')
    const forgotPassAnchor = document.getElementById('forgot-pass-anchor')
    const submitBtn = document.getElementById('submit-btn-text')  // IS the button
    const toggleSwitchPrompt = document.getElementById('toggle-switch-prompt')
    const feedbackArea = document.getElementById('auth-feedback')
    const form = document.getElementById('auth-form')
    const usernameInput = document.getElementById('username')
    const emailInput = document.getElementById('email')
    const passwordInput = document.getElementById('password')

    // Guard critical elements
    if (!form || !authToggleTrigger || !submitBtn) {
        console.error('[initAuthPage] critical elements missing')
        return
    }

    // ── State ─────────────────────────────────────
    let isLoginState = true
    Render.clearFeedback(feedbackArea)

    // ── Toggle ────────────────────────────────────
    authToggleTrigger.addEventListener('click', (e) => {
        e.preventDefault()
        isLoginState = !isLoginState
        Render.clearFeedback(feedbackArea)

        if (isLoginState) {
            Render.renderLoginMode(authFormTitle, authFormSubtitle, submitBtn, toggleSwitchPrompt, authToggleTrigger, usernameGroup, forgotPassAnchor)
        } else {
            Render.renderRegisterMode(authFormTitle, authFormSubtitle, submitBtn, toggleSwitchPrompt, authToggleTrigger, usernameGroup, forgotPassAnchor)
        }
    })

    // ── Submit ────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const email = emailInput.value.trim()
        const password = passwordInput.value.trim()
        const username = usernameInput?.value.trim() ?? ''

        // UI validation — fast feedback before async
        if (!isLoginState && !username) {
            showFeedback(feedbackArea, 'Please enter a valid username.', 'error', 'auth-feedback')
            return
        }

        Render.setLoadingState(true, isLoginState, submitBtn)

        const result = await Service.authenticate({
            mode: isLoginState ? 'login' : 'register',
            email,
            password,
            username
        })

        // Guard clause — failure → return early
        if (!result.success) {
            console.error('[initAuthPage] auth failed:', result.error)
            showFeedback(feedbackArea, result.error || 'Authentication failed. Check your network.', 'error', 'auth-feedback')
            Render.setLoadingState(false, isLoginState, submitBtn)
            return
        }

        // Success — only reaches here when result.success === true
        showFeedback(feedbackArea,
            isLoginState
                ? 'Access granted! Redirecting...'
                : 'Registration successful! Redirecting...',
            'success', 'auth-feedback' // ← second argument required
        )
        form.reset()
        Render.setLoadingState(false, isLoginState, submitBtn)
        navigateToWithDelay('index.html', 1500)
    })
}

initAuthPage()
initNavAuth({ isAuthPage: true })
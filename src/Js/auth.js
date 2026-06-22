// auth.js — corrected with HTML knowledge
import * as Data from './data.js'
import { initNavAuth } from './uiChanges.js'
import {showFeedback} from './utils.js'

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

    const clearFeedback = () => {
        if (!feedbackArea) return
        feedbackArea.className = 'auth-feedback d-none'
        feedbackArea.textContent = ''
    }

    // submitBtn IS the button — .disabled and .textContent both work
    const setLoadingState = (isLoading) => {
        submitBtn.disabled = isLoading
        submitBtn.textContent = isLoading
            ? (isLoginState ? 'Verifying...' : 'Creating Account...')
            : (isLoginState ? 'Sign In' : 'Register')
    }

    // ── Toggle ────────────────────────────────────
    authToggleTrigger.addEventListener('click', (e) => {
        e.preventDefault()
        isLoginState = !isLoginState
        clearFeedback()

        if (isLoginState) {
            authFormTitle.textContent = 'Welcome Back'
            authFormSubtitle.textContent = 'Enter your credentials to access your CarSphere showroom.'
            submitBtn.textContent = 'Sign In'
            toggleSwitchPrompt.textContent = "Don't have an account?"
            authToggleTrigger.textContent = 'Create one'
            usernameGroup?.classList.add('d-none')
            forgotPassAnchor?.classList.remove('d-none')
        } else {
            authFormTitle.textContent = 'Create Account'
            authFormSubtitle.textContent = 'Join CarSphere to explore and manage interactive 3D automotive profiles.'
            submitBtn.textContent = 'Register'
            toggleSwitchPrompt.textContent = 'Already have an account?'
            authToggleTrigger.textContent = 'Sign in here'
            usernameGroup?.classList.remove('d-none')
            forgotPassAnchor?.classList.add('d-none')
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
            showFeedback(feedbackArea,'Please enter a valid username.', 'error','auth-feedback')
            return
        }

        setLoadingState(true)

        const result = isLoginState
            ? await Data.loginWithEmailAndPassword({ email, password })
            : await Data.emailPasswordAuthentication({ email, password, username })

        // Guard clause — failure → return early
        if (!result.success) {
            console.error('[initAuthPage] auth failed:', result.error)
            showFeedback(feedbackArea,result.error || 'Authentication failed. Check your network.', 'error','auth-feedback')
            setLoadingState(false)
            return
        }

        // Success — only reaches here when result.success === true
        showFeedback(feedbackArea ,
            isLoginState
                ? 'Access granted! Redirecting...'
                : 'Registration successful! Redirecting...',
            'success'  , 'auth-feedback' // ← second argument required
        )
        form.reset()
        setLoadingState(false)
        setTimeout(() => {
            window.location.href = 'index.html'
        }, 1500)
    })
}

initAuthPage()
initNavAuth({ isAuthPage: true })
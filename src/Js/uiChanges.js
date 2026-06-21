// uiChanges.js
import { onAuthStateCheck, logoutUser } from './data.js' // Fixed extension

/**
 * Initialize auth-aware navigation
 * @param {Object} options
 * @param {boolean} options.isAuthPage - true if this is the login/register page
 */
const initNavAuth = ({ isAuthPage = false } = {}) => {
    const navAction = document.querySelector('.nav-actions')
    if (!navAction) {
        console.warn('[initNavAuth] .nav-actions not found')
        return
    }

    onAuthStateCheck((user) => {
        if (user) {
            handleLoggedIn(navAction, isAuthPage)
        } else {
            handleLoggedOut(navAction, isAuthPage)
        }
    })
}

const handleLoggedIn = (container, isAuthPage) => {
    // If user navigates to login/register while already logged in → push them to app
    if (isAuthPage) {
        window.location.href = 'index.html'
        return
    }

    container.innerHTML = `
        <button class="btn-logout" id="logout-btn">Logout</button>
    `

    const logoutBtn = document.getElementById('logout-btn')
    if (!logoutBtn) return 

    logoutBtn.addEventListener('click', async () => {
        const result = await logoutUser()
        if (!result.success) {
            console.error('[handleLoggedIn] logout failed:', result.error)
        }
        // Observer automatically catches the state change and fires handleLoggedOut
    })   
}

const handleLoggedOut = (container, isAuthPage) => {
    // DRY — Render buttons once
    container.innerHTML = `
        <button class="btn-login" id="nav-login-btn">Login</button>
        <button class="btn-register" id="nav-register-btn">Register</button>
    `

    const loginBtn = document.getElementById('nav-login-btn')
    const registerBtn = document.getElementById('nav-register-btn')

    if (isAuthPage) {
        // We are ON the auth page. Clicking nav buttons should switch the form mode.
        const toggleTrigger = document.getElementById('auth-toggle-trigger')
        
        loginBtn?.addEventListener('click', () => {
            // If currently in register mode, click the toggle to switch to login
            if (document.getElementById('auth-form-title')?.textContent === 'Create Account') {
                toggleTrigger?.click()
            }
        })

        registerBtn?.addEventListener('click', () => {
            // If currently in login mode, click the toggle to switch to register
            if (document.getElementById('auth-form-title')?.textContent === 'Welcome Back') {
                toggleTrigger?.click()
            }
        })
        return
    }

    // We are on OTHER pages. Clicking nav buttons redirects to auth page.
    loginBtn?.addEventListener('click', () => {
        window.location.href = 'authentication.html'
    })
    registerBtn?.addEventListener('click', () => {
        window.location.href = 'authentication.html'
    })
}


const initAdminAddCarBtn = () => {
    const addBtn = document.getElementById('openAddModalBtn')
    if (!addBtn) return
    // we call onAuthStateCheck anc check the user and user.role 
    onAuthStateCheck((user) => {
        if (user && user.role ==='admin') {
            addBtn.style.display ='flex'
        }else {
            addBtn.style.display='none'
        }
    })
}



export { initNavAuth , initAdminAddCarBtn}
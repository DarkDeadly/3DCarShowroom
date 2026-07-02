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
    })   
}

const handleLoggedOut = (container, isAuthPage) => {
    container.innerHTML = `
        <button class="btn-login" id="nav-login-btn">Login</button>
        <button class="btn-register" id="nav-register-btn">Register</button>
    `

    const loginBtn = document.getElementById('nav-login-btn')
    const registerBtn = document.getElementById('nav-register-btn')

    if (isAuthPage) {
        const toggleTrigger = document.getElementById('auth-toggle-trigger')
        
        loginBtn?.addEventListener('click', () => {
            if (document.getElementById('auth-form-title')?.textContent === 'Create Account') {
                toggleTrigger?.click()
            }
        })

        registerBtn?.addEventListener('click', () => {
            if (document.getElementById('auth-form-title')?.textContent === 'Welcome Back') {
                toggleTrigger?.click()
            }
        })
        return
    }

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
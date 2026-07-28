// uiChanges.js
import { onAuthStateCheck, logoutUser } from './data.js' // Fixed extension
import * as Service from "./authorization/authorization.service.js"
import { navigateTo } from "./utils.js"

const renderLoggedOutNavigation = (container) => {
    container.innerHTML = `
        <button class="btn-login" id="nav-login-btn">Login</button>
        <button class="btn-register" id="nav-register-btn">Register</button>
    `
}
const bindToggleEvents = (loginBtn, registerBtn) => {
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
const bindNavigationEvents = (loginBtn, registerBtn) => {
    loginBtn?.addEventListener('click', () => {
        window.location.href = 'authentication.html'
    })
    registerBtn?.addEventListener('click', () => {
        window.location.href = 'authentication.html'
    })
}




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
        navigateTo('index.html')
        return
    }
    container.innerHTML = `
       <button class="btn-cart-toggle" id="cart-btn" aria-label="Open Cart" title="View Cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cart-icon">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span class="cart-badge" id="cart-badge-count">0</span>
        </button>

        <!-- Minimalist Logout CTA -->
        <button class="btn-logout" id="logout-btn">Logout</button>
    `
    const logoutBtn = document.getElementById('logout-btn')
    const cartBtn = document.getElementById('cart-btn')
    if (!logoutBtn) return

    logoutBtn.addEventListener('click', async () => {
        const result = await Service.handleLogout()
        if (!result.success) {
            console.error('Logout failed')
            return
        }
        navigateTo(result.data)
    })
    cartBtn?.addEventListener('click', () => {
        navigateTo('cart.html')
    })
}

const handleLoggedOut = (container, isAuthPage) => {
    renderLoggedOutNavigation(container)
    const loginBtn = document.getElementById('nav-login-btn')
    const registerBtn = document.getElementById('nav-register-btn')

    if (isAuthPage) {
        bindToggleEvents(loginBtn, registerBtn)
        return
    }

    bindNavigationEvents(loginBtn, registerBtn)
}


const initAdminAddCarBtn = () => {
    const addBtn = document.getElementById('openAddModalBtn')
    if (!addBtn) return
    // we call onAuthStateCheck anc check the user and user.role 
    onAuthStateCheck((user) => {
        if (user && user.role === 'admin') {
            addBtn.style.display = 'flex'
        } else {
            addBtn.style.display = 'none'
        }
    })
}



export { initNavAuth, initAdminAddCarBtn }
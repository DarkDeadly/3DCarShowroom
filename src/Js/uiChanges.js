// uiChanges.js
import { onAuthStateCheck, logoutUser } from './data.js' // Fixed extension
import * as Service from "./authorization/authorization.service.js"
import {navigateTo} from "./utils.js"

const renderLoggedOutNavigation = (container) => {
container.innerHTML = `
        <button class="btn-login" id="nav-login-btn">Login</button>
        <button class="btn-register" id="nav-register-btn">Register</button>
    `
}
const bindToggleEvents = (loginBtn , registerBtn) => {
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
const bindNavigationEvents = (loginBtn , registerBtn) => {
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
        <button class="btn-logout" id="logout-btn">Logout</button>
    `
    const logoutBtn = document.getElementById('logout-btn')
    if (!logoutBtn) return 

    logoutBtn.addEventListener('click', async () => {
        const result = await Service.handleLogout()
        if (!result.success) {
            console.error('Logout failed')   
            return
        }
        navigateTo(result.data)
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
        if (user && user.role ==='admin') {
            addBtn.style.display ='flex'
        }else {
            addBtn.style.display='none'
        }
    })
}



export { initNavAuth , initAdminAddCarBtn}
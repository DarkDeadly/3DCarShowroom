import * as authServices from "../services/auth.service.js"
import * as authRenders from "../renders/auth.render.js"
import { navigateToWithDelay } from "../utils/uiBuilder.js"
import * as authStore from "../states/cart.store.js"

authServices.initAuthState()

const registrationInit = () => {
    const usernameInput = document.getElementById("ra-name")
    const emailInput = document.getElementById("ra-email")
    const passwordInput = document.getElementById("ra-password")
    const registerBtn = document.querySelector(".ra-btn")
    const form = document.querySelector(".panel-register")
    if (!form || !usernameInput || !emailInput || !passwordInput || !registerBtn) return

    form.addEventListener('submit', async (e) => {
        const credential = {
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value
        };
        e.preventDefault()
        authRenders.clearMessages("register")
        authRenders.setLoadingState(true, "register", registerBtn)
        const result = await authServices.registerService(credential)
        authRenders.setLoadingState(false, "register", registerBtn)
        if (!result.success) {
            authRenders.authErrorMessage(result.error , "register")
            return
        }
        authStore.store.set({
            user : result.data.user,
            isAuthenticated : true,
            role : result.data.role || "buyer"
        })
        authRenders.authSuccessMessage("Account created successfully! Redirecting...","register")
        form.reset()
        navigateToWithDelay("carCatalog.html", 1500)
    })
}

const loginInit = () => {
    const emailInput = document.getElementById("si-email")
    const passwordInput = document.getElementById("si-password")
    const loginBtn = document.querySelector(".si-btn")
    const form = document.querySelector(".panel-signin")

    if (!form || !emailInput || !passwordInput || !loginBtn) return

    form.addEventListener("submit", async (e) => {
        const credential = {
            email: emailInput.value.trim(),
            password: passwordInput.value
        };
        e.preventDefault()
        authRenders.clearMessages("login")
        authRenders.setLoadingState(true, "login", loginBtn)
        const result = await authServices.loginService(credential)
        authRenders.setLoadingState(false, "login", loginBtn)
        if (!result.success) {
            authRenders.authErrorMessage(result , "login")
            return
        }
        authStore.store.set({
            user : result.data.user,
            isAuthenticated : true,
            role : result.data.role || "buyer"
        })
        authRenders.authSuccessMessage("Signed in successfully! Redirecting..." , "login")
        form.reset()
        navigateToWithDelay("carCatalog.html", 1500)
    })
}


const authInit = () => {
    loginInit()
    registrationInit()
}

authInit()
import { onAuthStateChanged } from "firebase/auth"
import * as authRepo from "../data/auth.repository.js"
import {auth} from "../config/firebase/firebase.auth.js"
import * as authStore from "../states/cart.store.js"

let unsubscribe = null

export const registerService = async(credential = {}) => {
    return await authRepo.userRegister(credential)
}

export const loginService = async(credential = {}) => {
    return await authRepo.userLogin(credential)
}

export const logoutService = async () => {
    return await authRepo.logoutUser()
}

export const initAuthState = () => {
    if (unsubscribe) return;

    unsubscribe = onAuthStateChanged(auth , async (firebaseUser) => {
        if (firebaseUser) {
            const roleResult = await authRepo.getUser(firebaseUser.uid)
            const role = roleResult.success ? roleResult.data : "buyer"
            authStore.store.set({
                user : firebaseUser , 
                isAuthenticated : true ,
                role : role
            })
        }else {
            authStore.store.set({
                user: null,
                isAuthenticated: false,
                role: null
            })
        }
    })
}
import * as authRepo from "../data/auth.repository.js"

export const registerService = async(credential = {}) => {
    return await authRepo.userRegister(credential)
}

export const loginService = async(credential = {}) => {
    return await authRepo.userLogin(credential)
}

export const logoutService = async () => {
    return await authRepo.logoutUser()
}
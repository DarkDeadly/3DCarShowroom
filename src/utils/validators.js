import * as returnContract from "./responseContract.js"

export const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return returnContract.failure("Email is required")
    }
    const trimmedEmail = email.trim()
    if (trimmedEmail === "") {
        return returnContract.failure("Email cannot be empty")
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
        return returnContract.failure("Please enter a valid email address")
    }
    return returnContract.success(trimmedEmail)
}

export const validateRegistration = (credential = {}) => {
    const {username , password , email} = credential
    const validatedEmail = validateEmail(email)
    if (!validatedEmail.success) {
        return returnContract.failure(validatedEmail.error)
    }
    if (!password || typeof password !== "string" || !username || typeof username !== "string") {
        return returnContract.failure("invalid credentials , try again")
    }
    const trimmedPassword = password.trim()
    if (trimmedPassword === "") {
        return returnContract.failure("Please enter a valid Password")
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    if (!passwordRegex.test(trimmedPassword)) {
        return returnContract.failure("password must have at least 8 characters , a numbre and an uppercase")
    }
    if (!usernameRegex.test(username.trim())) {
        return returnContract.failure("please provide a valid username")
    } 

    return returnContract.success({
        username : username.trim(),
        password : trimmedPassword , 
        email : validatedEmail.data
    })
}


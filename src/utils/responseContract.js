

export const success = (data , meta = null) => {
    return {success : true , data , meta}
}
export const failure = (error) => {
    return {success : false , data : null , error : error}
}

export const authErrors = (errorMessage)=> {
            let userFriendlyMessage = 'An unexpected error occurred. Please try again.'
        switch (errorMessage) {
            case 'auth/invalid-email':
                userFriendlyMessage = 'Please enter a valid email address.'
                break 
            case 'auth/missing-email':
                userFriendlyMessage = 'Email is required.'
                break
            case 'auth/invalid-credential':
                userFriendlyMessage = 'Incorrect email or password.'
                break
            case 'auth/user-disabled':
                userFriendlyMessage = 'This account has been disabled.'
                break
            case 'auth/too-many-requests':
                userFriendlyMessage = 'Too many attempts. Please try again later.'
                break
            case 'auth/network-request-failed':
                userFriendlyMessage = 'Network error. Check your connection.'
                break
            case 'auth/email-already-in-use':
                userFriendlyMessage = 'This email is already linked to an existing account.'
                break
            case 'auth/invalid-email':
                userFriendlyMessage = 'The email address format is invalid.'
                break
            case 'auth/weak-password':
                userFriendlyMessage = 'Password must be at least 6 characters long.'
                break
            case 'auth/operation-not-allowed':
                userFriendlyMessage = 'Email/Password sign-in is currently disabled.'
                break
            case 'auth/network-request-failed':
                userFriendlyMessage = 'Network connection lost. Check your internet connection.'
                break
            case 'auth/internal-error':
                userFriendlyMessage = 'Firebase encountered an internal error. Try again later.'
                break 
            default:
                userFriendlyMessage = 'An unexpected error occurred.'
                break
        }
        return userFriendlyMessage
}
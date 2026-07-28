import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth"
import {auth} from "../config/firebase/firebase.auth.js"
import * as repoContract from "../utils/responseContract.js"
import * as credentialValidation from "../utils/validators.js"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../config/firebase/firestore.js"


/**
 * Register a user role to Firestore
 * @param {string} id - Firebase Auth uid
 * @param {string} role - the user role
 * @returns {Promise<{success: boolean, data: null, error?: string}>}
 */
const addUserDb = async (id, role = 'buyer') => {
    try {
        if (typeof id !== 'string' || typeof role !== 'string') {
            return repoContract.failure("Invalid property types")
        }
        if (!id.trim() || !role.trim()) {
            return repoContract.failure("ID and role are required")
        }
        await setDoc(doc(db, 'users', id), { role })
        return repoContract.success(null)
    } catch (error) {
        console.error('[addUserDb] failed:', error)
        return repoContract.failure(error.message)
    }
}


/**
 * Login existing user with email and password
 * @returns {Promise<{success: boolean, data: Object|null, error?: string}>}
 */
export const userLogin = async(credential = {}) => {
    const {email , password} = credential
    if (!email || !password) {
        return repoContract.failure("false Credentail , Check again")
    }
    const result = credentialValidation.validateEmail(email)
    if (!result.success) {
        return result
    }
    try {
        const signInResult = await signInWithEmailAndPassword(auth, result.data, password)
        return repoContract.success(signInResult.user)
        
    } catch (error) {
       return repoContract.authErrors(error.code) 
    }
}

export const userRegister = async (credential = {}) => {
    const validationResult = credentialValidation.validateRegistration(credential)
    if (!validationResult.success) {
        return validationResult
    }
    try {
       const registerResult = await createUserWithEmailAndPassword(auth , validationResult.data.email , validationResult.data.password) 
       await updateProfile(registerResult.user, { displayName: validationResult.data.username })
       const dbResult = await addUserDb(registerResult.user.uid, 'buyer')
        if (!dbResult.success) {
            // Rollback Auth user — prevent stuck state
            await registerResult.user.delete()
            return repoContract.failure("Registration failed. Please try again.")
        }

        return repoContract.success(registerResult.user)
    } catch (error) {
      return repoContract.authErrors(error.code)  
    }
}
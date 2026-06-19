// data.js
import { db } from "../config/firebase.js"
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { validateEmail } from "./utils.js"
import { getDocs, collection, getDoc, doc } from "firebase/firestore"
// Single Source of Truth 
let allCars = []
const auth = getAuth()

/**
 * Fetches all cars from Firestore
 * @returns {Promise<{success: boolean, data: Array<Object>, error?: string}>}
 */
const getCars = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'cars'))
        const cars = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id


        }))
        allCars = [...cars]
        return { success: true, data: cars }

    } catch (error) {
        console.error('[getCars] failed : ', error)
        return { success: false, data: null, error: error.message }
    }
}

/**
 * Fetch a specific car based on the ID
 * @param {string} id - The car specific id
 * @return {Promise<{success: boolean, data: <Object>, error?: string}>} 
 */

const getCarDetail = async (id) => {
    try {
        if (!id || typeof (id) !== "string") return { success: false, data: null, error: 'Invalid ID' }
        const querySnapshot = await getDoc(doc(db, "cars", id))
        if (!querySnapshot.exists()) {
            return { success: false, data: null, error: "no such car is available" }
        }
        return { success: true, data: { id: querySnapshot.id, ...querySnapshot.data() } }

    } catch (error) {
        console.error('[getCarDetail] failed:', error)
        return { success: false, data: null, error: error.message }
    }
}

/**
 * Search for a car based on the following search parameter 
 * @param {string} query - search query
 * @param {Array<Object>} [cars=allCars] - cars to search within
 * @return {Array<Object>} cars matching the query, or all cars if query is empty
 */
const searchCars = (query, cars = allCars) => {
    if (!Array.isArray(cars)) {
        console.error('[searchCars] expected an array but received:', typeof cars)
        return []
    }
    // no search we return the all cars
    if (!query || query.trim() === '') return cars  // array
    const q = query.toLowerCase()
    // checking the object Name 
    return cars.filter((car) => {
        const name = car.name?.toString().toLowerCase()
        if (!name) {
            console.warn('[searchCars] skipping car without valid name:', car.id || 'no-id')
            return false
        }
        return name.includes(q)
    })
}

/**
 * 
 */

const filterCarsByBrand = (brand, cars = allCars) => {
    if (!Array.isArray(cars)) {
        console.error('[filterCarsByBrand] expected array, got:', typeof cars)
        return []
    }

    // Normalize once: string → trim → lowercase
    const normalizedBrand = brand?.toString().toLowerCase().trim()
    if (!normalizedBrand) return cars  // catches null, undefined, "", "  ", 0, etc.

    return cars.filter(car => {
        const carBrand = car.brand?.toString().toLowerCase().trim()
        if (!carBrand) {
            console.warn('[filterCarsByBrand] skipping car without valid brand:', car.id || 'no-id')
            return false
        }
        return carBrand === normalizedBrand
    })
}

const getCachedCars = () => {
    return [...allCars]
}

/**
 * Single entry point for all filtering and searching
 * @param {Object} filterState - { currentBrand, currentSearch }
 * @returns {Array<Object>}
 */
const getFilteredCars = ({ currentBrand = '', currentSearch = '' } = {}) => {
    let cars = getCachedCars()
    if (currentBrand) cars = filterCarsByBrand(currentBrand, cars)
    if (currentSearch) cars = searchCars(currentSearch, cars)
    return cars
}


/**
 * Authentication using the password and email 
 * @param {string} email - the provided Email
 * @param {string} password - the provided Password
 * @param {string} username - the provided Username
 * @return {{success : boolean , data : object , error?: string}}
 */
const emailPasswordAuthentication = async ({ email = '', password = '', username = '' }) => {
    try {
        // Layer 1 — type checks (before touching the values)
        if (typeof email !== 'string' || typeof password !== 'string' || typeof username !== 'string') {
            return { success: false, data: null, error: 'Invalid input types' }
        }

        // Layer 2 — normalize (safe now, we know they're strings)
        const cleanEmail = email.trim()
        const cleanPassword = password.trim()
        const cleanUsername = username.trim()

        // Layer 3 — existence after trim
        if (!cleanEmail || !cleanPassword || !cleanUsername) {
            return { success: false, data: null, error: 'All fields are required' }
        }

        // Layer 4 — format
        const emailResult = validateEmail(cleanEmail)
        if (!emailResult.valid) {
            return { success: false, data: null, error: emailResult.error }
        }

        // All clean — do the work
        const authResult = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword)
        await updateProfile(authResult.user, { displayName: cleanUsername })
        return { success: true, data: authResult.user }

    } catch (error) {
        const errorCode = error.code
        let userFriendlyMessage = 'An unexpected error occurred. Please try again.'

        switch (errorCode) {
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
                console.warn('[emailPasswordAuthentication] unhandled error:', errorCode, error.message)
                userFriendlyMessage = error.message
                break
        }

        return { success: false, data: null, error: userFriendlyMessage }
    }
}

/**
 * Login an existant user 
 * @param {string} email - the provided Email
 * @param {string} password - the provided Password
 * @returns {{success : boolean , data : object , error?:string}}
 */
const loginWithEmailAndPassword = async({email = "" , password = "" }) => {
    try {
        // Layer 1 — type checks (before touching the values)
        if (typeof email !== 'string' || typeof password !== 'string') {
            return { success: false, data: null, error: 'Invalid input types' }
        }

        // Layer 2 — normalize (safe now, we know they're strings)
        
        const cleanEmail = email.trim()
        const cleanPassword = password.trim()

        // Layer 3 — existence after trim
        
        if (!cleanEmail || !cleanPassword ) {
            return { success: false, data: null, error: 'All fields are required' }
        }

        // Layer 4 — format
        const emailResult = validateEmail(cleanEmail)
        if (!emailResult.valid) {
            return { success: false, data: null, error: emailResult.error }
        }

        const result = await signInWithEmailAndPassword(auth , cleanEmail , cleanPassword)
        return {success:true , data : result.user}
    } catch (error) {
        const errorCode = error.code
        let userFriendlyMessage = 'An unexpected error occurred. Please try again.'
        switch (errorCode) {
        case 'auth/invalid-email':
           userFriendlyMessage= 'Please enter a valid email address.'
           break
        case 'auth/missing-email':
            userFriendlyMessage= 'Email is required.'
            break
        case 'auth/invalid-credential':
            userFriendlyMessage= 'Incorrect email or password.'
            break
        case 'auth/user-disabled':
            userFriendlyMessage= 'This account has been disabled.'
            break
        case 'auth/too-many-requests':
            userFriendlyMessage= 'Too many attempts. Please try again later.'
            break
        case 'auth/network-request-failed':
            userFriendlyMessage= 'Network error. Check your connection.'
            break
        default:
            userFriendlyMessage= 'An unexpected error occurred.'
            break
    }
    return {success : false , data : null , error:userFriendlyMessage}
    }
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback - receives user object or null
 * @returns {Function} unsubscribe function
 */
const onAuthStateCheck = (callback) => {
    return onAuthStateChanged(auth , callback)
}

/**
 * Logout the user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const logoutUser = async() => {
   try {
        await signOut(auth)
        return {success : true , data : null}
   } catch (error) {
        console.error('[logoutUser] failed:', error)
        return { success: false, data: null, error: error.message }

   }
}



export { loginWithEmailAndPassword,getCars, getCarDetail, searchCars, getCachedCars, filterCarsByBrand, getFilteredCars, emailPasswordAuthentication , onAuthStateCheck , logoutUser}
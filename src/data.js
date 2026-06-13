// data.js
import { db } from "./config/firebase.js"
import { getDocs, collection, getDoc, doc } from "firebase/firestore"
// Single Source of Truth 
let allCars = []
/**
 * Fetches all cars from Firestore
 * @returns {Promise<{success: boolean, cars: Array<Object>, error?: string}>}
 */
const getCars = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'cars'))
        const cars = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()

        }))
        allCars = [...cars]
        return { success: true, cars }

    } catch (error) {
        console.error('getCars failed:', error)
        return { success: false, cars: [], error: error.message }
    }
}

/**
 * Fetch a specific car based on the ID
 * @param {string} id - The car specific id
 * @return {Promise<{success: boolean, car: <Object>, error?: string}>} 
 */

const getCarDetail = async (id) => {
    try {
        if (!id) return { success: false, car: null, error: 'Invalid ID' }
        const querySnapshot = await getDoc(doc(db, "cars", id))
        if (!querySnapshot.exists()) {
            return { success: false, car: null, error: "no such car is available" }
        }
        return { success: true, car: { id: querySnapshot.id, ...querySnapshot.data() } }

    } catch (error) {
        console.error('getCars failed:', error)
        return { success: false, cars: null, error: error.message }
    }
}

/**
 * Search for a car based on the following search parameter (name , brand )
 * @param {string} query - search query
 * @param {number} limit - search limit
 * @return {{success : boolean , cars: Array<Object> , error?:string}}
 */

const searchCars = async (query, limit = 10) => {
    try {
        // 1. Type check first
    if (typeof query !== "string")
        return { success: false, cars: [], error: 'Invalid search query' }

    // 2. Empty string → show all cars
    if (query.trim() === "")
        return { success: true, cars: allCars }

    const searchQuery = query.toLowerCase().trim()

    // ensure cache is populated
    if (allCars.length === 0) {
        const fetched = await getCars()
        if (!fetched.success) return { success: false, cars: [], error: fetched.error }
    }

    const result = allCars
        .filter(car =>
            car.name.toLowerCase().includes(searchQuery) ||
            car.brand.toLowerCase().includes(searchQuery)
        )
        .slice(0, limit)

    return { success: true, cars: result }
    } catch (error) {
       return {success : false , cars : [] , error : error.message} 
    }
}


export { getCars, getCarDetail , searchCars}
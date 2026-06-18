// data.js
import { db } from "./config/firebase.js"
import { getDocs, collection, getDoc, doc } from "firebase/firestore"
// Single Source of Truth 
let allCars = []
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
        return { success: true, data : cars }

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
        if (!id || typeof(id) !== "string") return { success: false, data: null, error: 'Invalid ID' }
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
const searchCars = (query , cars = allCars) => {
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
    if (currentBrand)  cars = filterCarsByBrand(currentBrand, cars)
    if (currentSearch) cars = searchCars(currentSearch, cars)
    return cars
}


export { getCars, getCarDetail , searchCars , getCachedCars , filterCarsByBrand , getFilteredCars}
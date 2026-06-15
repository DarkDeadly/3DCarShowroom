// data.js
import { db } from "./config/firebase.js"
import { getDocs, collection, getDoc, doc, query } from "firebase/firestore"
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
 * Search for a car based on the following search parameter 
 * @param {string} query - search query
 * @return {{success : boolean , cars: Array<Object> , error?:string}}
 */
const searchCars = (query , cars = allCars) => {
    if (!query || query.trim() === '') return cars  // array
    const q = query.toLowerCase()
    return cars.filter((car) => car.name.toLowerCase().includes(q))  // array
}

/**
 * 
 */

const filterCarsByBrand = (brand , cars = allCars) => {
    if (!brand) return cars
    return cars.filter(car => 
        car.brand.toLowerCase() === brand.toLowerCase().trim()
    )
}

const getCachedCars = () => {
    return [...allCars]
}


export { getCars, getCarDetail , searchCars , getCachedCars , filterCarsByBrand}
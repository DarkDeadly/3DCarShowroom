// data.js
import { db } from "./config/firebase.js"
import { getDocs, collection, getDoc, doc } from "firebase/firestore"

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

const getCarDetail = async(id) => {
    try {
        if (!id) return {success : false , car : null , error : 'Invalid ID'}
        const querySnapshot = await getDoc(doc(db ,"cars", id))
        if (!querySnapshot.exists()) {
            return {success : false , car : null , error : "no such car is available"}
        }
        return {success : true , car : {id : querySnapshot.id , ...querySnapshot.data()} }
        
    } catch (error) {
        console.error('getCars failed:', error)
        return { success: false, cars: null, error: error.message }  
    }
}

export { getCars , getCarDetail}
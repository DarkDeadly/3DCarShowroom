// data.js
import { db } from "./config/firebase.js"
import { getDocs, collection } from "firebase/firestore"

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

export { getCars }
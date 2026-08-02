import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import {db} from "../config/firebase/firestore.js"
import * as repoContract from "../utils/responseContract.js"


export const getAllCars = async () => {
    try {
        const docRef = collection(db , "cars"); 
        const result = await getDocs(docRef)
        const cars = result.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }))
        return repoContract.success(cars)
    } catch (error) {
        console.error('[getAllCars] failed : ', error)
        return repoContract.failure(error.message)
    }
}

export const deleteCarById = async (id) => {
    if (!id || typeof id !== "string") {
        return repoContract.failure("Invalid car id");
    }
    try {
        const docRef = doc(db, "cars", id);
        await deleteDoc(docRef);
        return repoContract.success("Car deleted successfully");
    } catch (error) {
        console.error('[deleteCarById] failed : ', error)
        return repoContract.failure(error.message)
    }
}
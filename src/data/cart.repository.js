import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import * as repoContract from "../utils/responseContract.js"
import { db } from "../config/firebase/firestore.js";


export const addToCart = async (carId, userId) => {
    if (!carId || !userId) {
        return repoContract.failure("missing datas") 
    }
    try {
        // i dont think there will be a race condition between the two calls
        const cartRef = doc(db, 'users', userId, 'cart', carId)
        const setCart = await setDoc(cartRef, { addedAt: serverTimestamp() }, { merge: true })
        return repoContract.success({inCart : true})


    } catch (error) {
        return repoContract.failure(error.message)  
    }
}
export const removeToCart = async (carId , userId) => {
    if (!carId || !userId) {
        return repoContract.failure("missing datas") 
    }
    try {
        const cartRef = doc(db, 'users', userId, 'cart', carId)   
        await deleteDoc(cartRef)
        return repoContract.success(null)   
    } catch (error) {
       return repoContract.failure(error.message)  
    }
}
export const isInCart = async (uid, carId) => {
    if (!uid || !carId) return repoContract.failure("Missing data");
    try {
        const snap = await getDoc(doc(db, 'users', uid, 'cart', carId));
        return repoContract.success(snap.exists());
    } catch (error) {
        return repoContract.failure(error.message);
    }
};
export const getCartItems = async (uid) => {
    if (!uid) return repoContract.failure("UID required");
    try {
        const querySnapshot = await getDocs(collection(db, 'users', uid, 'cart'));
        const items = querySnapshot.docs.map(doc => ({
            carId: doc.id,
            ...doc.data()
        }));
        return repoContract.success(items);
    } catch (error) {
        return repoContract.failure(error.message);
    }
};
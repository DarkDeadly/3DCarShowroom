import { query, limit, orderBy, collection, getDocs, startAfter, doc, getDoc, serverTimestamp, addDoc } from "firebase/firestore"
import { db } from "../config/firebase/firestore.js"
import * as repoContract from "../utils/responseContract.js"
import { carSchema } from "../schemas/car.schema.js"

export const getCars = async (options = {}) => {
  const {
    requestedLimit = 12,
    sortedBy = "createdAt",
    direction = "desc",
    cursor = null,
  } = options;
  // Validation 
  if (!Number.isInteger(requestedLimit) || requestedLimit <= 0) {
    console.error("[getCars] error occured : unavailable properties")
    return repoContract.failure("requestedLimit must be a positive integer")
  }
  if (!["asc", "desc"].includes(direction)) {
    return repoContract.failure(`${direction} not valid `)
  }
  try {
    const collectionRef = collection(db, "cars")
    const queryConstraints = [
      orderBy(sortedBy, direction),
      limit(requestedLimit + 1),
    ]
    if (cursor) {
      queryConstraints.push(startAfter(cursor))
    }
    const queryRef = query(collectionRef, ...queryConstraints)
    const querySnapshot = await getDocs(queryRef)
    const docs = [...querySnapshot.docs];
    const hasMore = docs.length > requestedLimit
    if (hasMore) {
      docs.pop()
    }
    const nextCursor = docs[docs.length - 1] ?? null;
    const cars = docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }))
    return repoContract.success(cars, { hasMore, nextCursor })
  } catch (error) {
    //Catching the errors
    console.error('[getCars] failed : ', error)
    return repoContract.failure(error.message)
  }
}

export const getCarById = async (id) => {

  if (!id || typeof id !== "string") {
    return repoContract.failure("Invalid car id");
  }

  try {

    const docRef = doc(db, "cars", id);

    const carSnapshot = await getDoc(docRef);

    if (!carSnapshot.exists()) {
      return repoContract.failure("Car not found");
    }

    const car = {
      id: carSnapshot.id,
      ...carSnapshot.data()
    };

    return repoContract.success(car);

  } catch (error) {
    return repoContract.failure(error.message);
  }
}

export const addCar = async (carData) => {
  if (!carData || typeof (carData) !== "object") {
    return repoContract.failure("required Fields")
  }
  for (const [field, rules] of Object.entries(carSchema)) {
    if (rules.required && !(field in carData)) {
      return repoContract.failure(`${field} is missing`)
    }
    if (field in carData && typeof carData[field] !== rules.type) {
      return repoContract.failure(
        `${field} must be a ${rules.type}`
      );
    }
  }
  try {
    const collectionRef = collection(db, "cars")
    const firestoreCar = {
      ...carData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    const docRef = await addDoc(collectionRef, firestoreCar)
    const createdCar = {
      id: docRef.id,
      ...firestoreCar,
    }
    return repoContract.success(createdCar)
  } catch (error) {
    return repoContract.failure(error.message)
  }

}
import { query, where, limit, orderBy, startAt, endAt, collection, getDocs, startAfter, doc, getDoc, serverTimestamp, addDoc } from "firebase/firestore"
import { db } from "../config/firebase/firestore.js"
import * as repoContract from "../utils/responseContract.js"
import { carSchema } from "../schemas/car.schema.js"

/**
 * Fetch a page of cars, optionally filtered.
 *
 * Composition rules (Firestore constraints):
 *  - `category`      → equality filter, expected already lowercased by the service.
 *  - `searchPrefix`  → prefix range on the lowercased twin field `searchName`:
 *                      [prefix, prefix + "\uf8ff"). Firestore requires any range
 *                      bounds to live on the FIRST orderBy field, so a search
 *                      query orders by `searchName` and ignores sortedBy.
 *  - `cursor`        → startAfter(snapshot) works with any orderBy because the
 *                      snapshot carries its own sort values.
 * Combining `category` + an orderBy needs a composite index — Firestore answers
 * with failed-precondition and a one-click creation link (surfaced below).
 */
export const getCars = async (options = {}) => {
  const {
    requestedLimit = 12,
    sortedBy = "createdAt",
    direction = "desc",
    cursor = null,
    category = null,
    searchPrefix = null,
  } = options;
  // Validation
  if (!Number.isInteger(requestedLimit) || requestedLimit <= 0) {
    console.error("[getCars] error occured : unavailable properties")
    return repoContract.failure("requestedLimit must be a positive integer")
  }
  if (!["asc", "desc"].includes(direction)) {
    return repoContract.failure(`${direction} not valid `)
  }
  if (category !== null && (typeof category !== "string" || !category.trim())) {
    return repoContract.failure("category must be a non-empty string")
  }
  if (searchPrefix !== null && (typeof searchPrefix !== "string" || !searchPrefix.trim())) {
    return repoContract.failure("searchPrefix must be a non-empty string")
  }
  try {
    const collectionRef = collection(db, "cars")
    const queryConstraints = []

    if (category) {
      queryConstraints.push(where("category", "==", category))
    }
    if (searchPrefix) {
      const normalizedPrefix = searchPrefix.trim().toLowerCase()
      queryConstraints.push(
        orderBy("searchName"),
        startAt(normalizedPrefix),
        endAt(normalizedPrefix + "\uf8ff"),
      )
    } else {
      queryConstraints.push(orderBy(sortedBy, direction))
    }
    if (cursor) {
      queryConstraints.push(startAfter(cursor))
    }
    // +1 lookahead: an extra doc tells us whether another page exists
    queryConstraints.push(limit(requestedLimit + 1))

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
    if (error.code === "failed-precondition") {
      // Firestore logged a ready-made index-creation URL in the console above
      return repoContract.failure("This filter combination needs a composite Firestore index — open the browser console for a one-click creation link, then retry.")
    }
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
  // Normalize BEFORE validation — deriving the query twins here guarantees
  // every write path (admin form, seeds, future imports) produces searchable,
  // consistently-cased documents.
  //   - category is stored lowercase as a convention (chips send lowercase)
  //   - searchName is the lowercase query twin of model
  const prepared = {
    ...carData,
    category: typeof carData.category === "string" ? carData.category.trim().toLowerCase() : carData.category,
    searchName: typeof carData.model === "string" ? carData.model.trim().toLowerCase() : undefined,
  }
  for (const [field, rules] of Object.entries(carSchema)) {
    const value = prepared[field];

    // required check
    if (rules.required && (value === undefined || value === null || value === "")) {
      return repoContract.failure(`${field} is missing`);
    }

    // type check only when the field is present and not null
    if (value !== undefined && value !== null && typeof value !== rules.type) {
      return repoContract.failure(`${field} must be a ${rules.type}`);
    }
  }
  try {
    const collectionRef = collection(db, "cars")
    const firestoreCar = {
      ...prepared,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    console.log("[addCar] writing:", firestoreCar)
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
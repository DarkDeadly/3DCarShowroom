import { uploadToCloudinary } from "../config/cloudinary/cloudinary.service.js";
import * as carRepository from "../data/car.repository.js"
import * as returnContract from "../utils/responseContract.js"
 
 
/**
 * Translate raw UI filter state into repository query options.
 * Pure function — no I/O, so it can be unit-tested without Firebase.
 *
 * IN : { category: "SUV" | "all" | junk, search: "  Tempest ", cursor, ... }
 * OUT: { requestedLimit, sortedBy, direction, cursor, category, searchPrefix }
 *      category/searchPrefix are normalized to lowercase or null ("no filter").
 */
export const buildQueryFromState = (state = {}) => {
    const rawCategory = typeof state.category === "string" ? state.category.trim().toLowerCase() : ""
    const rawSearch = typeof state.search === "string" ? state.search.trim().toLowerCase() : ""
 
    // requestedLimit may arrive as a string (URL query param, <select> value,
    // form input) — Number.isInteger() rejects strings outright, so we coerce
    // first and only fall back to the default if the result isn't a positive
    // integer.
    const parsedLimit = Number(state.requestedLimit)
    const requestedLimit = Number.isInteger(parsedLimit) && parsedLimit > 0
        ? parsedLimit
        : 12
 
    return {
        requestedLimit,
        sortedBy: state.sortedBy ?? "createdAt",
        direction: state.direction ?? "desc",
        cursor: state.cursor ?? null,
        category: rawCategory && rawCategory !== "all" ? rawCategory : null,
        searchPrefix: rawSearch || null,
    }
}
 
export const getCars = async (options = {}) => {
    try {
        const result = await carRepository.getCars(buildQueryFromState(options));
        return result;
    } catch (error) {
        return returnContract.failure(error.message);
    }
}
 
export const getCarById = async (id) => {
    return await carRepository.getCarById(id);
}
 
export const addCar = async (formData, imageFile, modelFile = null) => {
    try {
        const imageResult = await uploadToCloudinary(imageFile, "image")
        console.log("Image upload result:", imageResult);
        if (!imageResult.success) {
            return returnContract.failure(imageResult.error)
        }
        let modelUrl = null
        if (modelFile) {
            const modelResult = await uploadToCloudinary(modelFile, 'raw')
            console.log("Model upload result:", modelResult);
            if (!modelResult.success) {
                return returnContract.failure(modelResult.error)
            }
            modelUrl = modelResult.data
        }
        const repositoryPayload = {
            ...formData,
            image: imageResult.data,
            model3D: modelUrl,
            hasModel: modelUrl !== null
        }
        // awaited for consistency with the rest of this function, and so a
        // future try/catch wrapper here would actually catch addCar failures
        return await carRepository.addCar(repositoryPayload)
    } catch (error) {
        return returnContract.failure(error.message)
    }
}
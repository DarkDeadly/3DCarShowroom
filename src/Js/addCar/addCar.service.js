import * as Data from "../data.js"

const addCar = async (carInfo, carImage) => {

    try {
        const result = await Data.addCars(carInfo, carImage)
        if (!result.success) {
            console.error('[addCar] add car failed:', result.error)
            return { success: false, data: null, error: result.error }
        }
        return { success: true, data: result.data }
    } catch (error) {
        console.error('[addCar] unexpected error:', error)
        return { success: false, data: null, error: error.message }
    }
}

const refreshCache = (newCar) => {
    try {
        const currentCache = Data.getCachedCars()
        const updatedCache = [...currentCache, newCar]
        Data.setCachedCars(updatedCache)
        return { success: true, data: updatedCache }
    } catch (error) {
        console.error('[refreshLocalCacheWithNewCar] failed:', error)
    }
}

export { addCar , refreshCache }
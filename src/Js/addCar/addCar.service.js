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



export { addCar }
import * as Render from "../cars/car.render.js"
import * as Data from "../data.js"


const ensureCachedIsLoaded = async () => {
    if (Data.getCachedCars().length === 0) {
        const fetchedCars = await Data.getCars()
        if (!fetchedCars.success) {
            return {success : false , error : fetchedCars.error , data : []}
        }
        Data.setCachedCars(fetchedCars.data.cars)
    }
    return {success : true}
}

export { ensureCachedIsLoaded }
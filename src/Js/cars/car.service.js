import * as Data from '../data.js'
import * as Render from './car.render.js'

let currentLastDoc = null
let hasMoreCars = true


const loadNextPage = async() => {

    try {

        if (!hasMoreCars) return {success : false , error : 'No more cars to load' , data : null}

        const carResult = await Data.getCars(currentLastDoc, 10)

    if (!carResult.success) {
        return {success : false , error : carResult.error , data : null}
    }
    
    // Accumulate: old cars + new cars = full list
    const accumulated = [...Data.getCachedCars(), ...carResult.data.cars]
    Data.setCachedCars(accumulated)
    
    // Update pagination cursors
    currentLastDoc = carResult.data.cursor
    hasMoreCars = carResult.data.hasMore

    return {success : true  , data : accumulated}

    } catch (error) {
        console.error('[loadNextPage] Error fetching next page of cars:', error)
        return {success : false , error : error.message , data : null}

    }
    
}

const getCar = async(id) => {
    try {
        const result = await Data.getCarDetail(id)
           if (!result.success) {
               console.error('[getCar] failed:', result.error)
               return {success : false , error : result.error , data : null};
           } 
           return {success : true , data : result.data};
    } catch (error) {
     console.error('[getCar] Error fetching car detail:', error)  
     return {success : false , error : error.message , data : null}; 
    }
}

export {loadNextPage , getCar}
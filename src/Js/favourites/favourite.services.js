import * as Data from '../data.js'

const getCurrentUser = () => {
    const user = Data.getCachedUser()
    if (!user) {
        return { success: false, data: null, error: "User not authenticated" }
    }
    return { success: true, data: user }
}
const toggleFavourite = async (carId, userId) => {
    try {
        const result = await Data.toggleFavourite(carId, userId)

        if (!result.success) {
            console.error('[toggleFavourite] toggle failed:', result.error)
            return { success: false, data: null, error: result.error }
        }
        return { success: true, data: result.data }
    } catch (error) {
        console.error('[toggleFavourite] unexpected error:', error)
        return { success: false, data: null, error: error.message }
    }
}
const getFavouriteCars = async (userId) => {
    try {
        const favouriteList = await Data.getUserFavourites(userId)
         if (!favouriteList.success) {
            console.error('[showFavourite] failed to get favourites:', favouriteList.error)
            return { success: false, data: null, error: favouriteList.error }
        }
        const carRequests = favouriteList.data.map((carId) => Data.getCarDetail(carId))
        const carResults = await Promise.all(carRequests)

        return { success: true, data: carResults}

    } catch (error) {
        console.error('[showFavourite] unexpected error:', error)
        return { success: false, data: null, error: error.message }
    }
}

   

export { getCurrentUser, toggleFavourite , getFavouriteCars}
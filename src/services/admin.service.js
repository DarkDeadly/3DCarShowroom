import * as adminRepo from "../data/admin.repository.js"



export const getAllCars = async () => {
    const result = await adminRepo.getAllCars()
    return result
}

export const deleteCarById = async (id) => {
    return await adminRepo.deleteCarById(id)
}
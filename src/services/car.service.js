import { uploadToCloudinary } from "../config/cloudinary/cloudinary.service.js";
import * as carRepository from "../data/car.repository.js"
import * as returnContract from "../utils/responseContract.js"


export const getCars = async (options={}) => {
    try {
        return await carRepository.getCars(options);
    } catch (error) {
        return returnContract.failure(error.message);
    }
}

export const getCarById = async (id) => {
    return await carRepository.getCarById(id);
}

export const addCar = async(formData , imageFile ,  modelFile = null) => {
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
                return carRepository.addCar(repositoryPayload)
    } catch (error) {
      return returnContract.failure(error.message)  
    }
}
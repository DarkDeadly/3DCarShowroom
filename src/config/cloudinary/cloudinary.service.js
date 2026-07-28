import { fileUploadValidator  } from '../../utils/upload.validator.js'
import * as repoReturn from "../../utils/responseContract.js"
import { cloudinaryConfigs } from "../cloudinary/cloudinary.config.js"

export const uploadToCloudinary = async (file, type) => {
    const validation = fileUploadValidator(file, type);

    if (!validation.success) {
        return validation;
    } try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', cloudinaryConfigs.uploadPreset)
        formData.append('folder', cloudinaryConfigs.folder)

        // endpoint differs for images vs raw files (.glb)
        const endpoint = type === 'image'
            ? `https://api.cloudinary.com/v1_1/${cloudinaryConfigs.cloudName}/image/upload`
            : `https://api.cloudinary.com/v1_1/${cloudinaryConfigs.cloudName}/raw/upload`

        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            return repoReturn.failure('Upload failed. Try again.')
        }

        const result = await response.json()
        return repoReturn.success(result.secure_url)
    } catch (error) {
        return repoReturn.failure(error.message)
    }
}
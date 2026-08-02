import * as returnContract from "./responseContract.js"

export const fileUploadValidator = (file, type) => {
    if (!file) {
        return returnContract.failure("missing file to upload")
    }

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
    const allowedModelTypes = ['model/gltf-binary', 'application/octet-stream']

    if (type === 'image' && !allowedImageTypes.includes(file.type)) {
        return returnContract.failure("Invalid image type. Use JPG, PNG or WEBP")
    }

    if (type === 'raw' && !allowedModelTypes.includes(file.type)) {
        return returnContract.failure("Invalid model type. Use .glb files")
    }

    // ← this was missing
    return returnContract.success(true)
}
const cloudinary = require("./cloudinary.config");
const fs=require('fs').promises

const deleteImage = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.log(error);
    }
}


const uploadImages = async (images) => {
    const urls = []
    if (Array.isArray(images)) {

        for (const image of images) {
            try {

                // const newPath = await cloudinary_js_config.uploader.upload(image.tempFilePath, { folder: 'ServiceImages' })
                const newPath = await cloudinary.uploader.upload(image.tempFilePath, { folder: 'ServiceImages' })
                // urls.push(newPath.url)
                urls.push({ imgUrl: newPath.secure_url, publicId: newPath.public_id })
                await fs.unlink(image?.tempFilePath)
            } catch (error) {
                await fs.unlink(image?.tempFilePath).catch(()=>{{
                    console.error(`Failed to delete temp file: ${image.tempFilePath}`);
                }})
                return res.status(500).json({ success: false, message: error.message })

            }

        }
    }
    else {
        try {
            const newPath = await cloudinary.uploader.upload(images?.tempFilePath, { folder: 'ServiceImages' })
            urls.push({ imgUrl: newPath.secure_url, publicId: newPath.public_id })
            await fs.unlink(images?.tempFilePath)
        } catch (error) {
            await fs.unlink(images?.tempFilePath).catch(()=>{{
                console.error(`Failed to delete temp file: ${image.tempFilePath}`);
            }})
            return res.status(500).json({ success: false, message: error.message })
        }
    }

    return urls
}

const uploadDocuments = async (documents, folderName) => {
    const urls = []
    if (Array.isArray(documents)) {

        for (const document of documents) {

            try {
                const newPath = await cloudinary.uploader.upload(document.tempFilePath, { folder: folderName })
                urls.push({ imgUrl: newPath.secure_url, publicId: newPath.public_id })
            } catch (error) {
                return res.status(500).json({ success: false, message: error.message })
            }
        }
    }
    else {
        try {
            const newPath = await cloudinary.uploader.upload(documents.tempFilePath, { folder: folderName })
            urls.push({ imgUrl: newPath.secure_url, publicId: newPath.public_id })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }

    }
    return urls
}
module.exports = {
    deleteImage
    , uploadImages,
    uploadDocuments
};
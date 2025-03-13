const mongoose = require('mongoose');
const Joi = require('joi');
const CreateService = require('../../Models/CreateService');
const cloudinary = require("cloudinary").v2;
const fs=require('fs').promises

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileupload = require('express-fileupload');

const createServiceStepOne = async (req, res) => {
    const value = Joi.object({
        title: Joi.string().max(90).required(),
        category: Joi.string().required(),
        subcategory: Joi.string().required(),
        // description: Joi.string().min(10).max(500).required(),
        textFormatting: Joi.object({
            color: Joi.string().allow('').optional(),
            bold: Joi.boolean().optional(),
            italic: Joi.boolean().optional(),
            underline: Joi.boolean().optional()
        }).optional()
    }).options({ allowUnknown: true }).validate(req.body);

    if (value.error) {
        return res.status(400).json({ success: false, message: value.error.details[0].message });
    }

    const { title, metaData, category, subcategory, serviceTags, description, textFormatting } = req.body;
    const formattedText = textFormatting || {};

    if (req.payload._id == undefined) {
        return res.status(400).json({ success: false, message: "user id not found" });
    }

    const ifServiceExit = await CreateService.find({ user_id: req.payload._id, isCompleted: true });
    if (ifServiceExit.length < 7) {
        const service = new CreateService({
            user_id: req.payload._id,
            title,
            metaData,
            description, // Store the HTML content
            category,
            subcategory,
            serviceTags,
            textFormatting: formattedText // Store the formatting state
        });

        try {
            const data = await service.save();
            return res.status(200).json({ success: true, message: 'service created successfully', data: data });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    } else {
        res.status(400).json({ success: false, message: 'you can not create more than 7 services' });
    }
};

const updateServiceStepOne = async (req, res) => {
    const value = Joi.object({
        title: Joi.string().max(90).required(),
        description: Joi.string().max(1200).required(),
        category: Joi.string().required(),
        subcategory: Joi.string().required(),
        serviceTags: Joi.array().items(Joi.string()).min(1).max(5).required(),

    }).validate(req.body)
    if (value.error) {
        return res.status(400).json({ success: false, message: value.error.details[0].message })
    }
    try {
        const ifServiceExit = await CreateService.findOne({ user_id: req.payload._id, _id: req.params.serviceId })
        if (!ifServiceExit) {
            return res.status(400).json({ success: false, message: 'service not found' })
        }
        const { title, description, category, subcategory, serviceTags } = req.body;
        const service = await CreateService.findOneAndUpdate({ user_id: req.payload._id, _id: req.params.serviceId }, {
            $set: {
                title,
                description,
                category,
                subcategory,
                serviceTags
            }

        }, { new: true })



        return res.status(200).json({ success: true, message: 'service updated successfully', data: service })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
}


const createServiceStepTwo = async (req, res) => {
    const InnerValues = Joi.object().keys({
        packageName: Joi.string().required().messages({
            "string.empty": "Package name is required.",
            "any.required": "Package name is required."
        }),
        packageDetails: Joi.string().required().messages({
            "string.empty": "Package details are required.",
            "any.required": "Package details are required."
        }),
        delivery: Joi.string().required().messages({
            "string.empty": "Delivery time is required.",
            "any.required": "Delivery time is required."
        }),
        totalScreen: Joi.number().required().messages({
            "any.required": "Total screens must be specified.",
            "number.base": "Total screens must be a number."
        }),
        prototype: Joi.boolean().required().messages({
            "any.required": "Prototype field is required.",
            "boolean.base": "Prototype must be true or false."
        }),
        revisions: Joi.number().required().messages({
            "any.required": "Revisions must be specified.",
            "number.base": "Revisions must be a number."
        }),
        price: Joi.number().required().messages({
            "any.required": "Price is required.",
            "number.base": "Price must be a number."
        }),
    });

    const schema = Joi.object({
        basic: InnerValues,
        standard: InnerValues,
        premium: InnerValues,
    });

    // Validate the request body
    const { error } = schema.validate(req.body, { abortEarly: false });

    // Debug: Log the validation error
    console.log("Validation Error:", error);

    if (error) {
        return res.status(400).json({ 
            success: false, 
            errors: error.details.map(err => err.message) // Extract all error messages
        });
    }

    try {
        const updateService = await CreateService.findOne({ 
            user_id: req.payload._id, 
            _id: req.params.serviceId 
        });

        if (!updateService) {
            return res.status(400).json({ success: false, message: 'Service not found' });
        }

        updateService.pricing = req.body;
        const updatedService = await updateService.save();

        return res.status(200).json({ 
            success: true, 
            message: 'Service updated successfully', 
            data: updatedService 
        });
    } catch (error) {
        console.log("Server Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


const createServiceStepThree = async (req, res) => {
    
    const values = Joi.object({
        questions: Joi.array().items(Joi.string()),
        faqs: Joi.array().items(Joi.string()),
    }).validate(req.body)
    if (values.error) {
        return res.status(400).json({ success: false, message: values.error.details[0].message })
    }
    try {


        const updateService = await CreateService.findOneAndUpdate({ user_id: req.payload._id, _id: req.params.serviceId }, {
            $set: req.body
        }, { new: true })
        return res.status(200).json({ success: true, message: 'service updated successfully', data: updateService })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const createServiceStepFour = async (req, res) => {
    // check if req.files is empty or not
    const values = Joi.object({
        // req.files.serviceImages is array of objects or just object and we are validating it to have not more than 3 images

        servicesImages: Joi.alternatives().try(Joi.array(), Joi.object()).required(),
        serviceDocuments: Joi.alternatives().try(Joi.array().max(3), Joi.object())

    }).validate(req.files)
    if (values.error) {
        return res.status(400).json({ success: false, message: values.error.details[0].message })
    }
    try {

        // uplaod multiple images coming from frontend to cloudinary directly without saving them locally on server and then uploading them to cloudinary
        const uploadImages = async (images) => {
            const urls = []
            if (Array.isArray(images)) {

                for (const image of images) {
                    try {
                        const newPath = await cloudinary.uploader.upload(image?.tempFilePath, { folder: 'ServiceImages' })
                        // urls.push(newPath.url)
                        urls.push({ imgUrl: newPath.secure_url, publicId: newPath.public_id })
                        await fs.unlink(image?.tempFilePath)
                    } catch (error) {
                        await fs.unlink(image?.tempFilePath).catch(()=>{{
                            console.error(`Failed to delete temp file: ${image.tempFilePath}`);
                        }})
                        throw new Error(error.message);
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
                    throw new Error(error.message);
                }
            }

            return urls
        }
        const uploadDocuments = async (documents) => {
            const urls = []
            if (Array.isArray(documents)) {

                for (const document of documents) {

                    try {
                        const newPath = await cloudinary.uploader.upload(document?.tempFilePath, { folder: 'ServiceDocuments' })
                        urls.push({ imgUrl: newPath.secure_url, publicId: newPath.public_id })
                    } catch (error) {
                        throw new Error(error.message);
                    }
                }
            }
            else {
                try {
                    const newPath = await cloudinary.uploader.upload(documents?.tempFilePath, { folder: 'ServiceDocuments' })
                    urls.push({ imgUrl: newPath.secure_url, publicId: newPath.public_id })
                } catch (error) {
                    throw new Error(error.message);
                }

            }
            return urls
        }



        const images = await uploadImages(req.files.servicesImages)
        // const documents = await uploadDocuments(req.files.serviceDocuments)

        const updateService = await CreateService.findOneAndUpdate({ user_id: req.payload._id, _id: req.params.serviceId }, {
            //pushing images and documents to array of objects and seting terms and conditions to true
            isCompleted:true,
            $push: {
                servicesImages:
                    images.length > 0 ? { $each: images } :
                        {}
                        // , serviceDocuments: documents.length > 0
                        //     ? { $each: documents } : {}
            },
            // termsAndConditions: req.body.termsAndConditions
            termsAndConditions: true
        }
            , { new: true })

        if (!updateService) {
            return res.status(400).json({ success: false, message: 'service not found' })
        }

        return res.status(200).json({ success: true, message: 'service updated successfully', data: updateService })
        // res.send("uploaaded")
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: error.message })
    }

}

const deleteServiceGalleryData = async (req, res) => {
    try {
        const service = await CreateService.findOneAndUpdate({ user_id: req.payload._id, _id: req.params.serviceId }, {
            $pull: {
                // pull images from array of objects where publicId is equal to req.body.publicId
                servicesImages: { publicId: req.body.publicId }

            }
        }, { new: true }
        )
        if (!service) {
            return res.status(400).json({ success: false, message: 'service not found' })
        }

        // delete image from cloudinary
        await cloudinary.uploader.destroy(req.body.publicId)
        return res.status(200).json({ success: true, message: 'image deleted successfully', data: service })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const deleteServiceDocumentData = async (req, res) => {
    try {

        const service = await CreateService.findOneAndUpdate({ user_id: req.payload._id, _id: req.params.serviceId }, {
            $pull: {
                // pull documents from array of objects where publicId is equal to req.body.publicId
                serviceDocuments: { publicId: req.body.publicId }
            }
        }, { new: true }
        )
        if (!service) {
            return res.status(400).json({ success: false, message: 'service not found' })
        }
        // delete document from cloudinary
        await cloudinary.uploader.destroy(req.body.publicId)
        return res.status(200).json({ success: true, message: 'document deleted successfully', data: service })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Get all services of a Talent

const getAllTalentServices = async (req, res) => {
    try {
        const services = await CreateService.find({ 
            isCompleted:true
            }
            )
        if (!services) {
            return res.status(400).json({ success: false, message: 'services not found' })
        }
        return res.status(200).json({ success: true, message: 'services found successfully', data: services })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getCurrentUserTalentServices = async (req, res) => {
    try {
        const services = await CreateService.find({
             user_id: req.payload._id ,
             isCompleted:true
            }
            )
        if (!services) {
            return res.status(400).json({ success: false, message: 'services not found' })
        }
        return res.status(200).json({ success: true, message: 'services found successfully', data: services })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const deleteOneService = async (req, res) => {
    try {
        const service = await CreateService.findOneAndDelete({ user_id: req.payload._id, _id: req.params.serviceId });

        if (!service) {
            return res.status(400).json({ success: false, message: 'service not found' })
        }
        return res.status(200).json({ success: true, message: 'service deleted successfully', data: service })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}
const getTalentOwnServiceById = async (req, res) => {
    try {
        const service = await CreateService.findOne({ user_id: req.payload._id, _id: req.params.serviceId }).populate('user_id')
        if (!service) {
            return res.status(400).json({ success: false, message: 'service not found' })
        }
        return res.status(200).json(service)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: error.message })
    }
}
const getServiceDetails = async (req, res) => {
    try {
        const service = await CreateService.findOne({ _id: req.params.serviceId }).populate('user_id')
        if (!service) {
            return res.status(400).json({ success: false, message: 'service not found' })
        }
        return res.status(200).json(service)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: error.message })

    }
}





// TODO: accoutSettingsController NotifcationController OrderDeliveryController

module.exports = {
    getTalentOwnServiceById,
    getServiceDetails,
    createServiceStepOne,
    createServiceStepTwo,
    createServiceStepThree,
    createServiceStepFour,
    deleteServiceGalleryData,
    deleteServiceDocumentData,
    getAllTalentServices,
    getCurrentUserTalentServices,
    deleteOneService,
    updateServiceStepOne,

}







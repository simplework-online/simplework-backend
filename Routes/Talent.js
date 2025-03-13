const express = require('express')
const fileupload = require('express-fileupload');
const { createServiceStepOne, createServiceStepTwo,
    createServiceStepThree,
    createServiceStepFour,
    deleteServiceGalleryData,
    deleteServiceDocumentData,
    getAllTalentServices,
    deleteOneService,
    updateServiceStepOne,
    updateAllServices,
    getTalentOwnServiceById,
    getServiceDetails,
    getCurrentUserTalentServices,
} = require('../Controllers/Talent/Talent')
const { auth } = require('../Middlewares/auth');
const fileUpload = require('express-fileupload');
const route = express.Router()

route.post("/create-service/step-one", auth, createServiceStepOne)

route.post("/update-service/step-one/:serviceId", auth, updateServiceStepOne)

route.post("/create-service/step-two/:serviceId", auth, createServiceStepTwo)

route.post("/create-service/step-three/:serviceId", auth, createServiceStepThree)

route.post("/create-service/step-four/:serviceId",auth, createServiceStepFour)

route.delete("/delete-service-gallery-data/:serviceId", auth, deleteServiceGalleryData)

route.delete("/delete-service-document-data/:serviceId", auth, deleteServiceDocumentData)
route.get("/get-services-data", getAllTalentServices)
route.get("/get-current-user-services-data",auth, getCurrentUserTalentServices)
route.get("/get-single-service/:serviceId", auth, getTalentOwnServiceById)

route.delete("/delete-service/:serviceId", auth, deleteOneService)

// buyer  routes
route.get("/get-service-details/:serviceId", getServiceDetails)


module.exports = route

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { updateImageName,uploadProfileImage,multerFile,getProfileImageUrl,
    removeProfileImage,uploadBrokerImage ,getBrokerUserProfileImageUrl,getBrokerUserProfileViewedImageUrl} = require('../azureservice/fileUploadService')
//const { getAllStates } = require('../controllers/masterDataController')



router.route('/updateImageName').post(protect,updateImageName)
router.route('/uploadProfileImage').post(protect,multerFile,uploadProfileImage)
router.route('/getProfileImageUrl').post(protect,getProfileImageUrl)
router.route('/getBrokerUserProfileImageUrl').post(protect,getBrokerUserProfileImageUrl)
router.route('/getBrokerUserProfileViewedImageUrl').post(protect,getBrokerUserProfileViewedImageUrl)
router.route('/removeProfileImage').post(protect,removeProfileImage)
router.route('/uploadBrokerImage').post(protect,multerFile,uploadBrokerImage)


module.exports = router
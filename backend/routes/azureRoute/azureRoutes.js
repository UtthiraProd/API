const { levelThreeRateLimit, levelTwoRateLimit,levelOneRateLimit } = require('../../middleware/rateLimiters');
const express = require('express')
const router = express.Router()
const { protect } = require('../../middleware/authMiddleware')
const { updateImageName,uploadProfileImage,multerFile,getProfileImageUrl,
    removeProfileImage,uploadBrokerImage ,getBrokerUserProfileImageUrl,getPUImageUrl,
    getBrokerUserProfileViewedImageUrl,getBrokImageUrl, uploadPUProfileImage,getPUProfileImageURL, getPUProfileViewedImageURL,
PURemoveProfileImage,PUProfileImageUrl,getBrokerProfileImageUrl} = require('../../azureservice/fileUploadService')
   
//const { getAllStates } = require('../controllers/masterDataController')



router.route('/updateImageName').post(protect,levelThreeRateLimit,updateImageName)
router.route('/uploadProfileImage').post(protect,levelTwoRateLimit,multerFile,uploadProfileImage)
router.route('/getProfileImageUrl').post(protect,levelThreeRateLimit,getProfileImageUrl)
router.route('/getBrokerUserProfileImageUrl').post(protect,levelThreeRateLimit,getBrokerUserProfileImageUrl)
router.route('/getBrokerUserProfileViewedImageUrl').post(protect,levelThreeRateLimit,getBrokerUserProfileViewedImageUrl)
router.route('/removeProfileImage').post(protect,levelThreeRateLimit,removeProfileImage)
router.route('/uploadBrokerImage').post(protect,levelThreeRateLimit,multerFile,uploadBrokerImage)
router.route('/getBrokImageUrl').post(protect,levelThreeRateLimit,getBrokImageUrl)
router.route('/uploadPUProfileImage').post(protect,levelOneRateLimit,multerFile,uploadPUProfileImage)
router.route('/getPUImageUrl').post(protect,levelThreeRateLimit,getPUImageUrl)
router.route('/getPUProfileImageURL').post(protect,levelThreeRateLimit, getPUProfileImageURL)
router.route('/getPUProfileViewedImageURL').post(protect,levelTwoRateLimit, getPUProfileViewedImageURL)
router.route('/PURemoveProfileImage').post(protect,levelOneRateLimit, PURemoveProfileImage)
router.route('/PUProfileImageUrl').post(protect,levelThreeRateLimit,PUProfileImageUrl)
router.route('/getBrokerProfileImageUrl').post(protect,levelThreeRateLimit,getBrokerProfileImageUrl)



module.exports = router
const express = require('express')
const router = express.Router()
const {
       // registerProfile,
       // updateProfile, 
       // getProfileDetailsById,
       // getBrokerDetailsById,searchProfile,deleteProfile,setProfilePhoto,updateHoroscope,
       aprroveProfileByAdmin,getBrokerApprovedProfiles,getBrokerCreatedProfiles} = require('../controllers/profileController')

const {getAllProfilesByBrokerId,getAdminApprovedProfiles} = require('../controllers/profileController')

const {protect} = require('../middleware/authMiddleware')
// router.route('/updateProfile').post(protect,generalApiLimiter,updateProfile)
// router.route('/').post(protect,generalApiLimiter,registerProfile)
// router.route('/getAllProfilesByBrokerId').post(protect,generalApiLimiter,getAllProfilesByBrokerId)
// router.route('/getProfileDetails').post(protect,generalApiLimiter,getProfileDetailsById)
// router.route('/getBrokerDetailsById').post(protect,generalApiLimiter,getBrokerDetailsById)
// router.route('/searchProfile').post(protect,generalApiLimiter,searchProfile)
// router.route('/deleteProfile').post(protect,sensitiveDataLimiter,deleteProfile)
// router.route('/setProfilePhoto').post(protect,sensitiveDataLimiter,setProfilePhoto)
// router.route('/updateHoroscope').post(protect,sensitiveDataLimiter,updateHoroscope)
router.route('/getAdminApprovedProfiles').post(protect,getAdminApprovedProfiles)

router.route('/adminApprove').post(protect,aprroveProfileByAdmin)
router.route('/brokerApproved').post(protect,getBrokerApprovedProfiles)
router.route('/getBrokerCreatedProfiles').post(protect,getBrokerCreatedProfiles)
// router.route('/userFind').post(protect,generalApiLimiter,userFind)




module.exports = router
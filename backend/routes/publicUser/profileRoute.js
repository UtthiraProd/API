const { levelOneRateLimit, levelTwoRateLimit, levelThreeRateLimit, levelFourRateLimit, levelFiveRateLimit  } = require('../../middleware/rateLimiters');
const express=require('express')
const router=express.Router()

const{registerProfile,getProfileDetailsById,deleteProfile,publicUserDetails,updateProfile,
    getMarriageProfileDetailById,getHoroscopeDetailsById, UpdatePUHoroscope}=require('../../controllers/publicUser/profileController')


const {protect} = require('../../middleware/authMiddleware')

router.route('/registerProfile').post(protect,levelTwoRateLimit,registerProfile)
router.route('/getProfileDetailsById').post(protect,levelTwoRateLimit,getProfileDetailsById)
router.route('/deleteProfile').post(protect,levelOneRateLimit,deleteProfile)
router.route('/publicUserDetails').post(protect,levelTwoRateLimit,publicUserDetails)
router.route('/updateProfile').post(protect,levelTwoRateLimit,updateProfile)
router.route('/getMarriageProfileDetailById').post(protect,levelThreeRateLimit,getMarriageProfileDetailById)
router.route('/getHoroscopeDetailsById').post(protect,levelThreeRateLimit,getHoroscopeDetailsById)
router.route('/UpdatePUHoroscope').post(protect,levelTwoRateLimit,UpdatePUHoroscope)

module.exports=router
const { levelOneRateLimit, levelTwoRateLimit, levelThreeRateLimit, levelFourRateLimit, levelFiveRateLimit } = require('../../middleware/rateLimiters');
const express=require('express')
const router= express.Router()
const {protect} = require('../../middleware/authMiddleware')
const {registerProfile,getProfileDetailsById,userFind,getBrokerDetailsById,searchProfile,updateProfile,updateHoroscope,deleteProfile,
       setProfilePhoto,addCommand,
       getAllCommand,
       deleteCommand,PUProfileBrokerAllow,PUViewImageBrokerAllow}  = require ('../../controllers/broker/profileController')

router.route('/').post(protect,levelTwoRateLimit,registerProfile)
router.route('/userFind').post(protect,levelFiveRateLimit,userFind)
router.route('/delete').post(protect,levelTwoRateLimit,deleteProfile)
router.route('/updateProfile').post(protect,levelTwoRateLimit,updateProfile)
router.route('/searchProfile').post(protect,levelFiveRateLimit,searchProfile)
router.route('/deleteProfile').post(protect,levelTwoRateLimit,deleteProfile)
router.route('/updateHoroscope').post(protect,levelTwoRateLimit,updateHoroscope)
router.route('/setProfilePhoto').post(protect,levelTwoRateLimit,setProfilePhoto)
router.route('/getBrokerDetailsById').post(protect,levelFourRateLimit,getBrokerDetailsById)
router.route('/getProfileDetailsById').post(protect,levelFourRateLimit,getProfileDetailsById)
router.post('/addCommand',addCommand)
// router.get('/getAllCommand',getAllCommand)
router.post('/deletecommand',deleteCommand)
router.route('/PUProfileBrokerAllow').post(protect,levelThreeRateLimit,PUProfileBrokerAllow)
router.route('/PUViewImageBrokerAllow').post(protect,levelThreeRateLimit,PUViewImageBrokerAllow)




module.exports=router
const express=require('express')
const router= express.Router()
const {protect} = require('../middleware/authMiddleware')
const {registerProfile,getProfileDetailsById,userFind,getBrokerDetailsById,searchProfile,updateProfile,updateHoroscope,deleteProfile,
       setProfilePhoto}  = require ('../controllers/broker/profileController')


router.route('/delete').post(protect,deleteProfile)
router.route('/getProfileDetailsById').post(protect,getProfileDetailsById)
router.route('/userFind').post(protect,userFind)
router.route('/getBrokerDetailsById').post(protect,getBrokerDetailsById)
router.route('/').post(protect,registerProfile)
router.route('/searchProfile').post(protect,searchProfile)
router.route('/updateProfile').post(protect,updateProfile)
router.route('/updateHoroscope').post(protect,updateHoroscope)
router.route('/deleteProfile').post(protect,deleteProfile)
router.route('/setProfilePhoto').post(protect,setProfilePhoto)



module.exports=router
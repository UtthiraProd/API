const express =require('express')
const router =express.Router()
const {protect} = require('../middleware/authMiddleware')
const { getProfileDetailsById, getAllProfilesByBrokerId,getBrokerDetails,getProfileHoroscopeDetailsById } = require('../controllers/brokerUser/profileController')
const {brokerUserDetails,userBalanceQuota, BUplanexists} = require ('../controllers/brokerUser/brokUserProfileController')


router.route('/getAllProfilesByBrokerId').post(protect,getAllProfilesByBrokerId)
router.route('/brokerUserDetails').post(protect,brokerUserDetails)
router.route('/userBalanceQuota').post(protect,userBalanceQuota)
router.route('/getProfileDetails').post(protect,getProfileDetailsById)
router.route('/getProfileHoroscopeDetails').post(protect,getProfileHoroscopeDetailsById)
router.route('/getBrokerDetails').post(protect,getBrokerDetails)
router.post('/BUplanexists',BUplanexists)

module.exports=router
const {levelFiveRateLimit, levelFourRateLimit,levelThreeRateLimit,levelTwoRateLimit} = require('../../middleware/rateLimiters');
const express =require('express')
const router =express.Router()
const {protect} = require('../../middleware/authMiddleware')
const { getProfileDetailsById, getAllProfilesByBrokerId,getBrokerDetails,getProfileHoroscopeDetailsById } = require('../../controllers/brokerUser/profileController')
const {brokerUserDetails,userBalanceQuota, BUplanexists} = require ('../../controllers/brokerUser/brokUserProfileController')


router.route('/getAllProfilesByBrokerId').post(protect,levelFiveRateLimit,getAllProfilesByBrokerId)
router.route('/brokerUserDetails').post(protect,levelFiveRateLimit,brokerUserDetails)
router.route('/userBalanceQuota').post(protect,levelFourRateLimit,userBalanceQuota)
router.route('/getProfileDetails').post(protect,levelThreeRateLimit,getProfileDetailsById)
router.route('/getProfileHoroscopeDetails').post(protect,levelThreeRateLimit,getProfileHoroscopeDetailsById)
router.route('/getBrokerDetails').post(protect,levelFiveRateLimit,getBrokerDetails)
// router.post('/BUplanexists',BUplanexists)
router.route('/BUplanexists').post(protect,levelTwoRateLimit,BUplanexists)




module.exports=router
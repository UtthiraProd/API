
const { levelOneRateLimit, levelTwoRateLimit, levelThreeRateLimit, levelFourRateLimit, levelFiveRateLimit  } = require('../../middleware/rateLimiters');
const express = require('express')
const router = express.Router()

const {getBrokerUserOTP,brokerUserOTPVerify,userLoginCreate,} = require ('../../controllers/broker/userController')      
const { protect } = require('../../middleware/authMiddleware')

router.route('/userLoginCreate').post(protect,levelThreeRateLimit,userLoginCreate)
router.route('/getBrokerUserOTP').post(protect,levelThreeRateLimit,getBrokerUserOTP)
router.route('/brokerUserOTPVerify').post(protect,levelThreeRateLimit,brokerUserOTPVerify)



module.exports = router

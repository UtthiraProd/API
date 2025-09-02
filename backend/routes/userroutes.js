
const { levelOneRateLimit, levelTwoRateLimit, levelThreeRateLimit, levelFourRateLimit, levelFiveRateLimit} = require('../middleware/rateLimiters');
const express = require('express')
const router = express.Router()
const {registerUser,loginUser,getUserMenuDetailsById,resetUserPassword,verifyRegEmailOTP,
       getNewRegisterOTP,getResetPasswordOTP,getForgotUserOTP,forgotUserVerify,VerifyRegisterOTP,logoutTrue,resentEmailOTP, activeUser} = require('../controllers/userController')
const {getBrokerUserOTP,brokerUserOTPVerify,userLoginCreate} = require ('../controllers/broker/userController')      
const { protect } = require('../middleware/authMiddleware')

router.post('/',registerUser)
router.post('/login',levelOneRateLimit,loginUser)
router.route('/getUserMenuDetailsById').post(protect,levelFourRateLimit,getUserMenuDetailsById)

router.post('/resetUserPassword',levelOneRateLimit,resetUserPassword)
router.post('/getNewRegisterOTP',levelOneRateLimit,getNewRegisterOTP)
router.post('/getResetPasswordOTP',levelOneRateLimit,getResetPasswordOTP)
router.post('/getForgotUserOTP',levelOneRateLimit,getForgotUserOTP)
router.post('/forgotUser',levelOneRateLimit,forgotUserVerify)
router.post('/VerifyRegisterOTP',levelOneRateLimit,VerifyRegisterOTP)
router.post('/verifyRegEmailOTP',levelOneRateLimit,verifyRegEmailOTP)
router.post('/resentEmailOTP', resentEmailOTP)
router.route('/userLoginCreate').post(protect,levelOneRateLimit,userLoginCreate)
router.route('/getBrokerUserOTP').post(protect,levelOneRateLimit,getBrokerUserOTP)
router.route('/brokerUserOTPVerify').post(protect,levelOneRateLimit,brokerUserOTPVerify)
// router.route('/logoutTrue').post(protect,logoutTrue)
router.post('/logoutTrue',levelOneRateLimit,logoutTrue)

router.route('/activeUser').post(protect,activeUser)
// router.post('/activeUser',activeUser)


module.exports = router

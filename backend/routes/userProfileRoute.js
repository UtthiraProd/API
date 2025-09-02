const  express=require ('express')
const router = express.Router()
const {protect} = require('../middleware/authMiddleware')

const { getMarriageProfiles, getMarriageProfileById,getPlanByBroker,deleteUserLogin, getLoginUserProfile,
    getUserDetailsById,getLoginUserName} = require('../controllers/broker/userProfileController')

const {balanceQuota, createPlanSchedule} = require ('../controllers/broker/planController')    

router.route('/getMarriageProfiles').post(protect,getMarriageProfiles)
router.route('/getMarriageProfileById').get(protect,getMarriageProfileById)
// router.post('/userLoginCreate',userLoginCreate)
router.delete('/deleteUserLogin',deleteUserLogin)
router.route('/getUserDetailsById').get(protect,getUserDetailsById)
router.route('/getPlanByBroker').post(protect,getPlanByBroker)
router.route('/getLoginUserProfile').post(protect,getLoginUserProfile)
// router.route('/userLoginCreate').post(protect,generalApiLimiter,userLoginCreate)
router.route('/getLoginUserName').get(protect,getLoginUserName)
// router.route('/getBrokerUserOTP').post(protect,getBrokerUserOTP)

// router.route('/balanceQuota').post(protect,generalApiLimiter,balanceQuota)
router.route('/createPlanSchedule').post(protect,createPlanSchedule)

module.exports=router
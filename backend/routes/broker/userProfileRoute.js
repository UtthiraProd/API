const { levelOneRateLimit, levelTwoRateLimit, levelThreeRateLimit, levelFourRateLimit, levelFiveRateLimit } = require('../../middleware/rateLimiters');
const  express=require ('express')
const router = express.Router()
const {protect} = require('../../middleware/authMiddleware')

const { getMarriageProfiles, getMarriageProfileById,getPlanByBroker,deleteUserLogin, getLoginUserProfile,
    getUserDetailsById,getLoginUserName} = require('../../controllers/broker/userProfileController')  

router.route('/getMarriageProfiles').post(protect,levelFiveRateLimit,getMarriageProfiles)
router.route('/getMarriageProfileById').get(protect,levelThreeRateLimit,getMarriageProfileById)
router.delete('/deleteUserLogin',levelTwoRateLimit,deleteUserLogin)
router.route('/getUserDetailsById').get(protect,levelThreeRateLimit,getUserDetailsById)
router.route('/getPlanByBroker').post(protect,levelThreeRateLimit,getPlanByBroker)
router.route('/getLoginUserProfile').post(protect,levelFourRateLimit,getLoginUserProfile)
router.route('/getLoginUserName').get(protect,levelThreeRateLimit,getLoginUserName)

module.exports=router
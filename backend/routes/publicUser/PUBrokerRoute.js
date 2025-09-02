
const { levelOneRateLimit, levelTwoRateLimit, levelThreeRateLimit, levelFourRateLimit, levelFiveRateLimit  } = require('../../middleware/rateLimiters');
const express=require('express')
const router=express.Router()

const{getAllBroker,getAllProfilesByBrokers,PUExistsingPlan}=require('../../controllers/publicUser/PUBrokerController')


const {protect} = require('../../middleware/authMiddleware')

router.route('/getAllBroker').post(protect,levelFourRateLimit,getAllBroker)
router.route('/getAllProfilesByBrokers').post(protect,levelFourRateLimit,getAllProfilesByBrokers)
router.route('/PUExistsingPlan').post(protect,levelThreeRateLimit,PUExistsingPlan)




module.exports=router
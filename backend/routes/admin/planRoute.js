const { levelOneRateLimit, levelTwoRateLimit, levelThreeRateLimit, levelFourRateLimit, levelFiveRateLimit  } = require('../../middleware/rateLimiters');
const express = require ('express')
const {createPlan,getAllPlan,getBrokerId,deletePlan,updatePlan} = require('../../controllers/admin/planController')
const { protect } = require('../../middleware/authMiddleware')

const router = express.Router()

router.route('/createPlan').post(protect,levelTwoRateLimit,createPlan)
router.route('/getAllPlan').post(protect,levelThreeRateLimit,getAllPlan)
router.route('/getBrokerId').post(protect,levelTwoRateLimit,getBrokerId)
router.route('/deletePlan').delete(protect,levelTwoRateLimit,deletePlan)
router.route('/updatePlan').post(protect,levelTwoRateLimit,updatePlan)





module.exports = router
const express = require('express')
const router = express.Router()
const { levelOneRateLimit, levelTwoRateLimit, levelThreeRateLimit, levelFourRateLimit, levelFiveRateLimit  } = require('../../middleware/rateLimiters');

const { upgradePlan, getPublicUserPlans, PUBalanceQuota, AdditionalPlan,
        getAllPUplans, activePlan,viewplan,viewplanActive} = require("../../controllers/publicUser/PUPlanController")
const { protect } = require('../../middleware/authMiddleware')

router.route('/upgradePlan').post(protect,levelOneRateLimit, upgradePlan)
router.route('/getPublicUserPlans').post(protect,levelTwoRateLimit, getPublicUserPlans)
router.route('/PUBalanceQuota').post(protect,levelThreeRateLimit, PUBalanceQuota)
router.route('/AdditionalPlan').post(protect,levelOneRateLimit,AdditionalPlan)
router.route('/getAllPUplans').post(protect,levelTwoRateLimit,getAllPUplans)
router.route('/activePlan').post(protect,levelTwoRateLimit,activePlan)
router.route('/viewplan').post(protect,levelTwoRateLimit,viewplan)
router.route('/viewplanActive').post(protect,levelTwoRateLimit,viewplanActive)

// router.get('/getAllPUplans',getAllPUplans)

module.exports = router
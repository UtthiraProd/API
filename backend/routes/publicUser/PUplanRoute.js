const express = require('express')
const router = express.Router()
const { levelOneRateLimit, levelTwoRateLimit, levelThreeRateLimit, levelFourRateLimit, levelFiveRateLimit  } = require('../../middleware/rateLimiters');

const { upgradePlan, getPublicUserPlans, PUBalanceQuota, AdditionalPlan,
        getAllPUplans, activePlan,viewplan,viewplanActive} = require("../../controllers/publicUser/PUPlanController")
const { protect } = require('../../middleware/authMiddleware')

router.route('/upgradePlan').post(protect, upgradePlan)
router.route('/getPublicUserPlans').post(protect, getPublicUserPlans)
router.route('/PUBalanceQuota').post(protect, PUBalanceQuota)
router.route('/AdditionalPlan').post(protect,AdditionalPlan)
router.route('/getAllPUplans').post(protect,getAllPUplans)
router.route('/activePlan').post(protect,activePlan)
router.route('/viewplan').post(protect,viewplan)
router.route('/viewplanActive').post(protect,viewplanActive)

// router.get('/getAllPUplans',getAllPUplans)

module.exports = router
const { levelThreeRateLimit } = require('../../middleware/rateLimiters');
const express = require('express')
const router = express.Router()
const { getDashboardDetailByBrokerId} = require('../../controllers/broker/dashboardController')
const {protect} = require('../../middleware/authMiddleware')

// router.route('/getDashboardDetailByBrokerId').post(protect,levelThreeRateLimit,getDashboardDetailByBrokerId)
router.route('/getDashboardDetailByBrokerId').post(protect,getDashboardDetailByBrokerId)


module.exports = router


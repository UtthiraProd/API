const express = require('express')
const router = express.Router()
const { getDashboardDetailByBrokerId} = require('../controllers/dashboardController')
const {protect} = require('../middleware/authMiddleware')
router.route('/getDashboardDetailByBrokerId').post(protect,getDashboardDetailByBrokerId)

module.exports = router


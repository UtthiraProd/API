const { levelTwoRateLimit } = require('../../middleware/rateLimiters');
const express = require ('express')
const {createPlanSchedule,balanceQuota,CountProfileViewDownload,ViewOrDownloadProfileCountCheck} = require('../../controllers/broker/planController')
const { protect } = require('../../middleware/authMiddleware')

const router = express.Router()

router.route('/createPlanSchedule').post(protect,levelTwoRateLimit,createPlanSchedule)
router.route('/balanceQuota').post(protect,levelTwoRateLimit,balanceQuota)
router.post('/CountProfileViewDownload',levelTwoRateLimit,CountProfileViewDownload)
router.post('/ViewOrDownloadProfileCountCheck',levelTwoRateLimit,ViewOrDownloadProfileCountCheck)



module.exports = router
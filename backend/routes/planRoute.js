const express = require ('express')
const {createPlan,getAllPlan,getBrokerId,deletePlan,updatePlan,
    CountProfileViewDownload,ViewOrDownloadProfileCountCheck} = require('../controllers/admin/planController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()


// router.post('/getPlanDetailsBYId',getPlanDetailsBYId)
router.route('/createPlan').post(protect,createPlan)
router.route('/getAllPlan').post(protect,getAllPlan)
router.route('/getBrokerId').post(protect,getBrokerId)
router.route('/deletePlan').delete(protect,deletePlan)
router.route('/updatePlan').post(protect,updatePlan)
// router.post('/createPlanSchedule',createPlanSchedule)
router.post('/CountProfileViewDownload',CountProfileViewDownload)
router.post('/ViewOrDownloadProfileCountCheck',ViewOrDownloadProfileCountCheck)
// router.route('/createPlanSchedule').post(protect,generalApiLimiter,createPlanSchedule)0
// router.route('/getPlanDetailsBYId').post(protect,generalApiLimiter,getPlanDetailsBYId)
// router.route('/balanceQuota').post(protect,generalApiLimiter,balanceQuota)



module.exports = router
const express = require('express')
const router = express.Router()
const {registerBroker,getBrokerById,getAllBroker,
    getAllBrokerByPaging,getBrokerDetailById,topUpPlanBroker} = require('../controllers/brokerController')

const {protect} = require('../middleware/authMiddleware')

router.route('/').post(protect,registerBroker)
router.route('/getAllBrokerByPaging').post(protect,getAllBrokerByPaging)
router.route('/getAllBroker').post(protect,getAllBroker)
router.route('/getBrokerDetailById').post(protect,getBrokerDetailById)
router.route('/topUpPlanBroker').post(protect,topUpPlanBroker)

module.exports = router
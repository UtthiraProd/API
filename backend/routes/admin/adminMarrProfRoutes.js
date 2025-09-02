const { levelOneRateLimit, levelTwoRateLimit, levelThreeRateLimit, levelFourRateLimit, levelFiveRateLimit  } = require('../../middleware/rateLimiters');
const express=require('express')
const router=express.Router()

const{adminRegisterBroker,adminUpdateBroker,adminDeleteBroker,adminGetBrokerByID,getBrokerPlan,topUpPlanBroker,getAllBroker,
    // getallMatName,
    getallBrokerName,AsignBroker,
    adminAssignBrokertoPublic,
    getBrokertoBroker,
    adminAssignBrokertoBroker}=require('../../controllers/admin/adminBrokerController')


const {protect} = require('../../middleware/authMiddleware')

router.route('/getAllBroker').post(protect,levelFourRateLimit,getAllBroker)
router.route('/adminRegisterBroker').post(protect,levelTwoRateLimit,adminRegisterBroker)
router.route('/adminGetBrokerByID').get(protect,levelThreeRateLimit,adminGetBrokerByID)
router.route('/adminDeleteBroker').delete(protect,levelTwoRateLimit,adminDeleteBroker)
router.route('/adminUpdateBroker').post(protect,levelTwoRateLimit,adminUpdateBroker)
router.route('/getBrokerPlan').get(protect,levelThreeRateLimit,getBrokerPlan)
router.route('/topUpPlanBroker').post(protect,levelOneRateLimit,topUpPlanBroker)  
// router.get('/getallBrokerName',getallBrokerName)
// router.post('/AsignBroker',AsignBroker)
// router.post('/BrokertoPublic',adminAssignBrokertoPublic)
// router.post('/getBrokertoBroker',getBrokertoBroker)
// router.post('/AssignBrokertoBroker',adminAssignBrokertoBroker)
router.route('/getallBrokerName').get(protect,levelThreeRateLimit,getallBrokerName) 
router.route('/AsignBroker').post(protect,levelTwoRateLimit,AsignBroker) 
router.route('/BrokertoPublic').post(protect,levelTwoRateLimit,adminAssignBrokertoPublic) 
router.route('/getBrokertoBroker').post(protect,levelOneRateLimit,getBrokertoBroker) 
router.route('/AssignBrokertoBroker').post(protect,levelOneRateLimit,adminAssignBrokertoBroker) 



module.exports=router
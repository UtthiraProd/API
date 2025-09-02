
const express=require('express')
const router=express.Router()

const{getAllBroker}=require('../controllers/admin/adminMarrProfController')
const{adminRegisterBroker,adminUpdateBroker,adminDeleteBroker,adminGetBrokerByID,getBrokerPlan,topUpPlanBroker}=require('../controllers/admin/adminBrokerController')


const {protect} = require('../middleware/authMiddleware')


router.get('/getBroker',getAllBroker)

router.route('/adminRegisterBroker').post(protect,adminRegisterBroker)  
router.route('/adminGetBrokerByID').get(protect,adminGetBrokerByID)     
router.route('/adminDeleteBroker').delete(protect,adminDeleteBroker)    
router.route('/adminUpdateBroker').post(protect,adminUpdateBroker)      
router.route('/getBrokerPlan').get(protect,getBrokerPlan)               
router.route('/topUpPlanBroker').post(protect,topUpPlanBroker)          




module.exports=router
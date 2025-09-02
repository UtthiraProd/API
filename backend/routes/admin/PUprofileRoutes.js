const express = require('express')
const router = express.Router()

const { levelTwoRateLimit } = require('../../middleware/rateLimiters');
const {getallPUprofile, getPUprofileByID}=require('../../controllers/admin/PUprofileController')

const {protect} = require('../../middleware/authMiddleware')

// router.post('/getPUprofile',getallPUprofile)
// router.get('/getPUprofilebyId',getPUprofileByID)
router.route('/getPUprofile').post(protect,levelTwoRateLimit,getallPUprofile)
router.route('/getPUprofilebyId').get(protect,levelTwoRateLimit,getPUprofileByID)

module.exports=router
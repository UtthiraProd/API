const express=require('express')
const router = express.Router()

const{createofficer,getAllOfficer,getOfficeById}=require('../controllers/officerController')
router.post('/create',createofficer)
router.get('/getall',getAllOfficer)
router.get('/getByID',getOfficeById)




module.exports=router
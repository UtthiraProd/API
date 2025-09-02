const express = require('express')
const router = express.Router()
const {protect} = require('../middleware/authMiddleware')
const {createState,getAllStates, getAllStars,getAllRasi,
    getAllDistrictsByState,getAllJobs,getAllQualifications,getAllConfigs,
    getAllReligions,getAllCaste,getAllEducationtype,getAllEducationlevel,getAllLocation,
    getAllForeignCountries,deletejob,createdistricts,createotherlocation
    ,getQualificationByName,createQualification,updateQualification,
    deleteQualification,createForeignCountry,deleteCountry,updateCountry,
    getForeignCountryById,getjobById,createjob,deleteCaste,
    updateCaste,getByCasteName,getByCountryName,createMotherTongue,deleteDistrict,getByDistrictName,updateDistrict,
    getAllMotherTongue,updateMotherTongue,deleteMotherTongue,getByMotherTongueName,deleleState,updateState,updateJob,
    deleteotherlocation,getJobByName,getStateByName,createcaste,createreligion,updatereligion,deletereligion,getByReligionName,
    getLocationByName,updateOtherlocation} 
    = require('../controllers/admin/masterDataController')

router.route('/addState').post(protect,createState)
router.post('/getAllStates',getAllStates)
router.get('/getAllStars',getAllStars)
router.get('/getAllRasi',getAllRasi)
router.get('/getAllDistrictsByState',getAllDistrictsByState)
router.get('/getAllJobs',getAllJobs)
router.get('/getAllQualifications',getAllQualifications)
router.get('/getAllConfig',getAllConfigs)
router.get('/getAllReligion',getAllReligions)
router.get('/getAllCaste',getAllCaste)
router.get('/getAllEducationtype',getAllEducationtype)
router.get('/getAllEducationlevel',getAllEducationlevel)
router.get('/getotherLocation',getAllLocation)
router.get('/getForeignCountries',getAllForeignCountries)
router.get('/getQualificationByName',getQualificationByName)
router.post('/createQualification',createQualification)
router.post('/updateQualification',updateQualification)
router.delete('/deleteQualification',deleteQualification)
router.post('/createForeignCountry',createForeignCountry)
router.get('/getForeignCountryById', getForeignCountryById,)
router.delete('/deleteCountry',deleteCountry)
router.post('/updateCountry',updateCountry)
router.get('/getjobById',getjobById)
router.post('/createjob',createjob)
router.delete('/deletejob',deletejob)
router.post('/createdistricts',createdistricts)
router.post('/createotherlocation',createotherlocation)
router.delete('/deletecaste',deleteCaste)
router.post('/updatecaste',updateCaste)
router.get('/getByCasteName',getByCasteName)
router.get('/getByCountryName',getByCountryName)
router.post('/createMotherTongue',createMotherTongue)
router.get('/getAllMotherTongue',getAllMotherTongue)
router.post('/updateMotherTongue',updateMotherTongue)
router.delete('/deleteMotherTongue',deleteMotherTongue)
router.get('/getByMotherTongueName',getByMotherTongueName)
router.post('/createState',createState)
router.post('/updateState',updateState)
router.delete('/deleteState',deleleState)
router.get('/getJobByName',getJobByName)
router.post('/updatejob',updateJob)
router.delete('/deletelocation',deleteotherlocation)
router.get('/getStateByName',getStateByName)
router.post('/createcaste',createcaste)
router.post('/createreligion',createreligion)
router.post('/updatereligion',updatereligion)
router.delete('/deletereligion',deletereligion)
router.get('/getByReligionName',getByReligionName)
router.post('/updateDistrict',updateDistrict)
router.delete('/deleteDistrict',deleteDistrict)
router.get('/getByDistrictName',getByDistrictName)
router.get('/getLocationByName',getLocationByName)
router.post('/updateOtherlocation',updateOtherlocation)

module.exports = router
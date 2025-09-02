const { levelFourRateLimit } = require('../../middleware/rateLimiters');
const express = require('express')
const router = express.Router()
const {protect} = require('../../middleware/authMiddleware')
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
    = require('../../controllers/admin/masterDataController')

router.route('/addState').post(protect,levelFourRateLimit,createState)
router.post('/getAllStates',levelFourRateLimit,getAllStates)
router.get('/getAllStars',levelFourRateLimit,getAllStars)
router.get('/getAllRasi',levelFourRateLimit,getAllRasi)
router.get('/getAllDistrictsByState',levelFourRateLimit,getAllDistrictsByState)
router.get('/getAllJobs',levelFourRateLimit,getAllJobs)
router.get('/getAllQualifications',levelFourRateLimit,getAllQualifications)
router.get('/getAllConfig',levelFourRateLimit,getAllConfigs)
router.get('/getAllReligion',levelFourRateLimit,getAllReligions)
router.get('/getAllCaste',levelFourRateLimit,getAllCaste)
router.get('/getAllEducationtype',levelFourRateLimit,getAllEducationtype)
router.get('/getAllEducationlevel',levelFourRateLimit,getAllEducationlevel)
router.get('/getotherLocation',levelFourRateLimit,getAllLocation)
router.get('/getForeignCountries',levelFourRateLimit,getAllForeignCountries)
router.get('/getQualificationByName',levelFourRateLimit,getQualificationByName)
router.post('/createQualification',levelFourRateLimit,createQualification)
router.post('/updateQualification',levelFourRateLimit,updateQualification)
router.delete('/deleteQualification',levelFourRateLimit,deleteQualification)
router.post('/createForeignCountry',levelFourRateLimit,createForeignCountry)
router.get('/getForeignCountryById',levelFourRateLimit, getForeignCountryById,)
router.delete('/deleteCountry',levelFourRateLimit,deleteCountry)
router.post('/updateCountry',levelFourRateLimit,updateCountry)
router.get('/getjobById',levelFourRateLimit,getjobById)
router.post('/createjob', levelFourRateLimit,createjob)
router.delete('/deletejob',levelFourRateLimit,deletejob)
router.post('/createdistricts',levelFourRateLimit,createdistricts)
router.post('/createotherlocation',levelFourRateLimit,createotherlocation)
router.delete('/deletecaste',levelFourRateLimit,deleteCaste)
router.post('/updatecaste',levelFourRateLimit,updateCaste)
router.get('/getByCasteName',levelFourRateLimit,getByCasteName)
router.get('/getByCountryName',levelFourRateLimit,getByCountryName)
router.post('/createMotherTongue',levelFourRateLimit,createMotherTongue)
router.get('/getAllMotherTongue',levelFourRateLimit,getAllMotherTongue)
router.post('/updateMotherTongue',levelFourRateLimit,updateMotherTongue)
router.delete('/deleteMotherTongue',levelFourRateLimit,deleteMotherTongue)
router.get('/getByMotherTongueName',levelFourRateLimit,getByMotherTongueName)
router.post('/createState',levelFourRateLimit,createState)
router.post('/updateState',levelFourRateLimit,updateState)
router.delete('/deleteState',levelFourRateLimit,deleleState)
router.get('/getJobByName',levelFourRateLimit,getJobByName)
router.post('/updatejob',levelFourRateLimit,updateJob)
router.delete('/deletelocation',levelFourRateLimit,deleteotherlocation)
router.get('/getStateByName',levelFourRateLimit,getStateByName)
router.post('/createcaste',levelFourRateLimit,createcaste)
router.post('/createreligion',levelFourRateLimit,createreligion)
router.post('/updatereligion',levelFourRateLimit,updatereligion)
router.delete('/deletereligion',levelFourRateLimit,deletereligion)
router.get('/getByReligionName',levelFourRateLimit,getByReligionName)
router.post('/updateDistrict',levelFourRateLimit,updateDistrict)
router.delete('/deleteDistrict',levelFourRateLimit,deleteDistrict)
router.get('/getByDistrictName',levelFourRateLimit,getByDistrictName)
router.get('/getLocationByName',levelFourRateLimit,getLocationByName)
router.post('/updateOtherlocation',levelFourRateLimit,updateOtherlocation)

module.exports = router
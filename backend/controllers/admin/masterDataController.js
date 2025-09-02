const asyncHandler = require('express-async-handler')
const States = require('../../models/stateModel')
const Star = require('../../models/starModel')
const Rasi = require('../../models/rasiModel')
const District = require('../../models/districtModel')
const Job = require('../../models/jobModel')
const Qualification = require('../../models/qualificationModel')
const Config = require('../../models/configModel')
const Religion = require('../../models/religionModel')
const Caste = require('../../models/casteModel')
const Educationtype = require('../../models/educationtypeModel')
const Educationlevel = require('../../models/educationlevelModel')
const { errorfunction } = require('../commonController')
const OtherLocation = require ('../../models/otherLocationModels')
const ForeignCountry = require('../../models/foreignCountryModels')
const MotherTongue = require('../../models/motherTongueModel')
const {fieldValidationfunction} = require('../commonController')
const ValidationConfig = require('../../models/validationConfigModel')
const User = require('../../models/userModel')

/**
 * Function Description: to create a state
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const createState = asyncHandler(async (req, res) => {

    try {


        //   const user = await User.findById(req.user.id)
                
        //         if (!user) {
        //             res.status(401)
        //             throw new Error('User not found')
        //         }
        
        const { name } = req.body.data
        
        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
            for (const currentObject of arrValidation) {

                let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);

                }
            }

        }  

        if(!name) {
            return res.status(201).json({isSuccess:false, message:"Invaild Data"})
        }
        const _state = await States.findOne({name:name})
        if(_state){
            console.log("heeloo")
            return res.status(201).json({isSuccess:false, message:name + " Already Exists"})
            
        }

        else{
            console.log("heeloo")
            const state = await States.create({
                name:name
            })
            res.status(200).json({isSuccess:true,message:"Added successfully"})
            return;
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


/**
 * Function Description: to get all states
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */




const getAllStates = asyncHandler(async (req, res) => {

    try {
        const states = await States.find()
        if (states) {
            res.status(200).json(states)
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})


/**
 * Function Description: to get all stars
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getAllStars = asyncHandler(async (req, res) => {

    try{
        const stars = await Star.find()
        if (!stars) {
            res.status(404)
            throw new Error('States not found')
        }
        res.status(200).json(stars)
    }
    catch(err) {
        errorfunction.errorHandler(err, req, res)
        res.status(500).json({ message: 'Internal Server Error' });
    }
})


/**
 * Function Description: to get all rasi
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getAllRasi = asyncHandler(async (req, res) => {

    try {
        const rasi = await Rasi.find()
        if (!rasi) {
            res.status(404)
            throw new Error('Rasi not found')
        }
        res.status(200).json(rasi)
    }
    catch(error) {
        errorfunction.errorHandler(error, req, res)
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

const getAllForeignCountries = asyncHandler(async(req,res) =>{
    try{
        const foreignCountry =await ForeignCountry.find().sort({"order":1})
        if(!foreignCountry){
            res.status(404)
            throw new Error('ForeignCountry not found')
        }
        res.status(200).json(foreignCountry)
    }
    catch(error) {
        errorfunction.errorHandler(error, req, res)
        res.status(500).json({ message: 'Internal Server Error' });
    }
})


/**
 * Function Description: to get all districts by state
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getAllDistrictsByState = asyncHandler(async (req, res) => {

    try {
        const districts = await District.find().sort({"order":1})
        if (!districts) {
            res.status(404)
            throw new Error('District not found')
        }
        res.status(200).json(districts)
    }
    catch(error) {
        errorfunction.errorHandler(error, req, res)
        res.status(500).json({ message: 'Internal Server Error' });
    }

})

const getAllLocation =asyncHandler (async(req, res) =>{
    try{
        const location =await OtherLocation.find().sort({"order":1})
        if(!location){
            res.status(404)
            throw new Error('Location not found')
        }
        res.status(200).json(location)
    }
    catch(error) {
        errorfunction.errorHandler(error, req, res)
        res.status(500).json({ message: 'Internal Server Error' });
    }
})



/**
 * Function Description: to get all jobs
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getAllJobs = asyncHandler(async (req, res) => {
    try {
        const jobs = await Job.find().sort({ job: 1 })
        if (!jobs) {
            res.status(404)
            throw new Error('Job not found')
        }
        res.status(200).json(jobs)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

/**
 * Function Description: to get all qualifications
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getAllQualifications = asyncHandler(async (req, res) => {
    try {
        const qualifications = await Qualification.find()
        if (!qualifications) {
            res.status(404)
            throw new Error('Job not found')
        }
        res.status(200).json(qualifications)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

const getQualificationByName=asyncHandler(async(req,res)=>{
    
       const {qualification}=req.query;
       console.log(req.query)

        if(qualification.length>2){
            const _qualification = await Qualification.find({
                qualification:{$regex:qualification, $options:'i'}
            })
        if(_qualification){
            res.status(201).json(_qualification)
        }
        else{
            console.log("error occur")
        }
        }
        else if(qualification.length=0){
            const _qualification = await Qualification.find({})
            res.status(201).json(_qualification)
        }
    
    
})

/**
 * Function Description: to get all configs
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getAllConfigs = asyncHandler(async (req, res) => {
    try {
        const configs = await Config.find()
        if (!configs) {
            res.status(404)
            throw new Error('Config not found')
        }
        res.status(200).json(configs)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

/**
 * Function Description: to get all religions
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getAllReligions = asyncHandler(async (req, res) => {
    try {
        const religion = await Religion.find().sort({ religion: 1 })
        if (!religion) {
            res.status(404)
            throw new Error('Religion not found')
        }
        res.status(200).json(religion)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


/**
 * Function Description: to get all religions
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getAllCaste = asyncHandler(async (req, res) => {
    try {
        const caste = await Caste.find().sort({ caste:1});
        if (!caste) {
            res.status(404)
            throw new Error('Caste not found')
        }
        res.status(200).json(caste)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

/**
 * Function Description: to get all religions
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getAllEducationtype = asyncHandler(async (req, res) => {
    try {
        const educationtype = await Educationtype.find()
        if (!educationtype) {
            res.status(404)
            throw new Error('educationtype not found')
        }
        res.status(200).json(educationtype)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


/**
 * Function Description: to get all religions
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getAllEducationlevel = asyncHandler(async (req, res) => {
    try {
        const educationlevel = await Educationlevel.find()
        if (!educationlevel) {
            res.status(404)
            throw new Error('educationlevel not found')
        }
        res.status(200).json(educationlevel)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

const getjobById=asyncHandler(async(req,res,next)=>{
    {
      const id=req.query.id

      const _jobs=await Job.findByID({_id:id})
      if (!_jobs || _jobs.length==0) {
        res.status(201).json({isSuccess:false, message:'Error occur...'});
      }
      else {
        res.status(200).json({isSuccess:true,jobdetail:_jobs}) }
    }
  })


  const createjob = asyncHandler(async(req,res,next)=>{
    {
        const {job}=req.body.data;
        
        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
            for (const currentObject of arrValidation) {

                let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);
                }  
            }
        }

        const _jobs=await Job.findOne({job:job})
        if(_jobs){
            res.status(200).json({isSuccess:false,message:job +" Already Exists"})
        }
        else{
            const _jobs= Job.create({
                job:job
            })
        }
     if(!job)
            
        {return res.status(200).json({isSuccess:false,message:'Invaild request Data'})}
      else{
        res.status(200).json({isSuccess:true,message:"Added successfully"})}
    
    }
})



const createotherlocation =asyncHandler(async(req,res)=>{
    {
        const {location}=req.body.data;
        // console.log(location)

          for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
            for (const currentObject of arrValidation) {

                let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);

                }
            }

        }  

        const _location=await OtherLocation.findOne({location:location})
        if(_location){
            res.status(200).json({isSuccess:false,message:"Already exists"})
        }
        else{
            const _location= await OtherLocation.create({
                location:location
            })
        }
        if(!location){
            return res.status(200).json({isSuccess:false,message:'Invalid request data'})
        }
        else{
            res.status(200).json({isSuccess:true,message:"Added successfully"})
        }
    }
})

const deletejob = asyncHandler(async(req,res)=>{

    try{
        const{id,job}=req.body

        const _job = await Job.findOne({job:job})

        if(job !=_job.job){
            return res.status(200).json({isSuccess:false,message:"The name you entered doesn’t match. Please try again."})
        }

        else{
            const jobs = await Job.deleteOne({_id:id})

            if(jobs){
                return res.status(200).json({isSuccess:true,message:"Deleted successfully"})
            }
        }
    }
    catch(err){
        console.log(err)
    }
})

const createQualification = asyncHandler(async(req,res,next)=>{
    {
        const {qualification}=req.body.data;
       
        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
            for (const currentObject of arrValidation) {

                let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);
                }  
            }
        }
        
        if(!qualification)
            
            {return res.status(200).json({isSuccess:false,message:'Invaild request Data'})}
            
        const _qualification=await Qualification.findOne({qualification:qualification})
        if(_qualification){
            res.status(200).json({isSuccess:false,message:qualification +" Already Exists"})
            return;
        }
        else{
            const _qualifications=Qualification.create({
                qualification:qualification
            })
            res.status(200).json({isSuccess:true,message:"Added successfully"})
            return;
        }
     
    //   else{
    //     res.status(200).json({isSuccess:true,message:"Add successfully"})
    //     return;
    //   }
    }
})


   const updateQualification= asyncHandler(async (req,res) => {
    
          try {
      
             const {id,qualification} = req.body.data
  
             for (const [key, value] of Object.entries(req.body.data)) {
              let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
              for (const currentObject of arrValidation) {
  
                  let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                  if (message != '') {
                      res.status(400)
                      console.log(message)
                      throw new Error(message);
                  }
                 
              }
  
          }
  
             const _qualifications =await Qualification.findOne({qualification:qualification})
             
             if(_qualifications){
              return res.status(200).json({isSuccess:false, message:qualification+" Already Exists"})
             }
    
          var updateAgainst = { _id:id};
          var newvalues = { $set: {qualification:qualification} };
      
          const _qualification = await Qualification.updateOne(updateAgainst,newvalues)
          console.log('update')
    
         const qualifications =  await Qualification.findById(id)
              if (_qualification) {
                  res.status(201).json({ isSuccess:true,message:"Saved successfully.",qualification:qualification})
              }
              else {
                  res.status(400)
                  throw new console.error('Error while updating teacher!!!');
              }
          }
          catch (err) {
             console.log(err)
          }
      })

    const deleteQualification= asyncHandler(async (req,res) => {
    
        try {
             const {id,qualification} = req.body
        
             const qualifications = await Qualification.findOne({qualification:qualification})

             if(qualification !=qualifications.qualification){
                res.status(200).json({isSuccess:false, message:"The name you entered doesn’t match. Please try again."})
             }

             else{
                const _qualification = await Qualification.deleteOne({_id:id})
    
                if (_qualification) {
                    res.status(201).json({isSuccess:true,message:"Deleted successfully..."})
                    return;
                }
                else {
                    res.status(400)
                    throw new console.error('Error while deleting Qualification!!!');
                }
             }
        }
        catch (err) {
           console.log(err)
        }
    })

   const createForeignCountry = asyncHandler(async(req,res,next)=>{
        {
            const {foreignCountry}=req.body.data;

            for (const [key, value] of Object.entries(req.body.data)) {
                let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
                for (const currentObject of arrValidation) {
    
                    let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                    if (message != '') {
                        res.status(400)
                        console.log(message)
                        throw new Error(message);
                    }
                   
                }
    
            }
           
            if(!foreignCountry)
                
                {return res.status(200).json({isSuccess:false,message:'Invaild request Data'})}
    
            const _foreignCountry=await ForeignCountry.findOne({foreignCountry:foreignCountry})

            if(_foreignCountry){

                res.status(200).json({isSuccess:false,message:foreignCountry +" Already Exists"})
                
            }
            else{
                const _foreignCountry=ForeignCountry.create({
                    foreignCountry:foreignCountry
                })
           
         
          if(_foreignCountry){
            res.status(200).json({isSuccess:true,message:"Added successfully"})
            
          }
        }
          
        }
    })
    
    const getForeignCountryById=asyncHandler(async(req,res)=>{
        {
            const foreignCountry=req.body.id;
            const _foreignCountry = await Qualification.findOne({_id:foreignCountry})
    
            console.log(_foreignCountry)
    
            if(!foreignCountry){
                res.status(401)
                throw new Error('not found')
            }
            else{
                res.status(200).json({isSuccess:true,foreignCountry:foreignCountry})
            }
        }
    })

    const deleteCountry= asyncHandler(async (req, res, next) => {
        
            try {
        
                 const {id,foreignCountry} = req.body;
                
                 const foreignCountrys = await ForeignCountry.findOne({foreignCountry:foreignCountry})

                 if(foreignCountry !=foreignCountrys.foreignCountry){
                    return res.status(200).json({isSuccess:false,message:"The name you entered doesn’t match. Please try again."})
                 }

                 const _foreignCountry = await ForeignCountry.deleteOne({_id:id})

                 if(_foreignCountry){
                    return res.status(200).json({isSuccess:true,message:"Deleted successfully"})
                 }
                 else{
                    res.status(200).json("Error")
                 }
            }
            catch (err) {
               console.log(err)
            }
        })

   const updateCountry= asyncHandler(async (req,res) => {
    
          try {
      
             const {id,foreignCountry} = req.body.data
  
             for (const [key, value] of Object.entries(req.body.data)) {
              let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
              for (const currentObject of arrValidation) {
  
                  let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                  if (message != '') {
                      res.status(400)
                      console.log(message)
                      throw new Error(message);
                  }
                 
              }
  
          }
  
             const __foreignCountry = await ForeignCountry.findOne({foreignCountry:foreignCountry})
  
             if(__foreignCountry){
              return res.status(200).json({isSuccess:false,message:foreignCountry + " Already Exists"})
             }
    
          var updateAgainst = { _id:id};
          var newvalues = { $set: {foreignCountry:foreignCountry} };
      
          const _foreignCountry = await ForeignCountry.updateOne(updateAgainst,newvalues)
          
    
         const ForeignCountries =  await ForeignCountry.findById(id)
              if (_foreignCountry) {
                  res.status(201).json({isSuccess:true,message:"Saved successfully.",foreignCountry:foreignCountry})
                  
              }
              
          }
          catch (err) {
             console.log(err)
          }
      
      })

    const updateState = asyncHandler(async(req,res)=>{
        try{
            const {id,name} =req.body.data;

            for (const [key, value] of Object.entries(req.body.data)) {
                let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
                for (const currentObject of arrValidation) {
    
                    let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                    if (message != '') {
                        res.status(400)
                        console.log(message)
                        throw new Error(message);
    
                    }
                }
    
            }  

            const _state = await States.findOne({name:name})
            if(_state){
                return res.send({isSuccess:false, message:name + " Already Exists.."})
            }

            var updateAgainst ={_id:id}
            var newvalues = {$set: {name:name}}

            const states = await States.updateOne(updateAgainst,newvalues)
          
            if(states){
                return res.status(200).json({isSuccess:true,message:"Saved successfully.",name:name})
            }
    }
        catch(err){
            console.log(err)
        }
    })


       const deleteCaste = asyncHandler(async(req,res,next)=>{
        try{
 
        const {id,caste}=req.body
        
        const castes = await Caste.findOne({caste:caste})

        if(caste !=castes.caste){
            res.status(200).json({isSuccess:false,message:"The name you entered doesn’t match. Please try again."})
        }

        else{
            const _caste = await Caste.deleteOne({_id:id})

            if(_caste){
                res.status(200).json({isSuccess:true,message:"Deleted successfully"})
            }
            else{
                res.status(200).json({message:"Error"})
            }
            
        }
    }
        catch(err)
           { console.log (err)}
        
    })

 const updateCaste = asyncHandler(async(req,res,next)=>{
                try{
                    const{id,caste}=req.body.data
     
                    for (const [key, value] of Object.entries(req.body.data)) {
                     let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
                     for (const currentObject of arrValidation) {
         
                         let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                         if (message != '') {
                             res.status(400)
                             console.log(message)
                             throw new Error(message);
                         }
                        
                     }
         
                 }
     
                    const _caste = await Caste.findOne({caste:caste})
     
                    if(_caste){
                      return res.status(200).json({isSuccess:false,message:caste + " Already Exists "})
                    }
                   
                    var updateAgainst = {_id: id}
                    var newvalues = {$set:{caste:caste}}
        
                    const _castes = await Caste.updateOne(updateAgainst,newvalues)
                 //    console.log(_castes)
        
                 //    const castes = await Caste.findById(id)
                    if(_castes){
                        return res.status(200).json({isSuccess:true,message:"Saved successfully.",caste:caste})
                    }
                    
                }
                catch(err){
                    console.log(err)
                }
            })

    const deleleState = asyncHandler(async(req,res)=>{
        try{
            const {id,name} = req.body

            const states = await States.findOne({name:name})
            if(name !=states.name){
                res.send({isSuccess:false, message:"The name you entered doesn’t match. Please try again."})
            }
            else{
                const _state = await States.deleteOne({_id:id})
                if(_state){
                    res.send({isSuccess:true, message:"Deleted successfully"})
                }
                else{
                    console.log("error")
                }
            }
            
        }
        catch (err) {
            console.log(err)
         }
    })

        
    const getByCasteName = asyncHandler(async(req,res)=>{

        const {caste}=req.query
       
        if(caste.length>2)
            {
            const _caste = await Caste.find({
                caste:{$regex:caste, $options:'i'}
        })
        if(_caste){
            res.status(200).json(_caste)
        }
        else{
            console.log("error")
        }
    }
    else if(caste.length=0){
        const _caste = await Caste.find({})
        res.status(200).json(_caste)
    }
    })

    const getByCountryName = asyncHandler(async(req,res)=>{

        const{foreignCountry}=req.query
        console.log(req.query)

        if(foreignCountry.length>2)
        {
            const _foreignCountry = await ForeignCountry.find({
                foreignCountry:{$regex:foreignCountry, $options:'i'}
            })
        if(_foreignCountry){
            res.status(200).json(_foreignCountry)
        }
        else{
            console.log('error')
        }
        }
        else if(foreignCountry.length=0){
            const _foreignCountry = await ForeignCountry.find({})
            res.status(200).json(_foreignCountry)
        }
    })

    const createMotherTongue = asyncHandler(async(req,res,next)=>{

     try{

        const {motherTongue}=req.body.data

        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
            for (const currentObject of arrValidation) {

                let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);

                }
            }

        }  
        
        if(!motherTongue){
          return res.status(200).json({isSuccess:false,message:"Invalid data"})
        }
        
        const _motherTongue = await MotherTongue.findOne({motherTongue:motherTongue})

        if(_motherTongue){
            return res.status(200).json({isSuccess:false,message:motherTongue + " Already Exists"})
        }

        const mothertongue = await MotherTongue.create({
            motherTongue:motherTongue
        })

        if(mothertongue){
            return res.status(200).json({isSuccess:true,message:"Added successfully"})
        }
    }
    catch(err){
        console.log(err)
    }
    })

    const getAllMotherTongue = asyncHandler(async(req,res,next)=>{


        const _motherTongue = await MotherTongue.find({})

        if(_motherTongue){
            return res.status(200).json(_motherTongue)
        }
    })

    const updateMotherTongue = asyncHandler(async(req,res,next)=>{

        try{ 

        const {id,motherTongue} = req.body.data

        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
            for (const currentObject of arrValidation) {

                let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);

                }
            }

        }

        const _motherTongue =  await MotherTongue.findOne({motherTongue:motherTongue})
        
        if(_motherTongue){
            return res.status(200).json({isSuccess:false,message:motherTongue + " Already Exists"})
        }
        
        var updateAgainst = {_id:id }
        var newvalues = {$set:{motherTongue:motherTongue}}

        const motherTongues = await MotherTongue.updateOne(updateAgainst,newvalues)
        
        if(motherTongues){
            return res.status(200).json({isSuccess:true,message:"Saved successfully.",motherTongue:motherTongue})
        }
    }
    catch(err){
        console.log(err)
    }
    })

    const deleteMotherTongue = asyncHandler(async(req,res,next)=>{
        try{

            
            const{id,motherTongue} = req.body

            const motherTongues = await MotherTongue.findOne({motherTongue:motherTongue})

            if(motherTongue !=motherTongues.motherTongue){
                return res.status(200).json({isSuccess:false,message:"The name you entered doesn’t match. Please try again."})
            }

            else{
                const _motherTongue = await MotherTongue.deleteOne({_id:id})

                if(_motherTongue){
                    return res.status(200).json({isSuccess:true,message:"Deleted successfully"})
                }
            }
        }
        catch(err){
            console.log(err)
        }
    })


    const getByMotherTongueName = asyncHandler (async(req,res,next)=>{

        const {motherTongue} = req.query

        if(motherTongue.length>2){

            const _motherTongue = await MotherTongue.find({
                motherTongue:{$regex:motherTongue,$options:'i'}
            })

            if(_motherTongue){
                res.status(200).json(_motherTongue)
            }
            else{
                console.log("Error")
            }
        }
        else if(motherTongue.length=0){
            const _motherTongue = await MotherTongue.find({})
            res.status(200).json(_motherTongue)
        }
    })

    const deleteotherlocation=asyncHandler(async(req,res)=>{
        try{
            const {location,id}=req.body
    
            const Location=await OtherLocation.findOne({location:location})
            if(location !=Location.location){
                res.status(200).json({isSuccess:false,message:"The name you entered doesn’t match. Please try again."})
            }
             const   otherlocations=await OtherLocation.deleteOne({_id:id})
                
                if (otherlocations){
                    res.status(200).json({isSuccess:true,message:"Deleted successfully"})
                }
                else {
                    res.status(400)
                    throw new console.error('Error while deleting!!!');
                }   
        }
        catch(err){
            console.log(err)
        }
    })

    const getJobByName=asyncHandler(async(req,res)=>{
          
        const {job}=req.query
    
        if (job.length>2){
    
        const _jobs=await Job.find({
            job:{$regex:job,  $options: 'i'}
        })
        if(_jobs)
        {
            res.status(200).json(_jobs)
        }
        else{
            console.log('error occur')
        }
    }
    else if (job.length=0){
        const _jobs=await Job.find({})
        res.status(200).json(_jobs)
    }
    })

    
   const updateJob= asyncHandler(async (req,res) => {
            try {
               const {id,job} = req.body.data
  
               for (const [key, value] of Object.entries(req.body.data)) {
                  let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
                  for (const currentObject of arrValidation) {
      
                      let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                      if (message != '') {
                          res.status(400)
                          console.log(message)
                          throw new Error(message);
                      }  
                  }
              }
    
            const _jobs=await Job.findOne({job:job})
            if(_jobs){
                res.status(200).json({isSuccess:false,message:job +" Already Exists"})
            }  
        else{
            var updateAgainst = { _id: id};
            var newvalues = { $set: {job:job} };
            const _job= await Job.updateOne(updateAgainst,newvalues)
           
                if (_job) {
                    res.status(201).json({isSuccess:true,message:"Saved successfully.",job:job})
                    
                }
                else {
                    res.status(400)
                    throw new console.error('Error while updating!!!');
                }
            }
        }
            catch (err) {
               console.log(err)
            }
        
        }) 
    
    
        const getStateByName = asyncHandler(async(req,res)=>{
            const {name} = req.query
            console.log(req.query)
    
            if(name.length>1){
                const _state = await States.find({
                    name:{$regex:name, $options:'i'}
                })
    
                if(_state){
                  res.status(200).json(_state)
                }
                else{
                    console.log("error")
                }
            }
    
            else
                if(name.length=0){
                    const _state=await States.find({})
                    res.send({_state})
            }
            
        })

        const createcaste = asyncHandler(async(req,res,naxt)=>{
                      try{
                          const{caste}=req.body.data
        
                            for (const [key, value] of Object.entries(req.body.data)) {
                                              let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
                                              for (const currentObject of arrValidation) {
                                  
                                                  let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                                                  if (message != '') {
                                                      res.status(400)
                                                      console.log(message)
                                                      throw new Error(message);
                                                  }
                                                 
                                              }
                                  
                                          }
              
                          if(!caste){
                              return res.status(200).json({isSuccess:false,message:"Invalid data"})
                          }
              
                          const  _caste=await Caste.findOne({caste:caste})
                          
                          if(_caste ){
                              return res.status(200).json({isSuccess:false,message:caste + "  Already Exists"})
                          }
                          else{
                              const _caste = await Caste.create({
                                  caste:caste
                              })
                          
                          if(_caste){
                              res.status(200).json({isSuccess:true,message:"Added successfully"})
                          }
                      }
                  }
                      catch(err){
                          console.log(err)
                      }
                  })

       const createdistricts = asyncHandler(async(req,res,next)=>{
    {
        const {district}=req.body.data;

              for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
            for (const currentObject of arrValidation) {

                let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);
                }
            }
        } 

         if(!district)
            
        {return res.status(201).json({isSuccess:false,message:'Invaild request Data'})}
        // console.log(district)

        const _district=await District.findOne({district:district})
        if(_district){
            res.status(200).json({isSuccess:false,message:district +" Already Exists"})
        }

        else{
            const _district= await District.create({
                district:district
            })
             if (_district){
        res.status(200).json({isSuccess:true,message:"Added successfully"})}
        }
    
    
     
    
    }


})

 const getByReligionName = asyncHandler(async(req,res)=>{
       
            const{religion} = req.query
            console.log(req.query)

        if (religion.length > 2) {
            const _religion = await Religion.find({
                religion:{$regex:religion, $options:'i'}
               })
                if(_religion){
                    res.status(201).json(_religion)
                }
                else{
                    console.log("Error")
                }
            }
            else if(religion.length=0){
                const _religion = await Religion.find({})
                res.status(200).json(_religion)
            }
    })

      const createreligion= asyncHandler(async(req,res,next)=>{
                    
              const{religion}=req.body.data;

                 for (const [key, value] of Object.entries(req.body.data)) {
                 let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
                   for (const currentObject of arrValidation) {

                let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);
                }
            }
        } 
                            if(!religion){
                                return res.status(200).json({isSuccess:false,message:'Invalid Required Data'})
                            }
                    
                          const _religion = await Religion.findOne({
                            religion:religion})
                    
                          if (_religion){
                            res.status(200).json({isSuccess:false,message:religion+" Already Exists"})
                          }
                          else{
                            const _religion = await Religion.create({
                                religion:religion
                            })
                        
                        if(_religion){
                            res.status(200).json({isSuccess:true,message:'Added Successfully'})
                        }
                    }
                        })
          
                        
  const updatereligion = asyncHandler(async(req,res,next)=>{
     try{
             const {id,religion} = req.body.data;

             for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
            for (const currentObject of arrValidation) {

                let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);
                }
            }
        } 
                 const _religion = await Religion.findOne({religion:religion})
                            
                                    if(_religion){
                                        res.status(201).json({isSuccess:false,message:religion+" Already Exists"})
                                    }
                            
                                    var updateAgainst = {_id:id};
                                    var newvalues = {$set: {religion:religion}}
                            
                                        const religions = await Religion.updateOne(updateAgainst,newvalues)
                                        if(religions){
                                            res.status(200).json({isSuccess:true,message:'Saved Successfully'})
                                        }
                                      if(! religions){
                                        res.status(201).json({isSuccess:false,message:"Invalid required data"})
                                    }
                                    }
                            
                                    catch(err){
                                    console.log(err)}
                                })
          
                       const deletereligion = asyncHandler(async(req,res,next)=>{
                                  try{
                                      const {id,religion} = req.body;
                          
                                      const _religion = await Religion.findOne({religion:religion})
                        
                                      if(religion !=_religion.religion){
                                          res.status(200).json({isSuccess:false,message:"The name you entered doesn't match. Please try again."})
                                          }
                          
                                          else{
                                          const religions = await Religion.deleteOne({_id:id})
                          
                                          if(religions){
                                              res.status(200).json({isSuccess:true,message:'Deleted Successfully'})
                                          }
                                          }
                                      }
                                      catch(err){
                                          console.log(err)
                                      }
                                  })
          
  const updateDistrict = asyncHandler(async (req,res) => {

    try{
        console.log('mani')
        const {id,district} = req.body.data
        console.log(req.body.data)

              for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
            for (const currentObject of arrValidation) {

                let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);
                }
            }
        } 
        
        const _dist=await District.findOne({district:district})
        if(_dist){
            return res.status(200).json({isSuccess:false,message:district +" Already Exists"})
        }

        var updateAgainst = { _id:id};
        var newvalues = { $set: {district:district}};

        const _district = await District.updateOne(updateAgainst,newvalues)
        
        const districts = await District.findById(id)
        if (_district){
            return res.status(201).json({isSuccess:true,message:"Saved successfully..."})
        }
        if(!district){
            res.status(200).json({isSuccess:false,message:"Invalid Required Data"})
        }
        else {
            res.status(400)
            throw new console.error('Error while updating district!!!');
        }
    }
    catch (err){
        console.log(err)
    }
  })

  const deleteDistrict = asyncHandler(async (req,res) => {

    try{
        console.log("hiiii")
        const{id,district} = req.body
        console.log(req.body)

        const _district = await District.findOne({district})
        console.log(_district)

        if (district != _district.district) {
            res.status(201).json({isSuccess:false,message:"The name you entered doesn't match. Please try again."})
        }
        else {
            const district = await District.deleteOne({_id:id})
           
            if(district){
                res.status(200).json({isSuccess:true,message:'Deleted successfully'})
            }
        }
    }
    catch (err){
        console.log(err)
    }
  })

  const getByDistrictName = asyncHandler (async(req,res,next)=>{

    const {district} = req.query

    if(district.length>2){

        const _district = await District.find({
            district:{$regex:district, $options:'i'}
        })

        if(_district){
            res.status(200).json(_district)
        }
        else{
            console.log("Error")
        }
    }
    else if(district.length=0){
        const _district = await District.find({})
        res.status(200).json(_district)
    }
})

const getLocationByName=asyncHandler(async(req,res)=>{

        const {location}=req.query

          if (location.length > 2) {
        const _location = await OtherLocation.find({
            location: { $regex: location, $options: 'i' }
        });

        if(_location)
        {
            res.status(200).json(_location)
        }
        else{
            console.log('error occur')
        }
    }
    else if (location.length=0){
        const _location=await OtherLocation.find({})
        res.status(200).json(_location)
    }
    })

        const updateOtherlocation= asyncHandler(async (req,res) => {
          try {
             const {id,location} = req.body.data

               for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'Configuration', fieldName: key })
            for (const currentObject of arrValidation) {

                let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);
                }
            }
        }
        
          const _location=await OtherLocation.findOne({location:location})
          if(_location){
              res.status(200).json({isSuccess:false,message:location +" Already Exists"})
          }  
      else{
          var updateAgainst = { _id: id};
          var newvalues = { $set: {location:location} };
          const _location= await OtherLocation.updateOne(updateAgainst,newvalues)
         
              if (_location) {
                  res.status(201).json({isSuccess:true,message:"Updated successfully...",location:location})
                  
              }
              else {
                  res.status(400)
                  throw new console.error('Error while updating!!!');
              }
          }
      }
          catch (err) {
             console.log(err)
          }
      
      }) 





                  
module.exports = {
    createState,
    getAllStates,
    getAllStars,
    getAllRasi,
    getAllDistrictsByState,
    getAllJobs,
    getAllQualifications,
    getAllConfigs,
    getAllReligions,
    getAllCaste,
    getAllEducationtype,
    getAllEducationlevel,
    getAllLocation,
    getAllForeignCountries,
    getQualificationByName,
    createQualification,
    updateQualification,
    deleteQualification,
    createForeignCountry,
    getForeignCountryById,
    deleteCountry,
    updateCountry,
    getjobById,
    createjob,
    createQualification,
    deletejob,
    createdistricts,
    createotherlocation,
    deleteCaste,
    updateCaste,
    getByCasteName,
    getByCountryName,
    createMotherTongue,
    getAllMotherTongue,
    updateMotherTongue,
    deleteMotherTongue,
    getByMotherTongueName,
    deleleState,
    updateState,
    deleteotherlocation,
    updateJob,
    getJobByName,
    getStateByName,
    createcaste,
    createreligion,
    updatereligion,
    deletereligion,
    getByReligionName,
    updateDistrict,
    deleteDistrict,
    getByDistrictName,
    getLocationByName,
    updateOtherlocation
}
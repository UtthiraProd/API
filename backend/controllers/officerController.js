const asyncHandler=require('express-async-handler')
const officer= require('../models/officerModels')

const createofficer= asyncHandler(async(req,res,next)=>{
 
    const{name,branch,age,gender,nationality}=req.body.data;
    console.log(req.body.data)
 if(!name || !branch || !age || !gender || !nationality)
        
    {return res.status(400).json({message:'Invaild request Data'})}
    
      const _officer =await officer.create({
        name:name,
        branch:branch,
        age:age,
        gender:gender,
        nationality:nationality
      })
      if(_officer)
        res.status(201).json({message:'Created Successfully...!!!'})
  else
  console.log('error while creating')
})

    
const getAllOfficer= asyncHandler(async (req, res, next) => {

  {
  const _officer = await  officer.find({})

      if (_officer) {
        res.status(200).json({isSuccess:true,officerlist:_officer});
      }
      else {
        res.status(201).json({isSuccess:false,message:'Error occur...'})
          
      }
    }})

    const getOfficeById=asyncHandler(async(req,res,next)=>{
      {
        const id=req.query.id

        const _officer=await officer.findByID({_id:id})
        if (!_officer || _officer.length==0) {
          res.status(201).json({isSuccess:false, message:'Error occur...'});
        }
        else {
          res.status(200).json({isSuccess:true,officerdetail:_officer})
            
        }

      }
    })

  
  
module.exports={createofficer,getAllOfficer,getOfficeById}
const asyncHandler =require('express-async-handler')
const PUMarriageProfile = require ('../../models/PUMarriageProfileModel')
const errorfunction = require('../../controllers/commonController')
const Config = require ('../../models/configModel')
const {getImageByContainerAndBlob} = require('../../azureservice/fileUploadService')
const sharp = require('sharp');
const User = require('../../models/userModel')
const UserRole = require('../../models/userRoleModel')
const userBrokerRole = "Admin"


const getallPUprofile = asyncHandler(async(req,res)=>{
    try{

      const user = await User.findById(req.user.id)
      
               if (!user) {
                  res.status(401)
                  throw new Error('User not found')
              }
              else if (user.isLoggedin !== true) {
                  res.status(404)
                  throw new Error('User not logged in')
              }
      
              const _userRole = await UserRole.findOne({ _id: user.roleId })
      
              if (_userRole.name !== userBrokerRole) {
                  res.status(404)
                  throw new error("error")
              }

       let _skip = 1;
       let  _pagesize = 10;

       const {name, sex, religion, caste,brokerID, skip, pagesize} = req.body
       let asignCount = parseInt(brokerID)

       if(pagesize){

        if (skip == 1){
          _skip = skip-1
          _pagesize = pagesize
        }
        else{
          _skip = ((skip-1)*pagesize)
          _pagesize = pagesize
        }
        if (_pagesize > 10){
          _pagesize = 10
        }
       }

    const AssignBrolerLimit = await Config.findOne ({ key : "AssignBrokerLimit" })
      
    const configPUbrokerLimit = parseInt(AssignBrolerLimit.value)

    let query = {status:'New',$expr: {
        $lt: [{ $size: "$brokerID" }, configPUbrokerLimit]
      }};


    if(configPUbrokerLimit){
    
     if (name && name.trim() !== '' && name.length > 3) {
          query.name = { $regex: name, $options: 'i' };
        }
        if (sex) {
            query.sex = sex;
        }
        if (religion) {
            query.religion = religion;
        }
        if (caste) {
            query.caste = caste;
        }

        if (asignCount !== undefined){
          const BrokerCount = Number(asignCount);

        if (!isNaN(BrokerCount)) {
          // if (BrokerCount === 0){
          //   query.asignCount = { $size: 0 }
          // }
          // else{
            query.$expr = {
              $eq: [ { $size: "$brokerID" },BrokerCount ]
            }
          // }
        }
      }

      const _profile = await PUMarriageProfile.find({status:"New"}).find(query).skip(_skip).limit(_pagesize);

        if(_profile){
            _profile.sort((a, b) => a.brokerID.length - b.brokerID.length);
        }

        else{
            console.log("Error occur")
        }


      const _totalRecord = await PUMarriageProfile.find(query).countDocuments()
      
      const imageList = await Promise.all(
          _profile.map(async (doc) => {
        try {
            const image = doc.imageUrls|| [];
            let imageName = '';
                                   
        if (image?.length > 0) {

          const result = image.find((item) => item.isProfile === true);
          imageName = result?.name || image[0].name;
          }

        if (!imageName) {
            return { profileID: doc.profileID, imageBase64: null };
          }
                                   
      const container = doc.container;

      const blobResponse = await getImageByContainerAndBlob(container.toLowerCase(), imageName);
                  
      if (!blobResponse || !blobResponse.readableStreamBody) { 
          return { profileID: doc.profileID, imageBase64: null };
      }        
                                       
      let imageToShow;
      imageToShow =  blobResponse.readableStreamBody.pipe(sharp())
                                   
      const blurredBuffer = await streamToBuffer(imageToShow);
                                   
      const base64Image = `data:image/jpeg;base64,${blurredBuffer.toString('base64')}`;
                                      
      return {
          _id: doc._id,
          imageBase64: base64Image,
        };
                                      
      }
      catch (err) {
          console.error(`Error processing image for profile ${doc._id}:`, err);
          return {  _id: doc._id, imageBase64: null };
        }
      })
      )

       res.status(200).json({profile:_profile,
        images: imageList,
        totalPages: Math.ceil(_totalRecord / _pagesize),
        totalRecords: _totalRecord,
        brokerAssigend:configPUbrokerLimit

      })
      
      }
    }

  catch (err) {
    console.log(err)
    // errorfunction.errorHandler(err, req, res);
  }
})

const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

const getPUprofileByID = asyncHandler(async(req,res)=>{

  try{

      const user = await User.findById(req.user.id)
      
               if (!user) {
                  res.status(401)
                  throw new Error('User not found')
              }
              else if (user.isLoggedin !== true) {
                  res.status(404)
                  throw new Error('User not logged in')
              }
      
              const _userRole = await UserRole.findOne({ _id: user.roleId })
      
              if (_userRole.name !== userBrokerRole) {
                  res.status(404)
                  throw new error("error")
              }
              
            const {id}=req.query

        const _profile =await PUMarriageProfile.findById({_id:id})
         if(_profile){
            res.status(201).json({isSuccess:true,PUprofileDetail:_profile})
        }
        else{
            console.log("Error occur")  
        }
  }
  catch(err){
    // errorfunction.errorHandler(err,req,res)
    console.log(err)
  }
})


module.exports= {getallPUprofile,
  getPUprofileByID}
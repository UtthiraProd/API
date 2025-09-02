const asyncHandler = require('express-async-handler')
const Broker = require('../../models/brokerModel')
const User = require('../../models/userModel')
const UserRole = require('../../models/userRoleModel')
const ValidationConfig = require('../../models/validationConfigModel')
const { getBrokerimageUrl } = require('../../azureservice/commonService');
const { errorfunction, fieldValidationfunction } = require('../commonController');
const PublicUserMarriageProfile  = require('../../models/PUMarriageProfileModel')
const PUMarriageProfile = require('../../models/PUMarriageProfileModel')
const MarriageProfile = require('../../models/marriageProfileModel')
const MatchingProfiles = require('../../models/matchProfileModel')
const {getImageByContainerAndBlob} = require('../../azureservice/fileUploadService')
const sharp = require('sharp');
// const FORM_NAME = 'AddEditBroker'
const userBrokerRole = "Broker"
// const userBrokerRoles = "Admin"


/**
 * Function Description: Get broker details for an id
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: Deepika, 27 May 2025
 */

const getBrokerDetailById = asyncHandler(async (req, res) => {
    
    try {
        let _brokerId
        // get user using the id in the JWT
        const user = await User.findById(req.user.id)
        const { brokerId } = req.body

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        else if(user.isLoggedin !== true)
        {
           res.status(404)
           throw new Error('User not logged in')
        }

        const isActive = await Broker.findOne({userId:user._id})

        if(isActive.isActive !== true ){
           throw new Error('Broker isActive is false')
        }

        if (brokerId == 'null' || !brokerId || (brokerId == null)) {
            const _userRole = await UserRole.findOne({ _id: user.roleId });

            if (_userRole.name == userBrokerRole) {
                let _brokerDetail = await Broker.findOne({ userId: req.user.id });
                _brokerId = _brokerDetail._id

            }
        }
        else {
            _brokerId = brokerId
        }

        const broker = await Broker.findById({ _id: _brokerId }, { profileIds: 0 })

        if (!broker) {
            res.status(404)
            throw new Error('Broker not found')
        }

        if (broker.userId != req.user.id) {
            res.status(401)
            throw new Error('Unauthorized access')
        }

        let imageurl = ""

        if (broker.imageName != "")
            imageurl = await getBrokerimageUrl(_brokerId)
        res.status(200).json({ "brokerDetails": broker, "imageUrl": imageurl, "email": user.email })
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})

const topUpPlanBroker = asyncHandler(async (req, res) => {

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            res.status(401).json({ isSuccess: false, message: 'User not found' });
            return;
        }
        else if(user.isLoggedin !== true)
        {
           res.status(404)
           throw new Error('User not logged in')
        }

        const isActive = await Broker.findOne({userId:user._id})

        if(isActive.isActive !== true ){
           throw new Error('Broker isActive is false')
        }

        let { id, balanceAmount } = req.body.data

        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'TopUpPlanBroker', fieldName: key })
            for (const currentObject of arrValidation) {

                let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);
                }
            }
        }

        const _userRole = await UserRole.findOne({ _id: user.roleId })

        if (_userRole.name !== userBrokerRole) {
            res.status(404)
            throw new error("error")
        }

        if (!balanceAmount) {
            return res.status(200).json({ isSuccess: false, message: "Please enter the amount" })
        }

        const _broker = await Broker.updateOne(
            { _id: id },
            { $inc: { balanceAmount: balanceAmount } },

        )

        if (_broker) {
            return res.status(200).json({ isSuccess: true, message: "Top-up done successfully" })
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

const getBrokerApproveProfileList = asyncHandler(async (req, res) => {

    try {
       
        const user = await User.findById(req.user.id)

         if (!user) {
            return res.status(401).json({ isSuccess: false, message: 'User not found' });
        }

        if (user.isLoggedin !== true) {
            res.status(404);
            throw new Error('User not logged in');
        }

        const broker = await Broker.findOne({ userId: user._id });

        if (!broker || broker.isActive !== true) {
            throw new Error('Broker is not active or not found');
        }

        const brokerId = broker._id;

        const { skip, pagesize } = req.body;

        let _skip = 0;
        let _pagesize = 6;

        if (pagesize) {
            if (skip == 1) {
                _skip = skip - 1;
                _pagesize = pagesize;
            } else {
                _skip = (skip - 1) * pagesize;
                _pagesize = pagesize;
            }

            if (_pagesize > 7) {
                _pagesize = 6;
            }
        }

        const userRole = await UserRole.findOne({ _id: user.roleId });

        if (userRole.name !== userBrokerRole) {
            res.status(404);
            throw new Error('User role does not match broker');
        }

        const registeredProfiles = await MarriageProfile.find({ brokerId: brokerId }).select('publicProfId');
        const registeredProfileIds = registeredProfiles.map(profile => profile.publicProfId?.toString());

        const ApproveProfiles = await PublicUserMarriageProfile.find({
            'brokerID._id': brokerId,
            _id: { $nin: registeredProfileIds }  /// dont get alreadyb reg ID 
        })
        .skip(_skip)
        .limit(_pagesize);

        const _totalRecord = await PublicUserMarriageProfile.countDocuments({
            'brokerID._id': brokerId,
            _id: { $nin: registeredProfileIds }
        });

            
               const imageList = await Promise.all(
                               ApproveProfiles.map(async (doc) => {
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
                                
                                 } catch (err) {
                                   console.error(`Error processing image for profile ${doc._id}:`, err);
                                   return {  _id: doc._id, imageBase64: null };
                                 }
                               })
                            )
                                
                 res.status(200).json({ApproveProfiles:ApproveProfiles,
                                       imageList: imageList,
                                       totalRecourd: Math.ceil(_totalRecord / _pagesize),
                                       totalRecord:_totalRecord
                                   });

    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
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

const BrokerApproveDetailsById = asyncHandler(async(req,res)=>{
    try{
        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(401).json({ isSuccess: false, message: 'User not found' });
            return;
        }
        else if(user.isLoggedin !== true)
        {
           res.status(404)
           throw new Error('User not logged in')
        }

        const isActive = await Broker.findOne({userId:user._id})

        if(isActive.isActive !== true ){
           throw new Error('Broker isActive is false')
        }
        
        const {profileId,brokerId} = req.body

        const _PUMerriageprofile = await PublicUserMarriageProfile.findOne({ _id: profileId })
        
        if(!_PUMerriageprofile){
            return res.status(404).json({ isSuccess: false,message:"Profile details not found"})
        }
      
        return res.status(200).json({isSuccess:true,Profiledetails:_PUMerriageprofile})
        
        
    }
    catch (err){
        errorfunction.errorHandler(err,res,req)
    }
})

const PUProfileRegisterInMarriageProfileTable = asyncHandler(async (req, res) => {
    try {
       
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(401).json({ isSuccess: false, message: 'User not found' })
        }
         else if(user.isLoggedin !== true)
        {
            res.status(404)
            throw new Error('User not logged in')
        }

        const { profileId,brokerId } = req.body

        const publicUser = await PUMarriageProfile.findOne({ _id:profileId })

        if (!publicUser) {
            return res.status(404).json({ isSuccess: false, message: 'Public user profile not found' })
        }
 
        let  _brokerId

           if (!brokerId) {
                    const _userRole = await UserRole.findOne({ _id: user.roleId });

                    if (_userRole.name == userBrokerRole) {
                        let _brokerDetail = await Broker.findOne({ userId: req.user.id });
                        _brokerId = _brokerDetail._id
                    }
                }
        
                const _publicUser = await MarriageProfile.findOne({ publicProfId: publicUser._id, brokerId: _brokerId })
               

        if (_publicUser) {
            return res.status(201).json({ isSuccess: false, message: 'Profile already registered with this broker' })
        }

          let profileIds = await MarriageProfile.find({ brokerId: _brokerId })

          let maxProfileId;
        
                if (profileIds.length == 0)
                    maxProfileId = 1
                else {
                    maxProfileId = profileIds.reduce((max, profile) => {
                        return profile.profileID > max ? profile.profileID : max;
                    }, -Infinity);
                    maxProfileId = maxProfileId + 1
                }

        const publicUserObj = publicUser.toObject()
        delete publicUserObj._id

        const newMarriageProfile = new MarriageProfile({
            ...publicUserObj,
            brokerId: _brokerId,
            publicProfId: publicUser._id,
            profileID: maxProfileId,
        })
        await newMarriageProfile.save()


        res.status(200).json({ isSuccess: true, message: 'Profile registered successfully' })
    } catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

const RejectProfile = asyncHandler(async(req,res)=>{
    try{
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(401).json({ isSuccess: false, message: 'User not found' })
        }
         else if(user.isLoggedin !== true)
        {
            res.status(404)
            throw new Error('User not logged in')
        }
        const {profileId,brokerId } = req.body
        let  _brokerId

           if (!brokerId) {
                    const _userRole = await UserRole.findOne({ _id: user.roleId });

                    if (_userRole.name == !userBrokerRole) {
                        return
                    }
                }
            
                let _brokerDetail = await Broker.findOne({ userId: req.user.id });
                _brokerId = _brokerDetail._id

        const publicUser = await PUMarriageProfile.findOne({ _id:profileId })

        if (!publicUser) {
            return res.status(404).json({ isSuccess: false, message: 'Public user profile not found' })
        }

const PURejectprofile = await PUMarriageProfile.updateOne(
    {"_id" :profileId },
    { $pull: { "brokerID":{"_id": _brokerId} } }
);
        if (PURejectprofile){
            return res.status(201).json({isSuccess:true, message:'Rejected successfully'})
        }
 
        
    } catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

const getMatchProfile = asyncHandler(async(req,res)=>{
        
    try{

        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(401).json({ isSuccess: false, message: 'User not found' })
        }
         else if(user.isLoggedin !== true)
        {
            res.status(404)
            throw new Error('User not logged in')
        }

         let _skip = 1;
        let _pagesize = 8;

           const {matchProfile,skip,pagesize } = req.body

             if (pagesize) {

            if (skip == 1) {
                _skip = skip - 1
                _pagesize = pagesize
            }
            else {
                _skip = ((skip - 1) * pagesize)
                _pagesize = pagesize
            }
    
            if (_pagesize > 8) {
                _pagesize = 8;
            }
        }

           const ProfileMatch = await MarriageProfile.findOne({_id:matchProfile})

            if (!ProfileMatch) {
            return res.status(404).json({ isSuccess: false, message: 'Profile not found' })
           }
            let brokerId = ProfileMatch.brokerId
            let caste = ProfileMatch.caste
            let religion = ProfileMatch.religion
            const oppositeSex = ProfileMatch.sex.toLowerCase() === 'female' ? 'Male' : 'Female';

        let matchingMarriageProfiles = []
        let totalRecords = 0;

        
        if(ProfileMatch.star===!""){

             const starValue = ProfileMatch.star?.trim();
             const StarMatch = await MatchingProfiles.findOne({ star: starValue },'match.matchstar');

             if (!StarMatch) {
              return res.status(404).json({ error: `No matching star found for ${ProfileMatch.star}` });
             }
             const matchedStars = StarMatch.match.map(m => m.matchstar);


               matchingMarriageProfiles = await MarriageProfile.find({
               star: { $in: matchedStars },
               brokerId:brokerId,
               caste:caste,
               religion:religion,
               sex:oppositeSex
           }).skip(_skip).limit(_pagesize);

            totalRecords = await MarriageProfile.countDocuments({
            star: { $in: matchedStars },
            brokerId: brokerId,
            caste: caste,
            religion: religion,
            sex: oppositeSex,
      });
        }

        else{
    
               matchingMarriageProfiles = await MarriageProfile.find({
               religion:religion,
               brokerId:brokerId,
               caste:caste,
               sex:oppositeSex
        }).skip(_skip).limit(_pagesize);

             totalRecords = await MarriageProfile.countDocuments({
             brokerId: brokerId,
             caste: caste,
             religion: religion,
             sex: oppositeSex,
      });

        }
        if (matchingMarriageProfiles.length === 0) {
            return res.status(404).json({ isSuccess: false, message: 'No matching profiles found' });
        }
         

                 const imageList = await Promise.all(
                   matchingMarriageProfiles.map(async (doc) => {
                     try {
                       const image = doc.imageUrls;
                       let imageName = '';
                 
                       if (image?.length > 0) {
                         const result = image.find((item) => item.isProfile === true);
                         imageName = result?.name || image[0].name;
                       }
                 
                       if (!imageName) {
                         return { profileID: doc.profileID, imageBase64: null };
                       }
                 
                       const broker = await Broker.findOne({ _id: brokerId });
                 
                       const blobResponse = await getImageByContainerAndBlob(broker.container, imageName);
                 
                       if (!blobResponse || !blobResponse.readableStreamBody) {
                         return { profileID: doc.profileID, imageBase64: null };
                       }
                 
                    //    console.log(imageName,'Success image...')
         
                     
                       let imageToShow;
                           imageToShow =  blobResponse.readableStreamBody.pipe(sharp())
                 
                       const blurredBuffer = await streamToBuffer(imageToShow);
                 
                       const base64Image = `data:image/jpeg;base64,${blurredBuffer.toString('base64')}`;
                       return {
                         profileID: doc.profileID,
                         imageBase64: base64Image,
                       };

                     } catch (err) {
                       console.error(`Error processing image for profile ${doc._id}:`, err);
                       return { profileID: doc.profileID, imageBase64: null };
                     }
                   })
                 );
             
         res.json({ success: true,MatchProfile: matchingMarriageProfiles,images: imageList,
            //  totalPages: Math.ceil(totalRecords / _pagesize),
            //  totalRecords,
            totalPlanRecourd: Math.ceil(totalRecords/ _pagesize), totalPlanRecourds: totalRecords
          });
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

const BrokerToBroker = asyncHandler(async(req,res) =>{
    // console.log('mani')
    try{
 
   const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(401).json({ isSuccess: false, message: 'User not found' })
        }

         else if(user.isLoggedin !== true)
        {
            res.status(404)
            throw new Error('User not logged in')
        }
    
        const brok = await Broker.findOne({ userId: user._id })

            let brokerId = brok._id

        const broker = await Broker.findById({_id:brokerId})

    //    console.log("manii123",broker)

        const fetchBroker = broker.brokerTobroker

        const ids = fetchBroker.map(item => item._id);

        const brokerDetails = await Broker.find({ _id: { $in: ids } });
        // console.log(brokerDetails)

            const brokImageList = await Promise.all(
              await brokerDetails.map(async (doc) => {
                try{
                      const image = doc.imageName;
        
                      const blobResponse = await getImageByContainerAndBlob(doc.container, image);
        
                 if (!blobResponse || !blobResponse.readableStreamBody) {
                    return { _id: doc._id, imageBase64: null };
                  }         
                      let imageToShow;
                      imageToShow = blobResponse.readableStreamBody.pipe(sharp())
                    
                      const blurredBuffer = await streamToBuffer(imageToShow);
                      
                      const base64Image = `data:image/jpeg;base64,${blurredBuffer.toString('base64')}`;
        
                  return {
                    _id: doc._id,
                    imageBase64: base64Image,
                  };
                  
                }
                catch (err) {
                  console.error(`Error processing image for profile ${doc._id}:`, err);
                  return { profileID: doc.profileID, imageBase64: null };
                }
              })
            )
        
        res.status(200).json({
            BrokerToBroker:brokerDetails,
            brokImageList: brokImageList,
        })
        console.log(brokImageList)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

const searchProfileBrokToBrok = asyncHandler(async (req, res) => {
    
    try {
        const user = await User.findById(req.user.id)
        
        let _skip = 1;
        let _pagesize = 10;

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
         else if(user.isLoggedin !== true)
        {
           res.status(404)
           throw new Error('User not logged in')
        }

        const isActive = await Broker.findOne({userId:user._id})
      
        if(isActive.isActive !== true ){
            throw new Error('Broker isActive is false')
        }

        
        const { name,sex, religion, caste, job, ageFrom, ageTo,qualification,
            searchBrokerId, dashboardFilter, skip, pagesize,brokerId } = req.body

        let {profileID} =req.body

        if (pagesize) {

            if (skip == 1) {
                _skip = skip - 1
                _pagesize = pagesize
            }
            else {
                _skip = ((skip - 1) * pagesize)
                _pagesize = pagesize
            }

            if (_pagesize > 10) {
                _pagesize = 10;
            }

        }

        const currentDateForFrom = new Date();
        currentDateForFrom.setFullYear(currentDateForFrom.getFullYear() - ageFrom);

        // Calculate the date 30 years ago from the current date
        const currentDateForTo = new Date();
        currentDateForTo.setFullYear(currentDateForTo.getFullYear() - ageTo);
        let query = {status:"New"};
        let _brokerId = brokerId

        if (!_brokerId) {
            const _userRole = await UserRole.findOne({ _id: user.roleId });
        
            if (_userRole.name == userBrokerRole) {
                let _brokerDetail = await Broker.findOne({ userId: req.user.id });

                _brokerId = _brokerDetail._id
            }
        }
        else {
            _brokerId = brokerId
        }
        query.brokerId = _brokerId

        if (name && name.trim() !== '' && name.length > 2) {
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
        if (job) {
            query.job = job;
        }
         if (qualification) {
            query.qualification = qualification;
        }
        if (profileID && typeof profileID === "string") {
           profileID = profileID.replace(/^(UM|UF)/, '');
           query.profileID = profileID;
        }           

        if (ageFrom) {
            query.DOB = { $lte: currentDateForFrom, $gte: currentDateForTo }
        }

        if (dashboardFilter != "") {
            if (dashboardFilter == "AM") {
                query.status = ["New"]
            }
            else if (dashboardFilter == "MPI") {
                query.status = ["Marriage fixed - Payment Incomplete"]
            }
            else if (dashboardFilter == "MPC") {
                query.status = ["Marriage fixed - Payment Complete"]
            }
            else if (dashboardFilter == "UM") {
                query.maritalstatus = "Unmarried"
                query.status = ["New"]
            }
            else if (dashboardFilter == "WD") {
                query.maritalstatus = "Widowed"
                query.status = ["New"]
            }
            else if (dashboardFilter == "AD") {
                query.status = ["New"]
                query.maritalstatus = ["Divorced", "Awaiting Divorce"]
            }
        }

        const _marriageProfileList = await MarriageProfile.find(query).skip(_skip).limit(_pagesize)
        // console.log("mani",_marriageProfileList)

        const _totalRecord = await MarriageProfile.find(query).countDocuments()

        const imageList = await Promise.all(
          _marriageProfileList.map(async (doc) => {
            try {
              const image = doc.imageUrls;
              let imageName = '';
        
              if (image?.length > 0) {
                const result = image.find((item) => item.isProfile === true);
                imageName = result?.name || image[0].name;
              }
        
              if (!imageName) {
                return { profileID: doc.profileID, imageBase64: null };
              }
        
              const broker = await Broker.findOne({ _id: _brokerId });
        
              const blobResponse = await getImageByContainerAndBlob(broker.container, imageName);
        
              if (!blobResponse || !blobResponse.readableStreamBody) {
                return { profileID: doc.profileID, imageBase64: null };
              }
        
            //   console.log(imageName,'Success image...')

              //let isProfileViewedToday = await appFunction.isProfileViewedToday(user.profileId,_marriageProfileForPlan.planID,doc._id)
             // console.log(isProfileViewedToday)
              let imageToShow;
                  imageToShow =  blobResponse.readableStreamBody.pipe(sharp())
            //   if(isProfileViewedToday)
            //     imageToShow =  blobResponse.readableStreamBody.pipe(sharp())
            //   else
            //     imageToShow = blobResponse.readableStreamBody.pipe(sharp().blur(8))
        
              const blurredBuffer = await streamToBuffer(imageToShow);
        
              const base64Image = `data:image/jpeg;base64,${blurredBuffer.toString('base64')}`;
        
              return {
                profileID: doc.profileID,
                imageBase64: base64Image,
              };
            } catch (err) {
              console.error(`Error processing image for profile ${doc._id}:`, err);
              return { profileID: doc.profileID, imageBase64: null };
            }
          })
        );    
                // res.status(200).json({ "profiles": _marriageProfileList, "totalRecourd": Math.ceil(_totalRecord / _pagesize), "imageUrls": imageUrlList, "totalRecords": _totalRecord })
                // console.log('imageList')
                // console.log(imageList)
        
                res.status(200).json({
          profiles: _marriageProfileList,
          totalRecourd: Math.ceil(_totalRecord / _pagesize),
          images: imageList, // now contains base64 images
          totalRecords: _totalRecord,
        });

    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})

const getBrokProfById = asyncHandler(async(req,res)=>{
// console.log('bala')
  try{
    // console.log('hiii')
            const {profileID}=req.body
            // console.log(req.body)

        const _profile =await MarriageProfile.findById({_id:profileID})
        // console.log("1",_profile)
         if(_profile){
            res.status(201).json({isSuccess:true,ProfileDetail:_profile})
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

const GetBrokerDetails = asyncHandler(async (req, res) => {
    console.log('bala')
    try {
        console.log('mani')
        const { brokerID } = req.body
        console.log(req.body)

        const _broker = await Broker.findById( brokerID )
        console.log('mani',_broker)

        if (_broker) {
            res.status(200).json({ isSuccess: true, BrokerDetails: _broker })
        }
        else {
            res.status(201).json({ isSuccess: false, message: 'error occur' })
        }

    } catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})



module.exports = { getBrokerDetailById,
     topUpPlanBroker,
      getBrokerApproveProfileList,
      BrokerApproveDetailsById ,
      PUProfileRegisterInMarriageProfileTable,
      RejectProfile,
      getMatchProfile,
      BrokerToBroker,
      searchProfileBrokToBrok,
      getBrokProfById,
      GetBrokerDetails
    }


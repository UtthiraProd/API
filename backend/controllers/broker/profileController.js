const sharp = require('sharp');
const asyncHandler = require('express-async-handler')
const User = require('../../models/userModel')
const Broker = require('../../models/brokerModel')
const MarriageProfile = require('../../models/marriageProfileModel')
const UserRole = require('../../models/userRoleModel')
const ValidationConfig = require('../../models/validationConfigModel')
const { errorfunction,fieldValidationfunction } = require('../commonController')
const { getPrfileimageUrl } = require('../../azureservice/commonService');
const { removeAllProfileImageByID } = require('../../azureservice/fileUploadService');
const{createAuditLog} = require('../../utils/auditLogger')
const {sendRazorPayment} = require('../../externalService/razorpay')
const userBrokerRole = "Broker"
const ObjectId = require('mongodb')
const {getImageByContainerAndBlob} = require('../../azureservice/fileUploadService')

/**
 * Function Description: to register a profile
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object}i res - The response object used to send the response.
 * @returns {vod} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */
const registerProfile = asyncHandler(async (req, res) => {
    try {
        const userExists = await User.findById(req.user.id)

        if (!userExists) {
            res.status(400)
            throw new Error('User not found')
        }
        else if(userExists.isLoggedin !== true)
        {
           res.status(404)
           throw new Error('User not logged in')
        }

        const isActive = await Broker.findOne({userId:userExists._id})
                
        if(isActive.isActive !== true ){
            throw new Error('Broker isActive is false')
        }

        let _brokerId
        let createdProfileId
        const { name, maritalstatus, qualification, phoneNumber, contactPerson, job, salary, fatherOccupation, motherOccupation,additionalQualification,
            sex, religion, foodPreference, motherTongue, caste, subcaste, address1, address2,
            isWidow, brokerId, star, rasi, DOBBirth, POB, birthTime, district, state, sistersMarried,
            sistersUnmarried, brothersMarried, brothersUnmarried, notes, status, fatherName, motherName, colour, height, weight, bloodGroup, jobDescription, jobLocation,
            foreignCountry, settledLocation, dhosam, selfDescription, expectationFromMarriage,birthHour,birthMin,meridiem } = req.body.data
  console.log(req.body.data)
        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'RegisterProfile', fieldName: key })
            for (const currentObject of arrValidation) {

                let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);

                }
            }

        }
        
        

        if (!brokerId) {
            const _userRole = await UserRole.findOne({ _id: userExists.roleId });
            if (_userRole.name == userBrokerRole) {
                let _brokerDetail = await Broker.findOne({ userId: req.user.id });
                _brokerId = _brokerDetail._id
            }
        }
        else {
            _brokerId = brokerId
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


        const marriageProfile = await MarriageProfile.create({
            brokerId: _brokerId,
            name: name,
            qualification: qualification,
            additionalQualification:additionalQualification,
            maritalstatus: maritalstatus,
            DOB: DOBBirth,
            birthTime: birthTime,
            POB: POB,
            job: job,
            salary: salary,
            fatherOccupation: fatherOccupation,
            motherOccupation: motherOccupation,
            sex: sex,
            religion: religion,
            foodPreference: foodPreference,
            motherTongue: motherTongue,
            caste: caste,
            subcaste: subcaste,
            state: state,
            phoneNumber: phoneNumber,
            contactPerson: contactPerson,
            district: district,
            address1: address1,
            address2: address2,
            // isWidow:isWidow,
            star: star,
            rasi: rasi,
            sistersMarried: sistersMarried,
            sistersUnmarried: sistersUnmarried,
            brothersMarried: brothersMarried,
            brothersUnmarried: brothersUnmarried,
            notes: notes,
            status: status,
            profileID: maxProfileId,
            fatherName: fatherName,
            motherName: motherName,
            colour: colour,
            // height: height,
            height: height && !isNaN(height) && parseFloat(height) < 10 
  ? Math.round(parseFloat(height) * 30.48) 
  : parseFloat(height) || null,
            weight: weight,
            bloodGroup: bloodGroup,
            jobDescription: jobDescription,
            jobLocation: jobLocation,
            foreignCountry: foreignCountry,
            settledLocation: settledLocation,
            dhosam: dhosam,
            selfDescription: selfDescription,
            expectationFromMarriage:expectationFromMarriage,
            isBrokerApproved:true,
            isAdminApproved:false,
            birthHour:birthHour,
            birthMin:birthMin,
            meridiem:meridiem,
            createdBy:req.user.id,
            updatedBy:req.user.id,
            updatedAt:new Date(),
            createdAt:new Date(),
            isPublicImage:true,
            isPublicProfile:true



        }).then((docProfile) => {
            createdProfileId = docProfile._id
            return Broker.findByIdAndUpdate(_brokerId, {
                $push: {
                    profileIds: {
                        _id: docProfile._id
                    }
                }
            }

                , {
                    new: true, useFindAndModify: false
                }
            )

        })

        if (marriageProfile) {
            res.status(201).json(
                {
                    Id: createdProfileId
                }
            )
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

/**
 * Function Description: to get all profiles details by an id
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getProfileDetailsById = asyncHandler(async (req, res) => {
    try {
        const { profileId } = req.body
        
        const user = await User.findById(req.user.id)

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

        const _marriageProfileDetail = await MarriageProfile.findOne({ _id: profileId })

          if (isActive._id.toString() !== _marriageProfileDetail.brokerId.toString()) {
            res.status(401)
            throw new Error('Unauthorized access!!')
        }

        const [createdBy, updatedBy] = await Promise.all([
                      Broker.findOne({ userId: _marriageProfileDetail.createdBy }),
                      Broker.findOne({ userId: _marriageProfileDetail.updatedBy })
            ]);

        if (!_marriageProfileDetail) {
            res.status(404)
            throw new Error('profile detail not found')
        }
           res.status(200).json({
            profileDetails: _marriageProfileDetail,
            createdBy: createdBy,
            updatedBy: updatedBy
        });
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})

const userFind = asyncHandler(async(req,res)=>{
  try{
    const user = await User.findById(req.user.id)
    
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

            
    // console.log("welcome")
    const {profileId}=req.body
    // console.log("profileID",profileId)
   
    const _user = await User.findOne({profileId:profileId});
    // console.log("Modeee :", _user)
     if (_user) {
      res.json({ exists: true })
    } else {
      res.json({ exists: false })
    }
    
  }
  catch (err){
    errorfunction.errorHandler(err,req,res)
}
})

/**
 * Function Description: to get broker details by id
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getBrokerDetailsById = asyncHandler(async (req, res) => {

    try {
        let _brokerId
        const user = await User.findById(req.user.id)

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

        const { brokerId } = req.body

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

        const _brokerDetail = await Broker.findOne({ _id: _brokerId }, { "profileIds": 0 });

        if (!_brokerDetail) {
            res.status(404)
            throw new Error('Broker detail not found')
        }

        res.status(200).json(_brokerDetail)
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


/**
 * Function Description: to search a profile
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const searchProfile = asyncHandler(async (req, res) => {
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

        const { name,sex, religion, caste, job, ageFrom, ageTo,
            searchBrokerId, dashboardFilter, skip, pagesize, profileID } = req.body

        
        // let {profileID} =req.body

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
        let _brokerId = searchBrokerId

        if (!_brokerId) {
            const _userRole = await UserRole.findOne({ _id: user.roleId });
        
            if (_userRole.name == userBrokerRole) {
                let _brokerDetail = await Broker.findOne({ userId: req.user.id });

                _brokerId = _brokerDetail._id
            }
        }
        else {
            _brokerId = searchBrokerId
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
        if (profileID && typeof profileID === "string") {

              const numericID = profileID.replace(/^(UM|UF)/, '')
              query.profileID = numericID

          if (profileID.startsWith("UM")) {
              query.sex = "Male"
          } else if (profileID.startsWith("UF")) {
           query.sex = "Female"
          }
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
        // console.log(_marriageProfileList)

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

/**
 * Function Description: to search a profile
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const updateProfile = asyncHandler(async (req, res) => {
    try {
        // Fetch the user who is trying to update the horoscope
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

        // Extract fields from the request body
        const { profileId, name, maritalstatus, qualification, phoneNumber, job, salary, fatherOccupation, motherOccupation,additionalQualification,
            sex, religion, caste, subcaste, address1, address2,
            isWidow, brokerId, star, rasi, DOBBirth, POB, birthTime, district, state, sistersMarried,
            sistersUnmarried, brothersMarried, brothersUnmarried, notes, status, fatherName, motherName, colour, height, weight, bloodGroup, jobDescription, jobLocation,
            foreignCountry, settledLocation, dhosam, selfDescription, contactPerson, foodPreference, motherTongue, expectationFromMarriage,birthHour,birthMin,meridiem  } = req.body.data
            for (const [key, value] of Object.entries(req.body.data)) {
                if(value != undefined && value!=null && value !="")
                    {
                let arrValidation = await ValidationConfig.find({ formName: 'RegisterProfile', fieldName: key })
                for (const currentObject of arrValidation) {
            
                    let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                    if (message != '') {
                        res.status(400)
                        console.log(message)
                        throw new Error(message);
            
                    }
                  }
               }
            }    

                   const _userRole = await UserRole.findOne({_id:user.roleId})
            
                    if(_userRole.name !== userBrokerRole){
                        res.status(404)
                        throw new error("error")
                    }
            
                    const _BrokerId = await Broker.findOne({userId:user._id})
            
                    const _marriageProfiles = await MarriageProfile.findOne({_id: profileId})
            
                    if (_BrokerId._id.toString() !== _marriageProfiles.brokerId.toString()) {
                    res.status(401)
                    throw new Error('Unauthorized access!!')
                    }
        
        // Fetch the marriage profile based on profileId
        const _marriageProfileDetail = await MarriageProfile.findById(profileId);

        if (!_marriageProfileDetail) {
            res.status(404).json({ isSuccess: false, message: 'Profile detail not found' });
            return;
        }




const oldProfile = await MarriageProfile.findOne({_id: profileId}).lean()

        // Update the horoscope section of the MarriageProfile document
        let updatedProfile = await MarriageProfile.findByIdAndUpdate(
            profileId,
            {
                $set: {
                    name: name,
                    maritalstatus: maritalstatus,
                    qualification: qualification,
                    additionalQualification:additionalQualification,
                    phoneNumber,
                    job,
                    salary,
                    fatherOccupation,
                    motherOccupation,
                    sex,
                    religion: religion,
                    caste,
                    subcaste,
                    address1,
                    address2,
                    //isWidow, 
                    brokerId,
                    star,
                    rasi,
                    DOB: new Date(DOBBirth),
                    POB,
                    birthTime:birthTime,
                    district,
                    state,
                    sistersMarried,
                    sistersUnmarried,
                    brothersMarried,
                    brothersUnmarried,
                    notes,
                    status,
                    fatherName: fatherName,
                    motherName: motherName,
                    colour: colour,
                    // height: height,
                   height: height && !isNaN(height) && parseFloat(height) < 10 
  ? Math.round(parseFloat(height) * 30.48) 
  : parseFloat(height) || null,

                    weight: weight,
                    bloodGroup: bloodGroup,
                    jobDescription: jobDescription,
                    jobLocation: jobLocation,
                    foreignCountry: foreignCountry,
                    settledLocation: settledLocation,
                    dhosam: dhosam,
                    selfDescription: selfDescription,
                    contactPerson: contactPerson, 
                    foodPreference: foodPreference, 
                    motherTongue: motherTongue, 
                    expectationFromMarriage: expectationFromMarriage,
                    birthHour:birthHour,
                    birthMin:birthMin,
                    meridiem:meridiem,
                    updatedBy:req.user.id,
                    updatedAt:new Date(),
                }
            },
            {
                new: true,runValidators: true 
            }
             // runValidators: true ==> it will give updated new record
             //runValidators: true  ==> throw validation error as per validation defined in model
        );

        if (!updatedProfile) {
            res.status(500).json({ isSuccess: false, message: 'Error updating profile' });
            return;
        }
        else
        {
           createAuditLog(user._id,user.roleId,profileId,"marriageprofiles","Update",
                          "Broker updating the profile","updateProfile",3,
                         {before: oldProfile,after: updatedProfile.toObject()},
                          req
                         )
        }



(async () => {
  try {
    const order = await sendRazorPayment(1,req,res);
    // console.log("Order created:", order);
  } catch (e) {
    console.error("Error creating order:", e);
  }
})();


        // Return success response
        res.status(200).json({
            isSuccess: true,
            message: 'Profile updated successfully',
            updatedProfile: updatedProfile
        });
        console.log(birthMin)

    } catch (err) {
        errorfunction.errorHandler(err, req, res)
        res.status(500).json({ isSuccess: false, message: 'Internal server error', error: err.message });
    }
});

/**
 * Function Description: to update horoscope
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const updateHoroscope = asyncHandler(async (req, res) => {
    try {
        // Fetch the user who is trying to update the horoscope
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

        // Extract fields from the request body
        const {
            profileId, meshaR, vrishbaR, mithunaR, karkataR, simhaR, kanyaR, tulaR, vrishikaR,
            dhanuR, makaraR, khumbhaR, meenaR, meshaA, vrishbaA, mithunaA, karkataA, simhaA, kanyaA,
            tulaA, vrishikaA, dhanuA, makaraA, khumbhaA, meenaA, dhasa, year, month, day
        } = req.body;

        // Fetch the marriage profile based on profileId
        const _marriageProfileDetail = await MarriageProfile.findById(profileId);

        if (!_marriageProfileDetail) {
            res.status(404).json({ isSuccess: false, message: 'Profile detail not found' });
            return;
        }

        // Update the horoscope section of the MarriageProfile document
        let updatedProfile = await MarriageProfile.findByIdAndUpdate(
            profileId,
            {
                $set: {
                    horoScope: {
                        profileId: profileId,
                        meshaR, vrishbaR, mithunaR, karkataR, simhaR, kanyaR, tulaR, vrishikaR,
                        dhanuR, makaraR, khumbhaR, meenaR, meshaA, vrishbaA, mithunaA, karkataA, simhaA,
                        kanyaA, tulaA, vrishikaA, dhanuA, makaraA, khumbhaA, meenaA, dhasa, year,
                        month, day
                    }
                }
            },
            {
                new: false, useFindAndModify: true
            } // Return the updated document
        );

        if (!updatedProfile) {
            res.status(500).json({ isSuccess: false, message: 'Error updating profile' });
            return;
        }

        // Return success response
        res.status(200).json({
            isSuccess: true,
            message: 'Horoscope updated successfully',
            updatedProfile: updatedProfile
        });

    } catch (err) {
        errorfunction.errorHandler(err, req, res)
        res.status(500).json({ isSuccess: false, message: 'Error while updating profile!!! ', error: err.message });
    }
});

/**
 * Function Description: to update horoscope
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const deleteProfile = asyncHandler(async (req, res) => {

    try {
        const user = await User.findById(req.user.id)

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

        const { profileId } = req.body

        const _userRole = await UserRole.findOne({_id:user.roleId})

        if(_userRole.name !== userBrokerRole){
            res.status(404)
            throw new error("User Role Does not Match")
        }

        const _brokerId = await Broker.findOne({userId:user._id})

        const _marriageProfile = await MarriageProfile.findOne({_id: profileId})
   
        if (_brokerId._id.toString() !== _marriageProfile.brokerId.toString()) {
            res.status(404)
            throw new error("Unauthorized access")
        }
        
        const _marriageProfileDetail = await MarriageProfile.findOne({ _id: profileId })

        if (!_marriageProfileDetail) {
            res.status(404)
            throw new Error('profile detail not found')
        }

        await removeAllProfileImageByID(profileId, null, req.user.id)
        console.log("deepi")

        //Remove profileID inside the broker
        await Broker.findByIdAndUpdate(_marriageProfileDetail.brokerId, {
            $pull: {
                profileIds: {
                    _id: _marriageProfileDetail._id
                }
            }
        })
        await MarriageProfile.findByIdAndUpdate(profileId ,{
            $set:{
                status:"Deleted"
            }
        })
 
        return res.send({ isSuccess: true, message: "Profile deleted successfully" })
        
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})

/**
 * Function Description: to set profile photo
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns - success message
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const setProfilePhoto = asyncHandler(async (req, res) => {

    try {

           const user = await User.findById(req.user.id);
        
                if (!user) {
                    res.status(401);
                    throw new Error('User not found');
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


        const { profileId, images } = req.body
        const _marriageProfileDetail = await MarriageProfile.findOne({ _id: profileId })

        //To do: check whether the profile ID is inside the broker
        if (!_marriageProfileDetail) {
            res.status(404)
            throw new Error('profile detail not found')
        }

        for (const imagenameFromRequest of images) {
            await MarriageProfile.findByIdAndUpdate(profileId, {
                $pull: {
                    imageUrls: {
                        name: imagenameFromRequest.name
                    }
                }
            });

            // Add the image with the isProfile flag
            const updateObject = {
                name: imagenameFromRequest.name, // Use only the image name as a string
                isProfile: imagenameFromRequest.isProfile || false // Set the isProfile value properly
            };

            await MarriageProfile.findByIdAndUpdate(profileId, {
                $push: {
                    imageUrls: updateObject // Push the correctly formatted object
                }
            });
        }

        return res.send({ isSuccess: true, message: "Profile photo selected successfully" })
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


// const addCommand = asyncHandler(async (req, res) => {
//     console.log('maniboomi');
//     const { command, profileId} = req.body;
//     console.log(req.body);

//     const _marriageProfileDetail = await MarriageProfile.findById(profileId);
//     if (!_marriageProfileDetail) {
//         return res.status(200).json({ isSuccess: false, message: 'Profile detail not found' });
//     }
// else{
//     const _command = await MarriageProfile.create({
//       profileId: { command: [
//             {
//                 date: new Date(),
//                 command: command
//             }
//         ]}
//     });
// console.log(_command)
//     if (_command) {
//         return res.status(201).json({ isSuccess: true, message: "Command Added Successfully" });
//     } else {
//         console.log('error occur');
//         return res.status(500).json({ isSuccess: false, message: "Failed to add command" });
//     }}
// });
const addCommand = asyncHandler(async (req, res) => {
    console.log('maniboomi');
    const {command, profileId } = req.body;
    console.log(req.body);

     if(!command){
       return res.status(200).json({isSuccess:false,message:"Please enter command"})
    }

    const _marriageProfileDetail = await MarriageProfile.findById(profileId);
    if (!_marriageProfileDetail) {
        return res.status(404).json({ isSuccess: false, message: 'Profile detail not found' });
    }

    _marriageProfileDetail.command.push({
        date: new Date(),
        command: command
    });

   
    await _marriageProfileDetail.save();

    return res.status(201).json({ isSuccess: true, message: "Command Added Successfully" });
});


const deleteCommand =asyncHandler(async(req,res)=>{
console.log('hi')
    const {profileId,command}=req.body;
    console.log(req.body)

     const _marriageProfileDetail = await MarriageProfile.findById(profileId)
     
    if (!_marriageProfileDetail) {
        return res.status(404).json({ isSuccess: false, message: 'Profile detail not foundmani' });
    }

     await _marriageProfileDetail.updateOne({
        $pull:{
            command:{
      _id:command
            }
        }
    })

    console.log('hi123')
}) 

const updatecommand =asyncHandler(async(req,res)=>{     
})

const PUProfileBrokerAllow =asyncHandler(async(req,res)=>{
     
     try{

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

        const _userRole = await UserRole.findOne({ _id: user.roleId })

         if (_userRole.name !== userBrokerRole) {
              res.status(404)
              throw new error("error")
        }

        const {profileId, isPublicProfile }=req.body

        const _brokerId = await Broker.findOne({userId:user._id})

        const _marriageProfile = await MarriageProfile.findOne({_id: profileId})
        

        if(!_marriageProfile){
            return res.status(200).json({ isSuccess: false, message: 'Profile not found' });
        }
   
        if (_brokerId._id.toString() !== _marriageProfile.brokerId.toString()) {
            res.status(404)
            throw new error("Unauthorized access")
        }
          await MarriageProfile.updateOne({ _id: profileId }, { $set: { isPublicProfile: isPublicProfile  } })

     }
      catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


const PUViewImageBrokerAllow =asyncHandler(async(req,res)=>{
     
     try{

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

        const _userRole = await UserRole.findOne({ _id: user.roleId })

         if (_userRole.name !== userBrokerRole) {
              res.status(404)
              throw new error("error")
        }

        const {profileId, isPublicProfile }=req.body
        console.log(req.body)

        const _brokerId = await Broker.findOne({userId:user._id})

        const _marriageProfile = await MarriageProfile.findOne({_id: profileId})
        

        if(!_marriageProfile){
            return res.status(200).json({ isSuccess: false, message: 'Profile not found' });
        }
   
        if (_brokerId._id.toString() !== _marriageProfile.brokerId.toString()) {
            res.status(404)
            throw new error("Unauthorized access")
        }

          await MarriageProfile.updateOne({ _id: profileId }, { $set: { isPublicImage: isPublicProfile  } })

     }
      catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


module.exports ={ 
    registerProfile,
    getProfileDetailsById,
    userFind,
    getBrokerDetailsById,
    searchProfile,
    updateProfile,
    updateHoroscope,
    deleteProfile,
    setProfilePhoto,
    addCommand,
    deleteCommand,
    updatecommand,
    PUProfileBrokerAllow,
    PUViewImageBrokerAllow
}
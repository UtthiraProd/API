const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const Broker = require('../models/brokerModel')
const MarriageProfile = require('../models/marriageProfileModel')
const UserRole = require('../models/userRoleModel')
const ValidationConfig = require('../models/validationConfigModel')
const { errorfunction,fieldValidationfunction } = require('./commonController')
const { getPrfileimageUrl } = require('../azureservice/commonService');
const { removeAllProfileImageByID } = require('../azureservice/fileUploadService');
const userBrokerRole = "Broker"
const ObjectId = require('mongodb')

/**
 * Function Description: to register a profile
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object}i res - The response object used to send the response.
 * @returns {vod} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */
// const registerProfile = asyncHandler(async (req, res) => {
//     try {
//         const userExists = await User.findById(req.user.id)

//         console.log(userExists)
//         if (!userExists) {
//             res.status(400)
//             throw new Error('User not found')
//         }

//         let _brokerId
//         let createdProfileId
//         const { name, maritalstatus, qualification, phoneNumber, contactPerson, job, salary, fatherOccupation, motherOccupation,
//             sex, religion, foodPreference, motherTongue, caste, subcaste, address1, address2,
//             isWidow, brokerId, star, rasi, DOBBirth, POB, birthTime, district, state, sistersMarried,
//             sistersUnmarried, brothersMarried, brothersUnmarried, notes, status, fatherName, motherName, colour, height, weight, bloodGroup, jobDescription, jobLocation,
//             foreignCountry, settledLocation, dhosam, selfDescription, expectationFromMarriage,birthHour,birthMin,meridiem } = req.body.data
//   console.log(req.body.data)
//         for (const [key, value] of Object.entries(req.body.data)) {
//             let arrValidation = await ValidationConfig.find({ formName: 'RegisterProfile', fieldName: key })
//             for (const currentObject of arrValidation) {

//                 let message =await fieldValidationfunction.ValidateFields(currentObject, value);
//                 if (message != '') {
//                     res.status(400)
//                     console.log(message)
//                     throw new Error(message);

//                 }
//             }

//         }
        

//         if (!brokerId) {
//             const _userRole = await UserRole.findOne({ _id: userExists.roleId });
//             if (_userRole.name == userBrokerRole) {
//                 let _brokerDetail = await Broker.findOne({ userId: req.user.id });
//                 _brokerId = _brokerDetail._id
//             }
//         }
//         else {
//             _brokerId = brokerId
//         }

//         let profileIds = await MarriageProfile.find({ brokerId: _brokerId })
//         let maxProfileId;

//         if (profileIds.length == 0)
//             maxProfileId = 1
//         else {
//             maxProfileId = profileIds.reduce((max, profile) => {
//                 return profile.profileID > max ? profile.profileID : max;
//             }, -Infinity);
//             maxProfileId = maxProfileId + 1
//         }


//         const marriageProfile = await MarriageProfile.create({
//             brokerId: _brokerId,
//             name: name,
//             qualification: qualification,
//             maritalstatus: maritalstatus,
//             DOB: DOBBirth,
//             birthTime: birthTime,
//             POB: POB,
//             job: job,
//             salary: salary,
//             fatherOccupation: fatherOccupation,
//             motherOccupation: motherOccupation,
//             sex: sex,
//             religion: religion,
//             foodPreference: foodPreference,
//             motherTongue: motherTongue,
//             caste: caste,
//             subcaste: subcaste,
//             state: state,
//             phoneNumber: phoneNumber,
//             contactPerson: contactPerson,
//             district: district,
//             address1: address1,
//             address2: address2,
//             // isWidow:isWidow,
//             star: star,
//             rasi: rasi,
//             sistersMarried: sistersMarried,
//             sistersUnmarried: sistersUnmarried,
//             brothersMarried: brothersMarried,
//             brothersUnmarried: brothersUnmarried,
//             notes: notes,
//             status: status,
//             profileID: maxProfileId,
//             fatherName: fatherName,
//             motherName: motherName,
//             colour: colour,
//             height: height,
//             weight: weight,
//             bloodGroup: bloodGroup,
//             jobDescription: jobDescription,
//             jobLocation: jobLocation,
//             foreignCountry: foreignCountry,
//             settledLocation: settledLocation,
//             dhosam: dhosam,
//             selfDescription: selfDescription,
//             isBrokerApproved:true,
//             isAdminApproved:false,
//             birthHour:birthHour,
//             birthMin:birthMin,
//             meridiem:meridiem,
//             createdBy:req.user.id,
//             updatedBy:req.user.id,
//             updatedAt:new Date(),
//             createdAt:new Date()



//         }).then((docProfile) => {
//             createdProfileId = docProfile._id
//             return Broker.findByIdAndUpdate(_brokerId, {
//                 $push: {
//                     profileIds: {
//                         _id: docProfile._id
//                     }
//                 }
//             }

//                 , {
//                     new: true, useFindAndModify: false
//                 }
//             )

//         })

//         if (marriageProfile) {
//             res.status(201).json(
//                 {
//                     Id: createdProfileId
//                 }
//             )
//         }
//     }
//     catch (err) {
//         errorfunction.errorHandler(err, req, res)
//     }
// })

/**
 * Function Description: to get all profiles with broker id
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

// const getAllProfilesByBrokerId = asyncHandler(async (req, res) => {

//     try {

//         // get user using the id in the JWT
//         let _brokerId;
//         let _broker;
//         let _skip = 1;
//         let _pagesize = 10;
//         let _totalRecord;

//         const user = await User.findById(req.user.id)
        
//         if (!user) {
//             res.status(401)
//             throw new Error('User not found')
//         }

//         const { brokerId, skip, pagesize } = req.body

//         if (pagesize) {

//             if (skip == 1) {
//                 _skip = skip - 1
//                 _pagesize = pagesize
//             }
//             else {
//                 _skip = ((skip - 1) * pagesize)
//                 _pagesize = pagesize
//             }

//         }


//         if (!brokerId) {
//             const _userRole = await UserRole.findOne({ _id: user.roleId });

//             if (_userRole.name == userBrokerRole) {
//                 _brokerDetail = await Broker.findOne({ userId: req.user.id });
//                 _brokerId = _brokerDetail._id

//             }
//         }
//         else {
//             _brokerId = brokerId
//         }

//         _broker = await Broker.findById({ _id: _brokerId })
//         const _prof = Broker.find({ _id: _broker.profileIds })


//         const ids = [];
//         //for(const data of _broker.profileIds.slice(0,2)) { if we want to get n number here eg:2
//         for (const data of _broker.profileIds) {
//             ids.push(data._id)
//         }

//         const profiles = await MarriageProfile.find({ _id: { $in: ids } }).skip(_skip).limit(_pagesize)
//         _totalRecord = await MarriageProfile.find({ _id: { $in: ids } }).countDocuments()

//         if (!_broker) {
//             res.status(404)
//             throw new Error('profiles not found')
//         }


//         res.status(200).json({ "profiles": profiles, "totalRecourd": Math.ceil(_totalRecord / _pagesize) })
//     }
//     catch (err) {
//         errorfunction.errorHandler(err, req, res)
//     }

// })


/**
 * Function Description: to get all profiles details by an id
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

// const getProfileDetailsById = asyncHandler(async (req, res) => {

//     try {

//         const user = await User.findById(req.user.id)

//         if (!user) {
//             res.status(401)
//             throw new Error('User not found')
//         }

//         const { profileId } = req.body

//         const _marriageProfileDetail = await MarriageProfile.findOne({ _id: profileId })

//         const [createdBy, updatedBy] = await Promise.all([
//                       Broker.findOne({ userId: _marriageProfileDetail.createdBy }),
//                       Broker.findOne({ userId: _marriageProfileDetail.updatedBy })
//             ]);

//         if (!_marriageProfileDetail) {
//             res.status(404)
//             throw new Error('profile detail not found')
//         }
//            res.status(200).json({
//             profileDetails: _marriageProfileDetail,
//             createdBy: createdBy,
//             updatedBy: updatedBy
//         });
//     }
//     catch (err) {
//         errorfunction.errorHandler(err, req, res)
//     }

// })

// const userFind = asyncHandler(async(req,res)=>{
//   try{

//     const user = await User.findById(req.user.id)
//     console.log(req.user.id)
    
//             if (!user) {
//                 res.status(401)
//                 throw new Error('User not found')
//             }

            
//     // console.log("welcome")
//     const {profileId}=req.body
//     // console.log("profileID",profileId)
   
//     const _user = await User.findOne({profileId:profileId});
//     // console.log("Modeee :", _user)
//      if (_user) {
//       res.json({ exists: true })
//     } else {
//       res.json({ exists: false })
//     }
    
//   }
//   catch (err){
//     errorfunction.errorHandler(err,req,res)
// }
// })

/**
 * Function Description: to get broker details by id
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

// const getBrokerDetailsById = asyncHandler(async (req, res) => {

//     try {

//         let _brokerId
//         const user = await User.findById(req.user.id)

//         if (!user) {
//             res.status(401)
//             throw new Error('User not found')
//         }

//         const { brokerId } = req.body

//         if (brokerId == 'null' || !brokerId || (brokerId == null)) {
//             const _userRole = await UserRole.findOne({ _id: user.roleId });

//             if (_userRole.name == userBrokerRole) {
//                 let _brokerDetail = await Broker.findOne({ userId: req.user.id });
//                 _brokerId = _brokerDetail._id

//             }
//         }
//         else {
//             _brokerId = brokerId
//         }

//         const _brokerDetail = await Broker.findOne({ _id: _brokerId }, { "profileIds": 0 });

//         if (!_brokerDetail) {
//             res.status(404)
//             throw new Error('Broker detail not found')
//         }

//         res.status(200).json(_brokerDetail)

//     }
//     catch (err) {
//         errorfunction.errorHandler(err, req, res)
//     }

// })


/**
 * Function Description: to search a profile
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

// const searchProfile = asyncHandler(async (req, res) => {

//     try {
//         console.log("DeepikaRaja")
//         const user = await User.findById(req.user.id)
//         // console.log(user)
//         let _skip = 1;
//         let _pagesize = 10;

//         if (!user) {
//             res.status(401)
//             throw new Error('User not found')
//         }
//         const { sex, religion, caste, job, ageFrom, ageTo,
//             searchBrokerId, dashboardFilter, skip, pagesize } = req.body
//             console.log(req.body)
        
//         let {profileID} =req.body

//         if (pagesize) {

//             if (skip == 1) {
//                 _skip = skip - 1
//                 _pagesize = pagesize
//             }
//             else {
//                 _skip = ((skip - 1) * pagesize)
//                 _pagesize = pagesize
//             }

//             if (_pagesize > 10) {
//                 _pagesize = 10;
//             }

//         }

//         const currentDateForFrom = new Date();
//         currentDateForFrom.setFullYear(currentDateForFrom.getFullYear() - ageFrom);

//         // Calculate the date 30 years ago from the current date
//         const currentDateForTo = new Date();
//         currentDateForTo.setFullYear(currentDateForTo.getFullYear() - ageTo);
//         let query = {};
//         let _brokerId = searchBrokerId

//         if (!_brokerId) {
//             const _userRole = await UserRole.findOne({ _id: user.roleId });
//         //   console.log(_userRole)
//             if (_userRole.name == userBrokerRole) {
//                 let _brokerDetail = await Broker.findOne({ userId: req.user.id });
//                 // console .log( "raja",_brokerDetail)

//                 _brokerId = _brokerDetail._id
//                 // console .log(_brokerDetail)
//             }
//         }
//         else {
//             _brokerId = searchBrokerId
//         }

//         query.brokerId = _brokerId


        
//         if (sex) {
//             query.sex = sex;
//         }
//         if (religion) {
//             query.religion = religion;
//         }
//         if (caste) {
//             query.caste = caste;
//         }
//         if (job) {
//             query.job = job;
//         }
//         if (profileID && typeof profileID === "string") {
//            profileID = profileID.replace(/^(UM|UF)/, '');
//            query.profileID = profileID;
//         }           

//         if (ageFrom) {
//             query.DOB = { $lte: currentDateForFrom, $gte: currentDateForTo }
//         }

//         if (dashboardFilter != "") {
//             if (dashboardFilter == "AM") {
//                 query.status = ["New"]
//             }
//             else if (dashboardFilter == "MPI") {
//                 query.status = ["Marriage fixed - Payment Incomplete"]
//             }
//             else if (dashboardFilter == "MPC") {
//                 query.status = ["Marriage fixed - Payment Complete"]
//             }
//             else if (dashboardFilter == "UM") {
//                 query.maritalstatus = "Unmarried"
//                 query.status = ["New"]
//             }
//             else if (dashboardFilter == "WD") {
//                 query.maritalstatus = "Widowed"
//                 query.status = ["New"]
//             }
//             else if (dashboardFilter == "AD") {
//                 query.status = ["New"]
//                 query.maritalstatus = ["Divorced", "Awaiting Divorce"]
//             }
//         }


//         const _marriageProfileList = await MarriageProfile.find(query).skip(_skip).limit(_pagesize)
//         // console.log(_marriageProfileList)

//         const _totalRecord = await MarriageProfile.find(query).countDocuments()
// // console.log(_totalRecord)
//         const imageUrlList = await Promise.all(
//             (await _marriageProfileList).map(async (doc) => {
//                 // Perform asynchronous operations here if needed
//                 let imageurl = await getPrfileimageUrl(_brokerId, doc._id)

//                 return { "profileID": doc.profileID, "imageUrl": imageurl };
//             }),
            
//         );
//         // console.log(imageUrlList)
//         res.status(200).json({ "profiles": _marriageProfileList, "totalRecourd": Math.ceil(_totalRecord / _pagesize), "imageUrls": imageUrlList, "totalRecords": _totalRecord })

//     }
//     catch (err) {
//         errorfunction.errorHandler(err, req, res)
//     }

// })


/**
 * Function Description: to search a profile
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

// const updateProfile = asyncHandler(async (req, res) => {
//     try {
//         // Fetch the user who is trying to update the horoscope
//         const user = await User.findById(req.user.id);

//         if (!user) {
//             res.status(401).json({ isSuccess: false, message: 'User not found' });
//             return;
//         }

//         // Extract fields from the request body
//         const { profileId, name, maritalstatus, qualification, phoneNumber, job, salary, fatherOccupation, motherOccupation,
//             sex, religion, caste, subcaste, address1, address2,
//             isWidow, brokerId, star, rasi, DOBBirth, POB, birthTime, district, state, sistersMarried,
//             sistersUnmarried, brothersMarried, brothersUnmarried, notes, status, fatherName, motherName, colour, height, weight, bloodGroup, jobDescription, jobLocation,
//             foreignCountry, settledLocation, dhosam, selfDescription, contactPerson, foodPreference, motherTongue, expectationFromMarriage,birthHour,birthMin,meridiem  } = req.body.data
//           console.log(req.body.data)
//             for (const [key, value] of Object.entries(req.body.data)) {
//                 if(value != undefined && value!=null && value !="")
//                     {
//                 let arrValidation = await ValidationConfig.find({ formName: 'RegisterProfile', fieldName: key })
//                 for (const currentObject of arrValidation) {
            
//                     let message =await fieldValidationfunction.ValidateFields(currentObject, value);
//                     if (message != '') {
//                         res.status(400)
//                         console.log(message)
//                         throw new Error(message);
            
//                     }
//                 }
//                     }
//             }
    

//                    const _userRole = await UserRole.findOne({_id:user.roleId})
            
//                     if(_userRole.name !== userBrokerRole){
//                         res.status(404)
//                         throw new error("error")
//                     }
            
//                     const _BrokerId = await Broker.findOne({userId:user._id})
            
//                     const _marriageProfiles = await MarriageProfile.findOne({_id: profileId})
            
//                     if (_BrokerId._id.toString() !== _marriageProfiles.brokerId.toString()) {
//                     res.status(401)
//                     throw new Error('Unauthorized access!!')
//                     }
        
//         // Fetch the marriage profile based on profileId
//         const _marriageProfileDetail = await MarriageProfile.findById(profileId);

//         if (!_marriageProfileDetail) {
//             res.status(404).json({ isSuccess: false, message: 'Profile detail not found' });
//             return;
//         }

//         console.log(birthMin)

//         // Update the horoscope section of the MarriageProfile document
//         let updatedProfile = await MarriageProfile.findByIdAndUpdate(
//             profileId,
//             {
//                 $set: {
//                     name: name,
//                     maritalstatus: maritalstatus,
//                     qualification: qualification,
//                     phoneNumber,
//                     job,
//                     salary,
//                     fatherOccupation,
//                     motherOccupation,
//                     sex,
//                     religion: religion,
//                     caste,
//                     subcaste,
//                     address1,
//                     address2,
//                     //isWidow, 
//                     brokerId,
//                     star,
//                     rasi,
//                     DOB: new Date(DOBBirth),
//                     POB,
//                     birthTime:birthTime,
//                     district,
//                     state,
//                     sistersMarried,
//                     sistersUnmarried,
//                     brothersMarried,
//                     brothersUnmarried,
//                     notes,
//                     status,
//                     fatherName: fatherName,
//                     motherName: motherName,
//                     colour: colour,
//                     height: height,
//                     weight: weight,
//                     bloodGroup: bloodGroup,
//                     jobDescription: jobDescription,
//                     jobLocation: jobLocation,
//                     foreignCountry: foreignCountry,
//                     settledLocation: settledLocation,
//                     dhosam: dhosam,
//                     selfDescription: selfDescription,
//                     contactPerson: contactPerson, 
//                     foodPreference: foodPreference, 
//                     motherTongue: motherTongue, 
//                     expectationFromMarriage: expectationFromMarriage,
//                     birthHour:birthHour,
//                     birthMin:birthMin,
//                     meridiem:meridiem,
//                     updatedBy:req.user.id,
//                     updatedAt:new Date(),
//                 }
//             },
//             {
//                 new: false, useFindAndModify: true
//             } // Return the updated document
//         );
//         console.log(birthMin)

//         if (!updatedProfile) {
//             res.status(500).json({ isSuccess: false, message: 'Error updating profile' });
//             return;
//         }

//         // Return success response
//         res.status(200).json({
//             isSuccess: true,
//             message: 'Profile updated successfully',
//             updatedProfile: updatedProfile
//         });
//         console.log(birthMin)

//     } catch (err) {
//         errorfunction.errorHandler(err, req, res)
//         res.status(500).json({ isSuccess: false, message: 'Internal server error', error: err.message });
//     }
// });


/**
 * Function Description: to update horoscope
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

// const updateHoroscope = asyncHandler(async (req, res) => {
//     try {
//         // Fetch the user who is trying to update the horoscope
//         const user = await User.findById(req.user.id);

//         if (!user) {
//             res.status(401).json({ isSuccess: false, message: 'User not found' });
//             return;
//         }

//         // Extract fields from the request body
//         const {
//             profileId, meshaR, vrishbaR, mithunaR, karkataR, simhaR, kanyaR, tulaR, vrishikaR,
//             dhanuR, makaraR, khumbhaR, meenaR, meshaA, vrishbaA, mithunaA, karkataA, simhaA, kanyaA,
//             tulaA, vrishikaA, dhanuA, makaraA, khumbhaA, meenaA, dhasa, year, month, day
//         } = req.body;

//         // Fetch the marriage profile based on profileId
//         const _marriageProfileDetail = await MarriageProfile.findById(profileId);

//         if (!_marriageProfileDetail) {
//             res.status(404).json({ isSuccess: false, message: 'Profile detail not found' });
//             return;
//         }

//         // Update the horoscope section of the MarriageProfile document
//         let updatedProfile = await MarriageProfile.findByIdAndUpdate(
//             profileId,
//             {
//                 $set: {
//                     horoScope: {
//                         profileId: profileId,
//                         meshaR, vrishbaR, mithunaR, karkataR, simhaR, kanyaR, tulaR, vrishikaR,
//                         dhanuR, makaraR, khumbhaR, meenaR, meshaA, vrishbaA, mithunaA, karkataA, simhaA,
//                         kanyaA, tulaA, vrishikaA, dhanuA, makaraA, khumbhaA, meenaA, dhasa, year,
//                         month, day
//                     }
//                 }
//             },
//             {
//                 new: false, useFindAndModify: true
//             } // Return the updated document
//         );

//         if (!updatedProfile) {
//             res.status(500).json({ isSuccess: false, message: 'Error updating profile' });
//             return;
//         }

//         // Return success response
//         res.status(200).json({
//             isSuccess: true,
//             message: 'Horoscope updated successfully',
//             updatedProfile: updatedProfile
//         });

//     } catch (err) {
//         errorfunction.errorHandler(err, req, res)
//         res.status(500).json({ isSuccess: false, message: 'Error while updating profile!!! ', error: err.message });
//     }
// });


// /**
//  * Function Description: to update horoscope
//  * @param {object} req - The request object containing the HTTP request details.
//  * @param {object} res - The response object used to send the response.
//  * @returns {void} - 
//  * Author: Magesh M, 21 Nov 2024
//  * Update History: 
//  */

// const deleteProfile = asyncHandler(async (req, res) => {

//     try {
//         const user = await User.findById(req.user.id)

//         if (!user) {
//             res.status(401)
//             throw new Error('User not found')
//         }
//         const { profileId } = req.body

//         const _userRole = await UserRole.findOne({_id:user.roleId})

//         if(_userRole.name !== userBrokerRole){
//             res.status(404)
//             throw new error("User Role Does not Match")
//         }

//         const _brokerId = await Broker.findOne({userId:user._id})

//         const _marriageProfile = await MarriageProfile.findOne({_id: profileId})
   
//         if (_brokerId._id.toString() !== _marriageProfile.brokerId.toString()) {
//             res.status(404)
//             throw new error("Unauthorized access")
//         }
        
//         const _marriageProfileDetail = await MarriageProfile.findOne({ _id: profileId })

//         if (!_marriageProfileDetail) {
//             res.status(404)
//             throw new Error('profile detail not found')
//         }

//         await removeAllProfileImageByID(profileId, null, req.user.id)

//         //Remove profileID inside the broker
//         await Broker.findByIdAndUpdate(_marriageProfileDetail.brokerId, {
//             $pull: {
//                 profileIds: {
//                     _id: _marriageProfileDetail._id
//                 }
//             }
//         })

//         await MarriageProfile.deleteOne({ _id: profileId })
//         return res.send({ isSuccess: true, message: "Profile deleted successfully" })
//     }
//     catch (err) {
//         errorfunction.errorHandler(err, req, res)
//     }

// })


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

const getAdminApprovedProfiles = asyncHandler(async(req,res,next)=>{

    try {
        const user = await User.findById(req.user.id)
        // console.log(req.user.id)
        let _skip = 1;
        let _pagesize = 10;

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        const {searchBrokerId, skip, pagesize } = req.body
        // console.log(req.body)

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

        let query = {};
        let _brokerId = searchBrokerId

        if (!_brokerId) {
            const _userRole = await UserRole.findOne({ _id: user.roleId });
        //   console.log(_userRole)
            if (_userRole.name == userBrokerRole) {
                let _brokerDetail = await Broker.findOne({ userId: req.user.id });
                _brokerId = _brokerDetail._id
                // console .log(_brokerDetail)
            }
        }
        else {
            _brokerId = searchBrokerId
        }
       
        query.brokerId = _brokerId
        query.isBrokerApproved = true
        query.isAdminApproved = false


        const _marriageProfileList = await MarriageProfile.find(query).skip(_skip).limit(_pagesize)
        // console.log(_marriageProfileList)

        const _totalRecord = await MarriageProfile.find(query).countDocuments()
        // console.log(_totalRecord)
        const imageUrlList = await Promise.all(
            (await _marriageProfileList).map(async (doc) => {
                // Perform asynchronous operations here if needed
                let imageurl = await getPrfileimageUrl(_brokerId, doc._id)

                return { "profileID": doc.profileID, "imageUrl": imageurl };
            }),
            
        );
        // console.log(imageUrlList)
        res.status(200).json({ "adminApprovedProfiles": _marriageProfileList, "adminApprovedTotal": Math.ceil(_totalRecord / _pagesize), "adminApprovedImagesList": imageUrlList, "adminApprovedTotals": _totalRecord })

    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})




const getBrokerCreatedProfiles = asyncHandler(async(req,res)=>{
    try {
        const user = await User.findById(req.user.id)

        let _skip = 1;
        let _pagesize = 10;

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        const {searchBrokerId,skip,pagesize } = req.body
            
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

         let query = {isBrokerApproved: true, isAdminApproved: false};

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

        const _marriageProfileList = await MarriageProfile.find(query)
        .skip(_skip).limit(_pagesize)

        const _totalRecord = await MarriageProfile.find(query).countDocuments()

        const imageUrlList = await Promise.all(
            (await _marriageProfileList).map(async (doc) => {
                // Perform asynchronous operations here if needed
                let imageurl = await getPrfileimageUrl(_brokerId, doc._id)

                return { "profileID": doc.profileID, "imageUrl": imageurl };
            })
        
        );
        res.status(200).json({ "brokerCreatedProfiles": _marriageProfileList, "recourd": Math.ceil(_totalRecord / _pagesize), "brokerCreatedprofileImageList": imageUrlList, "recourds": _totalRecord})

    }
    catch (error) {
        // Error handling function
        res.status(500).json({ error: error.message });
    }
})

const getBrokerApprovedProfiles = asyncHandler(async(req,res)=>{
    try{
       const user = await User.findOne(req.user.id)
       console.log(user)

       let _skip = -1
       let _pagesize = 10

       if(!user){
        res.send("User not found")
       }
       
       const {searchBrokerId,pagesize,skip} = req.body
       console.log(req.body)

       if(pagesize){
         if(skip === 1){
            _skip = -1
            _pagesize = pagesize
         }
         else{
            _skip =((skip -1) * pagesize)
            _pagesize = pagesize
         }
         if(_pagesize > 10){
            _pagesize = 10
         }
       }

       let query ={isBrokerApproved:true,isAdminApproved:false}
       let _brokerId = searchBrokerId

     if(!_brokerId){
        const _userRole = await UserRole.findOne({_id: user.roleId})

        if(_userRole.name == userBrokerRole){
            const _brokerDetail = await Broker.findOne({userId: req.user.id})
            _brokerId = _brokerDetail.id
        }
     }
     else{
        _brokerId = searchBrokerId
     }

     query.brokerId = _brokerId
    //  query.isBrokerApproved = true
    //  query.isAdminApproved = false
    
     const _pendingProfiles = await MarriageProfile.find(query).skip(_skip).limit(pagesize)
     const _totalRecord = await MarriageProfile.find(query).countDocuments
     console.log(_pendingProfiles)
     console.log(_totalRecord)

     const imageUrlList = await Promise.all(
        (await _pendingProfiles).map(async (doc) => {
            // Perform asynchronous operations here if needed
            let imageurl = await getPrfileimageUrl(_brokerId, doc._id)

            return { "profileID": doc.profileID, "imageUrl": imageurl };
        }),
        res.status(200).json({"brokerApprovedProfiles":_pendingProfiles, "totalRecourd": _totalRecord, "brokerApprovedprofileImageList":imageUrlList, })
    
    );
    }
    
   catch (error) {
            // Error handling function
            res.status(500).json({ error: error.message });
        }
    });
    
const aprroveProfileByAdmin = asyncHandler(async(req,res)=>{
    try{
        
        const profileUpdated = await MarriageProfile.findByIdAndUpdate(profileId,{isAdminApproved: true,new:approved});
        res.status(200).json({message:"Profile approved by Admin", profile:profileUpdated})
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
})


module.exports = {
    // registerProfile,
    // updateProfile,
    // getAllProfilesByBrokerId,
    // getProfileDetailsById,
    // getBrokerDetailsById,
    // searchProfile,
    // deleteProfile,
    // updateHoroscope,
    // setProfilePhoto,
    aprroveProfileByAdmin,
    getBrokerApprovedProfiles,
    getBrokerCreatedProfiles,
    getAdminApprovedProfiles,
    // userFind
}

const asyncHandler = require('express-async-handler')
const User = require('../../models/userModel')
const Broker = require('../../models/brokerModel')
const PUMarriageProfile = require('../../models/PUMarriageProfileModel')
const UserRole = require('../../models/userRoleModel')
const ValidationConfig = require('../../models/validationConfigModel')
const { errorfunction, fieldValidationfunction } = require('../commonController')
const { getPrfileimageUrl, getPUProfileImageUrl } = require('../../azureservice/commonService');
const { removeAllProfileImageByID } = require('../../azureservice/fileUploadService');
const PlanSchedule = require('../../models/PUPlanScheduleModel')
const PublicUser = require('../../models/PUMarriageProfileModel')
const userBrokerRole = "Broker"
const userPublicUserRole = "User"
const ObjectId = require('mongodb')
const USER_ROLE_USER = "User"
const MarriageProfile = require('../../models/marriageProfileModel')
const {PUPlanFunction} = require ('../../reUsable/PUPlanFuntion')


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

        // let _brokerId
        let createdProfileId
        const { name, maritalstatus, qualification, additionalQualification, phoneNumber, contactPerson, job, salary, fatherOccupation, motherOccupation,
            sex, religion, foodPreference, motherTongue, caste, subcaste, address1, address2,
            isWidow, brokerId, star, rasi, DOBBirth, POB, birthTime, district, state, sistersMarried,
            sistersUnmarried, brothersMarried, brothersUnmarried, notes, status, fatherName, motherName, colour, height, weight, bloodGroup, jobDescription, jobLocation,
            foreignCountry, settledLocation, dhosam, selfDescription, expectationFromMarriage, birthHour, birthMin, meridiem } = req.body.data
        
        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'RegisterUser', fieldName: key })
            for (const currentObject of arrValidation) {

                let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);

                }
            }

        }

         const _userRole = await UserRole.findOne({ _id: userExists.roleId })
        if (_userRole.name !== USER_ROLE_USER) {
            res.status(404)
            throw new error("error")
        }

        const _user = await PUMarriageProfile.findOne({ userId: userExists._id })
        let userId;
        userId = _user._id

        let profile = await PUMarriageProfile.findByIdAndUpdate(
            userId,
            {
                $set: {
                    // userId: userExists._id,
                    // name: name,
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
                    status: "New",
                    // profileID: maxProfileId,
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
                    isBrokerApproved: true,
                    isAdminApproved: false,
                    birthHour: birthHour,
                    birthMin: birthMin,
                    meridiem: meridiem,
                    expectationFromMarriage:expectationFromMarriage,
                    createdBy: req.user.id,
                    updatedBy: req.user.id,
                    updatedAt: new Date(),
                    createdAt: new Date()
                }
            },
            {
                new: true, runValidators: true
            }
        )


        if (!profile) {
            res.status(500).json({ isSuccess: false, message: 'Error updating profile' });
            return;
        }

        res.status(200).json({
            isSuccess: true,
            message: 'Profile Created successfully',
            Id: profile._id
        });


    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


const getProfileDetailsById = asyncHandler(async (req, res) => {

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

        const { profileId } = req.body

        const _marriageProfileDetail = await PUMarriageProfile.findOne({ _id: profileId })

          if( user._id.toString () !== _marriageProfileDetail.userId.toString()){
             res.status(404)
            throw new error("Unauthorized access")
        }

        if(_marriageProfileDetail.status == "Deleted"){
            res.status(404)
            throw new Error('profile detail not found')
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

        const { profileId } = req.body

        const _userRole = await UserRole.findOne({ _id: user.roleId })

        if (_userRole.name !== userPublicUserRole) {
            res.status(404)
            throw new error("User Role Does not Match")
        }

        const marriageProfileDetails = await PUMarriageProfile.findOne({ _id: profileId })

        if(user._id .toString() !== marriageProfileDetails.userId.toString()){
            res.status(404)
            throw new error("Unauthorized access")
        }

        const _marriageProfileDetail = await PUMarriageProfile.findByIdAndUpdate({ _id: profileId },{ $set: { status: "Deleted" }})

         if (!_marriageProfileDetail) {
            res.status(404)
            throw new Error('profile detail not found')
        }

        const marriageProfileDetail = await MarriageProfile.updateMany({ publicProfId: profileId },{ $set: { status: "Deleted" }})

        if (!marriageProfileDetail) {
            res.status(404)
            throw new Error('profile detail not found')
        }

        return res.send({ isSuccess: true, message: "Profile deleted successfully" })

    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})

const publicUserDetails = asyncHandler(async (req, res) => {
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

        const { userId } = req.body;


        if (!userId) {
            const userRole = await UserRole.findById({ _id: user.roleId })

            if (userRole.name !== USER_ROLE_USER) {
                throw new Error('Unauthorized access!!')
            }

            else {
                const userDetails = await User.findById(user.id)

                const _publicUser = await PUMarriageProfile.findOne({ userId: userDetails._id })
                
                res.send({ isSuccess: true,
                     publicuserDetails: userDetails,
                     publicuserId: _publicUser._id ,
                     publicuserRegister :_publicUser,
                     publicUser:_publicUser.status,
                     planID:_publicUser.planID})
            }
        }

    }

    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

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

        // Extract fields from the request body
        const { profileId, name, maritalstatus, qualification, additionalQualification,phoneNumber, job, salary, fatherOccupation, motherOccupation,
            sex, religion, caste, subcaste, address1, address2,
            isWidow, brokerId, star, rasi, DOBBirth, POB, birthTime, district, state, sistersMarried,
            sistersUnmarried, brothersMarried, brothersUnmarried, notes, status, fatherName, motherName, colour, height, weight, bloodGroup, jobDescription, jobLocation,
            foreignCountry, settledLocation, dhosam, selfDescription, contactPerson, foodPreference, motherTongue, expectationFromMarriage, birthHour, birthMin, meridiem } = req.body.data

        for (const [key, value] of Object.entries(req.body.data)) {
            if (value != undefined && value != null && value !="") {
                let arrValidation = await ValidationConfig.find({ formName: 'RegisterUser', fieldName: key })
                for (const currentObject of arrValidation) {

                    let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                    if (message != '') {
                        res.status(400)
                        console.log(message)
                        throw new Error(message);

                    }
                }
            }
        }

        const _userRole = await UserRole.findOne({ _id: user.roleId })
        if (_userRole.name !== USER_ROLE_USER) {
            res.status(404)
            throw new error("error")
        }

        // const _BrokerId = await Broker.findOne({userId:user._id})

        // const _marriageProfiles = await PUMarriageProfile.findOne({_id: profileId})

        // if (_BrokerId._id.toString() !== _marriageProfiles.brokerId.toString()) {
        // res.status(401)
        // throw new Error('Unauthorized access!!')
        // }
        
        // Fetch the marriage profile based on profileId
        const _marriageProfileDetail = await PUMarriageProfile.findById(profileId);
        
        if (!_marriageProfileDetail) {
            res.status(404).json({ isSuccess: false, message: 'Profile detail not found' });
            return;
        }

           if( user._id.toString () !== _marriageProfileDetail.userId.toString()){
             res.status(404)
            throw new error("Unauthorized access")
        }

        const oldProfile = await PUMarriageProfile.findOne({ _id: profileId }).lean()

        // Update the horoscope section of the MarriageProfile document
        let updatedProfile = await PUMarriageProfile.findByIdAndUpdate(
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
                    birthTime: birthTime,
                    district,
                    state,
                    sistersMarried,
                    sistersUnmarried,
                    brothersMarried,
                    brothersUnmarried,
                    notes,
                    status:"New",
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
                    birthHour: birthHour,
                    birthMin: birthMin,
                    meridiem: meridiem,
                    updatedBy: req.user.id,
                    updatedAt: new Date(),
                }
            },
            {
                new: true, runValidators: true
            }
            // runValidators: true ==> it will give updated new record
            //runValidators: true  ==> throw validation error as per validation defined in model
        );

        if (!updatedProfile) {
            res.status(500).json({ isSuccess: false, message: 'Error updating profile' });
            return;
        }

        res.status(200).json({
            isSuccess: true,
            message: 'Profile updated successfully',
            updatedProfile: updatedProfile
        });

    } catch (err) {
        errorfunction.errorHandler(err, req, res)
        res.status(500).json({ isSuccess: false, message: 'Internal server error', error: err.message });
    }
});

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

        const { brokerId } = req.body.data

        const publicUser = await PUMarriageProfile.findOne({ userId: user._id })

        if (!publicUser) {
            return res.status(404).json({ isSuccess: false, message: 'Public user profile not found' })
        }

        const _userRole = await UserRole.findOne({ _id: user.roleId })
        if (_userRole.name !== USER_ROLE_USER) {
            res.status(404)
            throw new error("error")
        }

        const _publicUser = await MarriageProfile.findOne({ publicProfId: publicUser._id, brokerId: brokerId })

        if (_publicUser) {
            return res.status(200).json({ isSuccess: false, message: 'Profile already registered with this broker' })
        }

        //    if (!brokerId) {
        //             const _userRole = await UserRole.findOne({ _id: userExists.roleId });
        //             if (_userRole.name == userBrokerRole) {
        //                 let _brokerDetail = await Broker.findOne({ userId: req.user.id });
        //                 _brokerId = _brokerDetail._id
        //             }
        //         }
                
          let  _brokerId = brokerId  

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
            brokerId: brokerId,
            publicProfId: publicUser._id,
            profileID: maxProfileId,
        })

        await newMarriageProfile.save()

        res.status(200).json({ isSuccess: true, message: 'Profile registered successfully' })
    } catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


const getMarriageProfileDetailById = asyncHandler(async (req, res) => {

    try {
        const user = await User.findById(req.user.id )

        if (!user) {
            res.status(404)
            throw new Error('User not found')
        }
        else if(user.isLoggedin !== true)
        {
            res.status(404)
            throw new Error('User not logged in')
        }

        const { profileId } = req.body

          const publicUser = await PublicUser.findOne({ userId: req.user.id })
       
            if (!publicUser) {
              res.status(404);
              throw new Error("Public profile not found")
            }

            if(user._id.toString() !== publicUser.userId.toString()){
               res.status(404)
               throw new error("Unauthorized access")
            }

          const plan = await PlanSchedule.findOne({profileID:publicUser._id})

          if(!plan){
              res.status(404)
              throw new error("Plan not found")
            }
       
              const planId = publicUser.planID;
     
              const _plan = await PlanSchedule.findOne({
                profileID: publicUser._id,
                'planSchedule.planID': planId
              })

              if (_plan && _plan.planSchedule && _plan.planSchedule.length > 0) {
                const firstSchedule = _plan.planSchedule[0];
                const expiryDate = new Date(firstSchedule.expiryDate);
                const todayDate = new Date();
        
                if(todayDate >= expiryDate) {
                  return
                }
            }

        const userProfile = await PUMarriageProfile.findOne({ userId: user.id })   

        let errorMessage = PUPlanFunction.checkPlanValidation(userProfile._id, userProfile.planID, 'View')
        if (errorMessage != "") {

        }

        const _ProfileDetail = await MarriageProfile.findOne({ _id: profileId })
            .select('-contactPerson -phoneNumber -address1 -address2 -notes');

        if (!_ProfileDetail) {
            res.status(404)
            throw new Error('profile detail not found')
        }

        const _brokerDetail = await Broker.findOne({ _id: _ProfileDetail.brokerId })

        // const horoscope = _ProfileDetail.horoScope?.toObject?.() || _ProfileDetail.horoScope;
        
        // if (Object.keys(horoscope).length > 0) {
        //     _ProfileDetail.horoScope = { profileId: _ProfileDetail._id }
        // }
        // else 
        //     _ProfileDetail.horoScope = null

            PUPlanFunction.CountProfileViewDownload(userProfile._id, userProfile.planID, 'View')
            res.status(200).json({ MarriageprofileDetail: _ProfileDetail, BrokerDetails: _brokerDetail })
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

const getHoroscopeDetailsById = asyncHandler(async (req, res) => {
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

        const { profileId } = req.body
        
        const userProfile = await PUMarriageProfile.findOne({ userId: user.id })

        const planId = userProfile.planID;
                     
                   const _plan = await PlanSchedule.findOne({
                       profileID: userProfile._id,
                       'planSchedule.planID': planId
                    })
                
                    if (_plan && _plan.planSchedule && _plan.planSchedule.length > 0) {
                        const firstSchedule = _plan.planSchedule[0];
                        const expiryDate = new Date(firstSchedule.expiryDate);
                        const todayDate = new Date();
                        
                        if(todayDate >= expiryDate) {
                             return
                        }
                   }

         let errorMessage = await PUPlanFunction.checkPlanValidation(userProfile._id, userProfile.planID, 'View')

        if (errorMessage != "") {

        }
         let _marriageProfileDetail = await MarriageProfile.findOne({ _id: profileId })
            .select('-contactPerson -phoneNumber -POB -address1 -address2');
        // console.log(_marriageProfileDetail)

        // const hror = _marriageProfileDetail.horoScope
        // console.log(hror)

        // const brokDetails = await Broker.findOne({ _id: _marriageProfileDetail.brokerId })

        if (!_marriageProfileDetail) {
            res.status(404)
            throw new Error('profile detail not found')
        }

        // if (_marriageProfileDetail.brokerId.toString() !== brokDetails._id.toString()) {
        //     res.status(404)
        //     throw new Error('Unauthorized access!!')
        // }

        let result = await PUPlanFunction.CountProfileViewDownload(userProfile.id, userProfile.planID, 'Download', profileId)

        if (result.isSuccess) {
            return res.send({ "isSuccess": true, "message": result.message, "data":_marriageProfileDetail.horoScope})
        }
        else {
            return res.send({ "isSuccess": false, "message": result.message, "data": {} })
        }

    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


/**
 * Function Description: to update horoscope
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Deepika A, 25 June 2025
 * Update History: 
 */

const UpdatePUHoroscope = asyncHandler(async (req, res) => {
    try {
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

        // Extract fields from the request body
        const {
            profileId, meshaR, vrishbaR, mithunaR, karkataR, simhaR, kanyaR, tulaR, vrishikaR,
            dhanuR, makaraR, khumbhaR, meenaR, meshaA, vrishbaA, mithunaA, karkataA, simhaA, kanyaA,
            tulaA, vrishikaA, dhanuA, makaraA, khumbhaA, meenaA, dhasa, year, month, day
        } = req.body;

        const _userRole = await UserRole.findOne({ _id: user.roleId })
        if (_userRole.name !== USER_ROLE_USER) {
            res.status(404)
            throw new error("error")
        }

        const _PUMarriageprofileDetails = await PUMarriageProfile.findById(profileId);

        if (!_PUMarriageprofileDetails) {
            res.status(404).json({ isSuccess: false, message: 'Profile detail not found' });
            return;
        }

         if( user._id.toString () !== _PUMarriageprofileDetails.userId.toString()){
             res.status(404)
            throw new error("Unauthorized access")
        }

        let updatedProfile = await PUMarriageProfile.findByIdAndUpdate(
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

        if(!updatedProfile){
            res.status(500).json({isSuccess:false, message: 'Error updating profile'})
        }

         res.status(200).json({
            isSuccess: true,
            message: 'Horoscope updated successfully',
            updatedProfile: updatedProfile
        });
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

module.exports = {
    registerProfile,
    getProfileDetailsById,
    deleteProfile,
    publicUserDetails,
    updateProfile,
    PUProfileRegisterInMarriageProfileTable,
    getMarriageProfileDetailById,
    getHoroscopeDetailsById,
    UpdatePUHoroscope
}
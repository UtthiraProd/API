const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const Broker = require('../models/brokerModel')
const MarriageProfile = require('../models/marriageProfileModel')
const { errorfunction } = require('./commonController')
const { removeAllProfileImageByID } = require('../azureservice/fileUploadService');

const deleteProfile = asyncHandler(async (req, res) => {

    try {

        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        const { profileId } = req.body.data;

        const _marriageProfileDetail = await MarriageProfile.findOne({ _id: profileId })

        if (!_marriageProfileDetail) {
            res.status(404)
            throw new Error('profile detail not found')
        }

        await removeAllProfileImageByID(profileId, null, req.user.id)

        //Remove profileID inside the broker
        await Broker.findByIdAndUpdate(_marriageProfileDetail.brokerId, {
            $pull: {
                profileIds: {
                    _id: _marriageProfileDetail._id
                }
            }
        })

        await MarriageProfile.deleteOne({ _id: profileId })
        return res.send({ isSuccess: true, message: "Profile deleted successfully" })
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

        const { profileId } = req.body
        const _marriageProfileDetail = await MarriageProfile.findOne({ _id: profileId })



        if (!_marriageProfileDetail) {
            res.status(404)
            throw new Error('profile detail not found')
        }

        res.status(200).json(_marriageProfileDetail)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})

const getBrokerDetailsById = asyncHandler(async (req, res) => {

    try {

        let _brokerId
        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(401)
            throw new Error('User not found')
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

const registerProfile = asyncHandler(async (req, res) => {
    try {
        let _brokerId
        let createdProfileId
        const { name, maritalstatus, qualification, phoneNumber, job, salary, fatherOccupation, motherOccupation,
            sex, religion, caste, subcaste, address1, address2,
            isWidow, brokerId, star, rasi, DOBBirth, POB, birthTime, district, state, sistersMarried,
            sistersUnmarried, brothersMarried, brothersUnmarried, notes, status, fatherName, motherName, colour, height, weight, bloodGroup, jobDescription, jobLocation,
            foreignCountry, settledLocation, dhosam, selfDescription ,description} = req.body.data

        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'RegisterProfile', fieldName: key })
            for (const currentObject of arrValidation) {

                let message = ValidateFields(currentObject, value);

                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);

                }
            }

        }
        // console.log(req.body) 

        const userExists = await User.findById(req.user.id)

        console.log(userExists)
        if (!userExists) {
            res.status(400)
            throw new Error('User not found')
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
            caste: caste,
            subcaste: subcaste,
            state: state,
            phoneNumber: phoneNumber,
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
            description:description

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
const updateProfile = asyncHandler(async (req, res) => {
    try {
        // Fetch the user who is trying to update the horoscope
        const user = await User.findById(req.user.id);

        if (!user) {
            res.status(401).json({ isSuccess: false, message: 'User not found' });
            return;
        }

        // Extract fields from the request body
        const { profileId, name, maritalstatus, qualification, phoneNumber, job, salary, fatherOccupation, motherOccupation,
            sex, religion, caste, subcaste, address1, address2,
            isWidow, brokerId, star, rasi, DOBBirth, POB, birthTime, district, state, sistersMarried,
            sistersUnmarried, brothersMarried, brothersUnmarried, notes, status, fatherName, motherName, colour, height, weight, bloodGroup, jobDescription, jobLocation,
            foreignCountry, settledLocation, dhosam, selfDescription,description } = req.body.data

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
                    name: name,
                    maritalstatus: maritalstatus,
                    qualification: qualification,
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
                    birthTime,
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
                    description:description
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
            message: 'Profile updated successfully',
            updatedProfile: updatedProfile
        });

    } catch (err) {
        errorfunction.errorHandler(err, req, res)
        res.status(500).json({ isSuccess: false, message: 'Internal server error', error: err.message });
    }
});



module.exports={
    deleteProfile,
    getProfileDetailsById,
    getBrokerDetailsById,
    registerProfile,
    updateProfile}
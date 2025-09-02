const asyncHandler = require('express-async-handler')
const MarriageProfile = require('../../models/marriageProfileModel')
const Broker = require('../../models/brokerModel')
const User = require('../../models/userModel')
const { errorfunction } = require('../commonController')


/**
 * Function Description: gets the KPIs of dashboard.
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @param {function} next - A callback to the next middleware in the stack.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getDashboardDetailByBrokerId = asyncHandler(async (req, res) => {

    try {
        console.log("dashboard")
        // get user using the id in the JWT
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

        if (!user.isBroker) {
            res.status(401)
            throw new Error('Not a valid broker')
        }

        const broker = await Broker.findOne({ userId: req.user.id })

         if(broker.isActive !== true ){
           throw new Error('Broker isActive is false')
        }

        if (!broker) {
            res.status(404)
            throw new Error('Broker not found')
        }

        if (broker.userId != req.user.id) {
            res.status(401)
            throw new Error('Unauthorized access')
        }

        //Profile Summary KPIs

        //Total profiles
        const totalCount = await MarriageProfile.find({status:["New", "Marriage fixed - Payment Incomplete","Marriage fixed - Payment Complete"],brokerId:broker._id}). countDocuments();
        const totalMale = await MarriageProfile.find({status:["New", "Marriage fixed - Payment Incomplete","Marriage fixed - Payment Complete"],sex:"Male",brokerId:broker._id}). countDocuments();
        const totalFemale = await MarriageProfile.find({status:["New", "Marriage fixed - Payment Incomplete","Marriage fixed - Payment Complete"],sex:"Female",brokerId:broker._id}). countDocuments();

        //Total profiles available for match
        const totalAvailable = await MarriageProfile.find({status:["New"],brokerId:broker._id}). countDocuments();
        const totalAvailableMale = await MarriageProfile.find({status:["New"],sex:"Male",brokerId:broker._id}). countDocuments();
        const totalAvailableFemale = await MarriageProfile.find({status:["New"],sex:"Female",brokerId:broker._id}). countDocuments();

        //Total profiles - marriage fixed & payment incomplete
        const totalPayIncomplete = await MarriageProfile.find({status:["Marriage fixed - Payment Incomplete"],brokerId:broker._id}). countDocuments();
        const totalPayIncompleteMale = await MarriageProfile.find({status:["Marriage fixed - Payment Incomplete"],sex:"Male",brokerId:broker._id}). countDocuments();
        const totalPayIncompleteFemale = await MarriageProfile.find({status:["Marriage fixed - Payment Incomplete"],sex:"Female",brokerId:broker._id}). countDocuments();

        //Total profiles - marriage fixed & payment complete
        const totalPayComplete = await MarriageProfile.find({status:["Marriage fixed - Payment Complete"],brokerId:broker._id,brokerId:broker._id}). countDocuments();
        const totalPayCompleteMale = await MarriageProfile.find({status:["Marriage fixed - Payment Complete"],sex:"Male",brokerId:broker._id}). countDocuments();
        const totalPayCompleteFemale = await MarriageProfile.find({status:["Marriage fixed - Payment Complete"],sex:"Female",brokerId:broker._id}). countDocuments();
    
        //Total unmarried profiles available for match
        const totalUnMarriedCount = await MarriageProfile.find({status:["New"],maritalstatus:["Unmarried"],brokerId:broker._id}). countDocuments();
        const totalUnMarriedMale = await MarriageProfile.find({status:["New"],maritalstatus:["Unmarried"],sex:"Male",brokerId:broker._id}). countDocuments();
        const totalUnMarriedFemale = await MarriageProfile.find({status:["New"],maritalstatus:["Unmarried"],sex:"Female",brokerId:broker._id}). countDocuments();

        //Total Widowed profiles available for match
        const totalWidowCount = await MarriageProfile.find({status:["New"],maritalstatus:["Widowed"],brokerId:broker._id}). countDocuments();
        const totalWidowMale = await MarriageProfile.find({status:["New"],maritalstatus:["Widowed"],sex:"Male",brokerId:broker._id}). countDocuments();
        const totalWidowFemale = await MarriageProfile.find({status:["New"],maritalstatus:["Widowed"],sex:"Female",brokerId:broker._id}). countDocuments();

        //Total Divorced/Awaiting Divorce profiles available for match
        const totalDivorcedCount = await MarriageProfile.find({status:["New"],maritalstatus:["Divorced","Awaiting Divorce"],brokerId:broker._id}). countDocuments();
        const totalDivorcedMale = await MarriageProfile.find({status:["New"],maritalstatus:["Divorced","Awaiting Divorce"],sex:"Male",brokerId:broker._id}). countDocuments();
        const totalDivorcedFemale = await MarriageProfile.find({status:["New"],maritalstatus:["Divorced","Awaiting Divorce"],brokerId:broker._id}). countDocuments();

        const dashboardDetails = {totalCount, totalMale, totalFemale, 
        totalAvailable, totalAvailableMale, totalAvailableFemale,
        totalPayIncomplete, totalPayIncompleteMale, totalPayIncompleteFemale, 
        totalPayComplete, totalPayCompleteMale, totalPayCompleteFemale, 
        totalUnMarriedCount, totalUnMarriedMale, totalUnMarriedFemale, totalWidowCount, 
        totalWidowMale, totalWidowFemale, totalDivorcedCount, totalDivorcedMale, 
        totalDivorcedFemale
        } 
        res.status(200).json(dashboardDetails);
        console.log("dashboard")
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})

module.exports = {getDashboardDetailByBrokerId}
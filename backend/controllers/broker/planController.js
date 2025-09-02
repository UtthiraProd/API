const asyncHandler = require('express-async-handler')
const PlanCatagory = require('../../models/planModel')
const Broker = require('../../models/brokerModel')
const User = require('../../models/userModel')
const PlanSchedule = require('../../models/planScheduleModel')
const MarriageProfile = require('../../models/marriageProfileModel')
const ValidationConfig = require('../../models/validationConfigModel')
const { errorfunction, fieldValidationfunction } = require('../commonController')


/**
 * Function Description: to create plan schedule
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Nalini A Krishnan, 9 Apr 2024
 * Update History: 
 */

const createPlanSchedule = asyncHandler(async (req, res) => {
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

        const { profileID, planID, planPeriod, planDuration, viewCountLimit, downloadCountLimit, viewImageCountLimit } = req.body.data;

        let balanceAmount;
        let planCost;

        const broker = await Broker.findOne({ userId: user.id })
        balanceAmount = broker.balanceAmount

        const plan = await PlanCatagory.findOne({ _id: planID })
        planCost = plan.planCost

        if (balanceAmount < planCost) {
            return res.status(200).json({ isSuccess: false, message: "Insufficient balance to activate this plan." });
        }


        const existingSchedule = await PlanSchedule.findOne({
            profileID: profileID,
            'planSchedule.planID': planID,
            'planSchedule.expiryDate': { $gte: new Date() }  // Check for active (not yet expired) plan
        });

        if (existingSchedule) {
            return res.status(200).json({ isSuccess: false, message: 'The plan already exists for this profile.' });
        }


        // calculate expiry date
        let planDays;
        if (planPeriod === "Week") {
            planDays = 7;
        } else if (planPeriod === "Month") {
            planDays = 28;
        }
        else if (planPeriod == "Daily") {
            planDays = 1;
        }
        else {
            console.log("Incorrect plan period");
            return;
        }

        const totalDaysOfPlan = planDuration * planDays;
        let today = new Date();
        let expiryDate = new Date(today.setDate(today.getDate() + totalDaysOfPlan));


        let planDate = new Date();
        let arrScheduleFields = [];

        // Calculate seriallNo and Date for each schedule
        for (let i = 1; i <= totalDaysOfPlan; i++) {
            let ScheduleFields = {
                seriallNo: i,
                Date: new Date(planDate), // Use the current planDate
                viewCountLimit: viewCountLimit,
                currentViewCount: 0,
                downloadCountLimit: downloadCountLimit,
                currentDownloadCount: 0,
                viewImageCountLimit: viewImageCountLimit,
                currentViewImageCount: 0,
                status: 'Active',
            };

            // Increment the planDate for the next iteration
            planDate.setDate(planDate.getDate() + 1);

            arrScheduleFields.push(ScheduleFields);
        }


        // Storing planScheduleFields
        const planScheduleFields = {
            planID: planID,
            expiryDate: expiryDate,
            isActive: true,
            createdBy: req.user.id,
            createdDate: new Date(),
            updatedBy: req.user.id,
            updatedDate: new Date(),
            Schedule: arrScheduleFields
        };

        console.log(planScheduleFields);

        // Create the planSchedule document
        const schedule = await PlanSchedule.create({
            profileID: profileID,
            isPublicProfile:false,
            planSchedule: [planScheduleFields], // Make sure planSchedule is an array
        });

        if (schedule) {

            var updateAgainst = { _id: profileID }
            var newvalue = {
                $set: {
                    planID: planID
                }
            }
            const _profile = await MarriageProfile.updateOne(updateAgainst, newvalue)

            if (_profile) {
                const _broker = await Broker.updateOne(
                    { _id: broker._id },
                    { $inc: { balanceAmount: -planCost } }
                );

                res.status(200).json({
                    isSuccess: true, message: "Plan Added Successfully..!",

                });
            }
        }
        else {
            return res.status(500).json({ isSuccess: false, message: 'Plan schedule addition was not successful' });
        }
    } catch (err) {
        errorfunction.errorHandler(err, req, res);
    }
});


const balanceQuota = asyncHandler(async (req, res) => {
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

        const { profileId } = req.body.data;

        const profile = await MarriageProfile.findById(profileId);

        if (!profile) {
            res.status(404);
            throw new Error('MarriageProfile not found');
        }

        if (isActive._id.toString() !== profile.brokerId.toString()) {
            res.status(401)
            throw new Error('Unauthorized access!!')
        }

        const planId = profile.planID;
        const planCatagory = await PlanCatagory.findById(planId);
        if (!planCatagory) {
            res.status(404);
            throw new Error('Plan Category not found');
        }

        const planScheduleDoc = await PlanSchedule.findOne({ 'profileID': profile._id, 'planSchedule.planID': planId });

        if (!planScheduleDoc || !planScheduleDoc.planSchedule?.length) {
            res.status(404);
            throw new Error('PlanSchedule not found or empty');
        }

        // Extract the first plan schedule
        const firstSchedule = planScheduleDoc.planSchedule[0];
        const expiryDate = firstSchedule.expiryDate;

        let todayDate = new Date();
        let dateString = todayDate.toDateString()

        const scheduleArray = firstSchedule.Schedule.filter(planView => {
            const scheduledate = new Date(planView.Date).toDateString()
            return scheduledate === dateString
        })

        if (todayDate <= new Date(expiryDate)) {
            console.log("Plan is active");
        }
        else {
            console.log("Plan is expired");
        }

        res.status(200).json({
            isSuccess: true, expiryDate: expiryDate, schedule: scheduleArray, planCatagory: planCatagory
        });
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res);
    }
});


/**
 * Function Description: to increment the todays count after every profile view or profile download
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Nalini A Krishnan, 9 Apr 2024
 * Update History: 
 */


const CountProfileViewDownload = asyncHandler(async (req, res) => {
    // try {
    //     const { profileID, planID, action } = req.body;

    //     // Assuming today is the date you're looking for
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0); // Reset time to 00:00:00.000 for proper date comparison

    //     if (action == 'View') {

    //         // Find the planSchedule document based on userID and planID
    //         const planScheduleDoc = await PlanSchedule.findOneAndUpdate(
    //             {
    //                 'profileID': profileID, // the user ID you're looking for
    //                 'planSchedule.planID': planID, // the plan ID you're looking for
    //                 'planSchedule.Schedule.Date': {
    //                     $gte: today, // Start of today
    //                     $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // End of today (24 hours later)
    //                 },
    //             },
    //             {
    //                 $inc: {
    //                     'planSchedule.$.Schedule.$[elem].currentViewCount': 1  // Increment currentViewCount by 1
    //                 }
    //             },
    //             {
    //                 new: true,  // Return the updated document
    //                 arrayFilters: [{ 'elem.Date': { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } }]  // Ensure correct schedule element is selected
    //             }
    //         );

    //         if (planScheduleDoc) {
    //             console.log("Successfully incremented view count.");
    //             res.send({ isSuccess: true, message: 'View count incremented successfully' });
    //         } else {
    //             return res.status(500).json({ isSuccess: false, message: 'View count increment unsuccessful' });
    //         }

    //     } else if (action == 'Download') {

    //         // Find the planSchedule document based on userID and planID
    //         const planScheduleDoc = await PlanSchedule.findOneAndUpdate(
    //             {
    //                 'profileID': profileID, // the user ID you're looking for
    //                 'planSchedule.planID': planID, // the plan ID you're looking for
    //                 'planSchedule.Schedule.Date': {
    //                     $gte: today, // Start of today
    //                     $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // End of today (24 hours later)
    //                 },
    //             },
    //             {
    //                 $inc: {
    //                     'planSchedule.$.Schedule.$[elem].currentDownloadCount': 1  // Increment currentViewCount by 1
    //                 }
    //             },
    //             {
    //                 new: true,  // Return the updated document
    //                 arrayFilters: [{ 'elem.Date': { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } }]  // Ensure correct schedule element is selected
    //             }
    //         );

    //         if (planScheduleDoc) {
    //             console.log("Successfully incremented view count.");
    //             res.send({ isSuccess: true, message: 'Download count incremented successfully' });
    //         } else {
    //             return res.status(500).json({ isSuccess: false, message: 'Download count increment unsuccessful' });
    //         }

    //     }


    // } catch (err) {
    //     errorfunction.errorHandler(err, req, res);
    // }
});



/**
 * Function Description: to increment the todays count after every profile view or profile download
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Nalini A Krishnan, 9 Apr 2024
 * Update History: 
 */


const ViewOrDownloadProfileCountCheck = asyncHandler(async (req, res) => {
    // try {
    //     const { profileID, planID, action } = req.body;
    //     console.log(req.body)
    //     console.log("heeellooooooooooo")

    //     // Assuming today is the date you're looking for
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0); // Reset time to 00:00:00.000 for proper date comparison

    //     // Find the planSchedule document based on userID and planID
    //     const planScheduleDoc = await PlanSchedule.findOne(
    //         {
    //             'profileID': profileID, // the user ID you're looking for
    //             'planSchedule.planID': planID, // the plan ID you're looking for
    //             'planSchedule.Schedule.Date': {
    //                 $gte: today, // Start of today
    //                 $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // End of today (24 hours later)
    //             },
    //         },
    //     );

    //     if (!planScheduleDoc) {
    //         return res.status(404).json({ isSuccess: false, message: 'Plan schedule not found for today' });
    //     }

    //     // Access the specific Schedule entry for today
    //     let scheduleToday = null;
    //     for (let plan of planScheduleDoc.planSchedule) {
    //         scheduleToday = plan.Schedule.find(schedule => {
    //             const scheduleDate = new Date(schedule.Date);
    //             return scheduleDate >= today && scheduleDate < new Date(today.getTime() + 24 * 60 * 60 * 1000); // Check if the Date is today
    //         });
    //         if (scheduleToday) {
    //             break; // Stop searching once we find the entry for today
    //         }
    //     }

    //     if (!scheduleToday) {
    //         return res.status(404).json({ isSuccess: false, message: 'No schedule found for today' });
    //     }


    //     console.log(scheduleToday.currentViewCount);
    //     console.log(scheduleToday.viewCountLimit);
    //     console.log(scheduleToday.currentDownloadCount);
    //     console.log(scheduleToday.downloadCountLimit);

    //     if (action == 'View') {
    //         if (scheduleToday.currentViewCount < scheduleToday.viewCountLimit) {

    //             console.log("You can still view profiles");
    //             res.send({ isSuccess: true, message: 'You can still view profiles' });
    //         } else {
    //             return res.status(500).json({ isSuccess: false, message: 'Your profile view quota for today is exhausted' });
    //         }

    //     } else if (action == 'Download') {

    //         if (scheduleToday.currentDownloadCount < scheduleToday.downloadCountLimit) {
    //             console.log("You can still download profiles");
    //             res.send({ isSuccess: true, message: 'You can still download profiles' });
    //         } else {
    //             return res.status(500).json({ isSuccess: false, message: 'Your profile view quota for today is exhausted' });
    //         }
    //     }
    //     console.log("byeeee")
    // } catch (err) {
    //     errorfunction.errorHandler(err, req, res);
    // }
});


module.exports = {
    balanceQuota,
    createPlanSchedule,
    CountProfileViewDownload,
    ViewOrDownloadProfileCountCheck
}
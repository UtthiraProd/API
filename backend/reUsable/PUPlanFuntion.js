//Application related common function
const PlanCatagory = require('../models/planModel')
const PlanSchedule = require('../models/PUPlanScheduleModel')
const User = require('../models/userModel')
const mongoose = require('mongoose');

var PUPlanFunction = {
    checkPlanValidation: async function (profileID, planID, action) {
       
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayEnd = new Date(today);
        todayEnd.setDate(todayEnd.getDate() + 1);

        let message = ""

        const planScheduleDoc = await PlanSchedule.findOne(
            {
                'profileID': profileID, // the user ID you're looking for
                'planSchedule.planID': planID, // the plan ID you're looking for
                'planSchedule.Schedule.Date': {
                    $gte: today, // Start of today
                    $lt: todayEnd
                },
            },
        );

        if (!planScheduleDoc) {
            return message = 'Plan not availabe, please view your today balance quota'
        }

        // Access the specific Schedule entry for today
        let scheduleToday = null;
        for (let plan of planScheduleDoc.planSchedule) {
            scheduleToday = plan.Schedule.find(schedule => {
                const scheduleDate = new Date(schedule.Date);
                return scheduleDate >= today && scheduleDate < new Date(today.getTime() + 24 * 60 * 60 * 1000); // Check if the Date is today
            });
            if (scheduleToday) {
                break; // Stop searching once we find the entry for today
            }
        }

        if (!scheduleToday) {
            return message = 'No view balance found for today'
        }

        if (action == 'View') {
            if (scheduleToday.currentViewCount < scheduleToday.viewCountLimit) {
                return message;
            } else {
                return message = 'Your profile view quota for today is exhausted'
            }
        }

        if (action == 'Download') {

            if (scheduleToday.currentDownloadCount < scheduleToday.downloadCountLimit) {
                return message;
            } else {
                return message = 'Your profile view quota for today is exhausted'
            }
        }

    },
    CountProfileViewDownload: async function (profileID, planID, action, viewedProfileID) {

        // Step 1: Set start of today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Step 2: Set end of today (start of next day)
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        if (action == 'View') {
            // Find the planSchedule document based on userID and planID
            const planScheduleDoc = await PlanSchedule.findOneAndUpdate(
                {
                    'profileID': profileID, // the user ID you're looking for
                    'planSchedule.planID': planID, // the plan ID you're looking for
                    'planSchedule.Schedule.Date': {
                        $gte: todayStart, // Start of today
                        $lt: todayEnd // End of today (24 hours later)
                    },
                },
                {
                    $inc: {
                        'planSchedule.$.Schedule.$[elem].currentViewCount': 1  // Increment currentViewCount by 1
                    }
                },
                {
                    new: true,  // Return the updated document
                    arrayFilters: [{ 'elem.Date': { $gte: todayStart, $lt: todayEnd } }]  // Ensure correct schedule element is selected
                }
            );

            if (planScheduleDoc) {
                console.log('View count increment unsuccessful')
            }

        }
        if (action == 'ViewImage') {

            // Find the planSchedule document based on userID and planID
            const planScheduleDoc = await PlanSchedule.findOneAndUpdate(
                {
                    profileID: new mongoose.Types.ObjectId(profileID), // the user ID you're looking for
                    'planSchedule.planID': planID, // the plan ID you're looking for
                    'planSchedule.Schedule.Date': {
                        $gte: todayStart, // Start of today
                        $lt: todayEnd // End of today (24 hours later)
                    },
                },
                {
                    $inc: {
                        'planSchedule.$.Schedule.$[elem].currentViewImageCount': 1  // Increment currentViewCount by 1
                    },
                    $push: {
                        'planSchedule.$.Schedule.$[elem].viewedProfile': viewedProfileID,
                    },
                },
                {
                    new: true,  // Return the updated document
                    arrayFilters: [{ 'elem.Date': { $gte: todayStart, $lt: todayEnd } }]  // Ensure correct schedule element is selected
                }
            );

            if (planScheduleDoc) {
                console.log('View count increment unsuccessful')
            }

        }

        if (action == 'Download') {

            let result = { isSuccess: true, message: "" }
            const planScheduleDocForValidation = await PlanSchedule.aggregate([
                {
                    $match: {
                        profileID: new mongoose.Types.ObjectId(profileID),
                        'planSchedule.planID': planID,
                        'planSchedule.Schedule.Date': {
                            $gte: todayStart,
                            $lt: todayEnd
                        }
                    }
                },
                {

                    $addFields: {
                        'planSchedule': {
                            $map: {
                                input: "$planSchedule",
                                as: "plan",
                                in: {
                                    $mergeObjects: [
                                        "$$plan",
                                        {
                                            Schedule: {
                                                $filter: {
                                                    input: "$$plan.Schedule",
                                                    as: "scheduleItem",
                                                    cond: {
                                                        $and: [
                                                            { $gte: ["$$scheduleItem.Date", todayStart] },
                                                            { $lt: ["$$scheduleItem.Date", todayEnd] }
                                                        ]
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }

                    }

                },

                {
                    $match: {
                        "planSchedule.Schedule.0": { $exists: true } // ensure there's at least one schedule item for today
                    }
                }
            ]);

            let downloadCountForPlan;
            let actualDownloadedCount
            if (planScheduleDocForValidation.length > 0) {
                console.log(planScheduleDocForValidation[0]?.planSchedule[0]?.Schedule[0])
                downloadCountForPlan = planScheduleDocForValidation[0].planSchedule[0].Schedule[0].downloadCountLimit;
                actualDownloadedCount = planScheduleDocForValidation[0]?.planSchedule[0]?.Schedule[0]?.currentDownloadCount;
                console.log('actualDownloadedCount' + actualDownloadedCount.toString())
                console.log('downloadCountForPlan' + downloadCountForPlan.toString())
                if ((downloadCountForPlan != 0) && actualDownloadedCount >= downloadCountForPlan) {
                    result.message = "Download count exceeded.Please check your plan"
                    result.isSuccess = false
                    return result
                }
            }


            if (result.isSuccess) {
                result.message = (actualDownloadedCount + 1).toString() + "/" + downloadCountForPlan.toString() + " downloaded successfully"
                result.isSuccess = true
            }
  
            // Find the planSchedule document based on userID and planID
            const planScheduleDoc = await PlanSchedule.findOneAndUpdate(
                {
                    'profileID': profileID, // the user ID you're looking for
                    'planSchedule.planID': planID, // the plan ID you're looking for
                    'planSchedule.Schedule.Date': {
                        $gte: todayStart, // Start of today
                        $lt: todayEnd // End of today (24 hours later)
                    },
                },
                {
                    $inc: {
                        'planSchedule.$.Schedule.$[elem].currentDownloadCount': 1  // Increment currentViewCount by 1
                    },
                    $push: {
                        'planSchedule.$.Schedule.$[elem].downloadedProfile': viewedProfileID,
                    },
                },
                {
                    new: true,  // Return the updated document
                    arrayFilters: [{ 'elem.Date': { $gte: todayStart, $lt: todayEnd } }]  // Ensure correct schedule element is selected
                }
            );

            if (!planScheduleDoc) {
                result.message = "Download count increment unsuccessful"
                result.isSuccess = false
            }
            return result;

        }

    },
    isProfileViewedToday: async function (profileID, planID, viewedProfileID) {

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        let isViewed = false;

        const planScheduleDoc = await PlanSchedule.aggregate([
            {
                $match: {
                    profileID: new mongoose.Types.ObjectId(profileID),
                    'planSchedule.planID': planID,
                    'planSchedule.Schedule.Date': {
                        $gte: todayStart,
                        $lt: todayEnd
                    }
                }
            },
            {
                $addFields: {
                    'planSchedule': {
                        $map: {
                            input: "$planSchedule",
                            as: "plan",
                            in: {
                                $mergeObjects: [
                                    "$$plan",
                                    {
                                        Schedule: {
                                            $filter: {
                                                input: "$$plan.Schedule",
                                                as: "scheduleItem",
                                                cond: {
                                                    $and: [
                                                        { $gte: ["$$scheduleItem.Date", todayStart] },
                                                        { $lt: ["$$scheduleItem.Date", todayEnd] }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    "planSchedule.Schedule.0": { $exists: true } // ensure there's at least one schedule item for today
                }
            }
        ]);


        if (planScheduleDoc.length > 0) {

            planScheduleDoc[0].planSchedule.forEach(plan => {
                plan.Schedule.forEach(scheduleItem => {
                    if (Array.isArray(scheduleItem.viewedProfile)) {
                        scheduleItem.viewedProfile.forEach(_profileID => {

                            if (viewedProfileID.toString() === _profileID.toString()) {
                                isViewed = true
                            }
                        });
                    }
                });
            });
        }
        return isViewed;
    },
    isViewedPlanScheduleLimitExceeded: async function (profileID, planID) {

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        let isViewed = false;
        let result = { isSuccess: true, message: "" }

        const planScheduleDoc = await PlanSchedule.aggregate([
            {
                $match: {
                    profileID: new mongoose.Types.ObjectId(profileID),
                    'planSchedule.planID': planID,
                    'planSchedule.Schedule.Date': {
                        $gte: todayStart,
                        $lt: todayEnd
                    }
                }
            },
            {
                $addFields: {
                    'planSchedule': {
                        $map: {
                            input: "$planSchedule",
                            as: "plan",
                            in: {
                                $mergeObjects: [
                                    "$$plan",
                                    {
                                        Schedule: {
                                            $filter: {
                                                input: "$$plan.Schedule",
                                                as: "scheduleItem",
                                                cond: {
                                                    $and: [
                                                        { $gte: ["$$scheduleItem.Date", todayStart] },
                                                        { $lt: ["$$scheduleItem.Date", todayEnd] }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    "planSchedule.Schedule.0": { $exists: true } // ensure there's at least one schedule item for today
                }
            }
        ]);

        if (planScheduleDoc.length > 0) {
            let viewCountForPlan = planScheduleDoc[0].planSchedule[0].Schedule[0].viewImageCountLimit;
            let actualViewedCount = planScheduleDoc[0]?.planSchedule[0]?.Schedule[0]?.viewedProfile.length || 0;

            if ((actualViewedCount != 0) && actualViewedCount >= viewCountForPlan) {
                result.message = "View count exceeded.Please check your plan"
                result.isSuccess = false
            }
            else {
                result.message = (actualViewedCount + 1) + "/" + viewCountForPlan + " viewed"
            }

        }
        return result;
    },
    getTodayImageViewedProfiles: async function (profileID, planID) {

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        let isViewed = false;
        let message = ""

        const planScheduleDoc = await PlanSchedule.aggregate([
            {
                $match: {
                    profileID: new mongoose.Types.ObjectId(profileID),
                    'planSchedule.planID': planID,
                    'planSchedule.Schedule.Date': {
                        $gte: todayStart,
                        $lt: todayEnd
                    }
                }
            },
            {
                $addFields: {
                    'planSchedule': {
                        $map: {
                            input: "$planSchedule",
                            as: "plan",
                            in: {
                                $mergeObjects: [
                                    "$$plan",
                                    {
                                        Schedule: {
                                            $filter: {
                                                input: "$$plan.Schedule",
                                                as: "scheduleItem",
                                                cond: {
                                                    $and: [
                                                        { $gte: ["$$scheduleItem.Date", todayStart] },
                                                        { $lt: ["$$scheduleItem.Date", todayEnd] }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    "planSchedule.Schedule.0": { $exists: true } // ensure there's at least one schedule item for today
                }
            }
        ]);

        if (planScheduleDoc.length > 0 && planScheduleDoc[0]?.planSchedule[0]?.Schedule[0]) {
            console.log(planScheduleDoc[0].planSchedule[0].Schedule[0].viewedProfile)
            return planScheduleDoc[0].planSchedule[0].Schedule[0].viewedProfile;
        }

        return null;
    }

}

module.exports = { PUPlanFunction }

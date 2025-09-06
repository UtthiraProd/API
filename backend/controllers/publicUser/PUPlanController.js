const asyncHandler = require('express-async-handler')
const User = require("../../models/userModel")
const PlanSchedule = require("../../models/PUPlanScheduleModel")
const UserRole = require("../../models/userRoleModel")
const Plan = require("../../models/planModel")
const PlanCatagory = require ('../../models/planModel')
const ValidationConfig = require('../../models/validationConfigModel')
const PUMarriageProfile = require('../../models/PUMarriageProfileModel')
const { errorfunction, fieldValidationfunction } = require('../commonController')
const planScheduleModel = require('../../models/planScheduleModel')
const razorPayment = require("../../models/razorPaymentModel")
const userRole = "User"



/**
 * Function Description: to create plan schedule
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Deepika A, 15 June 2025
 * Update History: 
 */

const upgradePlan = asyncHandler(async (req, res) => {
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

        const { profileID, planID,razorpay_order_id,razorpay_payment_id,razorpay_signature} = req.body.data;

          const Plan = await PlanCatagory.findOne({_id:planID})
        
                if(!Plan){
                    res.status(401);
                    throw new Error("Plan not found");
                }


        for (const [key, value] of Object.entries(req.body.data)) {

            let arrValidation = await ValidationConfig.find({ formName: 'AddEditUserPlan', fieldName: key })
            for (const currentObject of arrValidation) {
                let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);
                }
            }
        }

        const existingSchedule = await PlanSchedule.findOne({
            profileID: profileID,
            'planSchedule.planID': planID,
            'planSchedule.expiryDate': { $gte: new Date() }  // Check for active (not yet expired) plan
        })

        if (existingSchedule) {  
            return res.status(200).json({ isSuccess: false, message: 'The plan already exists for this profile.' });
        }

          const payment = await razorPayment.create({
                    planId:planID,
                    userId:user._id,
                    isPayment:"success",
                    updatedAt:new Date(),
                    updeatedAt:new Date(),
                    razorpayOrderId:razorpay_order_id,
                    razorpayPaymentId:razorpay_payment_id,
                    razorpaySignature:razorpay_signature
                })
        
               if(!payment){
                    return res.status(200).json({isSuccess:false})
                }

        // calculate expiry date
        let planDays;
        if (Plan.planPeriod === "Week") {
            planDays = 7;
        } else if (Plan.planPeriod === "Month") {
            planDays = 28;
        }
        else if (Plan.planPeriod == "Daily") {
            planDays = 1;
        }
        else {
            console.log("Incorrect plan period");
            return;
        }


        const totalDaysOfPlan = Plan.planDuration * planDays;
        let today = new Date();
        let expiryDate = new Date(today.setDate(today.getDate() + totalDaysOfPlan));


        let planDate = new Date();
        let arrScheduleFields = [];

        // Calculate seriallNo and Date for each schedule
        for (let i = 1; i <= totalDaysOfPlan; i++) {
            let ScheduleFields = {
                seriallNo: i,
                Date: new Date(planDate), // Use the current planDate
                viewCountLimit:Plan. viewCountLimit,
                currentViewCount: 0,
                downloadCountLimit:Plan. downloadCountLimit,
                currentDownloadCount: 0,
                viewImageCountLimit:Plan. viewImageCountLimit,
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


        // Create the planSchedule document
        const schedule = await PlanSchedule.create({
            profileID: profileID,
            isPublicProfile: true,
            planSchedule: [planScheduleFields], // Make sure planSchedule is an array
        });
        let planId = schedule.planSchedule[0]

        if (schedule) {

            var updateAgainst = { _id: profileID }
            var newvalue = {
                $set: {
                    planID: planId.planID
                }
            }
            const _profile = await PUMarriageProfile.updateOne(updateAgainst, newvalue)

            if (_profile) {
                res.status(200).json({
                    isSuccess: true, message: "Plan Added Successfully..!",
                });
            }
        }
        else {
            return res.status(500).json({ isSuccess: false, message: 'Plan schedule addition was not successful' });
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

/**
 * Function Description: to create plan schedule
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Deepika A, 15 June 2025
 * Update History: 
 */

const getPublicUserPlans = asyncHandler(async (req, res) => {
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

        const _userRole = await UserRole.findOne({ _id: user.roleId })

        if (_userRole.name !== userRole) {
            res.status(401)
            throw new Error('Unauthorized access!!')
        }

       
        const plan = await PUMarriageProfile.findOne({userId:user._id})
                
        const _plan = plan?.planID
        
        const publicUserPlan = await Plan.find({ planFor: "Public" ,
            // _id: { $ne: _plan }
        })

        const now = new Date(); // current time

       const currentPlan = await PlanSchedule.aggregate([
       { $match: { profileID: plan._id } },
       { $unwind: "$planSchedule" },
       {$match: {"planSchedule.expiryDate": { $gte: now }}},
       {$project: {planID: "$planSchedule.planID"}}
]);

      const planIDs = currentPlan.map(item => item.planID);
console.log("mani",planIDs)
        // if (publicUserPlan) {
        //     return res.send(publicUserPlan);
        // }
         res.status(200).json({publicUserPlan:publicUserPlan,planIDs:planIDs});
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


const PUBalanceQuota = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            res.status(401);
            throw new Error('User not found');
        }

        if (user.isLoggedin !== true) {
            res.status(404);
            throw new Error('User not logged in');
        }

        const { profileId } = req.body.data;

        const profile = await PUMarriageProfile.findOne({ userId: user.id });

        // Uncomment below if broker check needed
        // if(profile.brokerId.toString() !== req.user.brokerId.toString()) {
        //     res.status(404);
        //     throw new Error("Unauthorized Access");
        // }

        if (!profile) {
            res.status(404);
            throw new Error("Profile Not found");
        }

        const planId = profile.planID;

        const planCategory = await Plan.findById(planId);

        if (!planCategory) {
            res.status(404);
            throw new Error("Plan Category Not Found");
        }

        const planScheduleDoc = await PlanSchedule.findOne({
            profileID: profile._id,
            'planSchedule.planID': planId
        });

        if (!planScheduleDoc || !planScheduleDoc.planSchedule?.length) {
            res.status(404);
            throw new Error("PlanSchedule not found or empty");
        }

        // Extract the first plan schedule
        const firstSchedule = planScheduleDoc.planSchedule[0];

        // Set expiryDate to end of day (11:59:59 PM)
        const expiryDate = new Date(firstSchedule.expiryDate);
        expiryDate.setHours(23, 59, 59, 999);

        const todayDate = new Date();
        const dateString = todayDate.toDateString();

        // Filter only today’s schedule
        const scheduleArray = firstSchedule.Schedule.filter(planView => {
            const scheduledate = new Date(planView.Date).toDateString();
            return scheduledate === dateString;
        });


        // Step 1: Set start of today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Step 2: Set end of today
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        // ✅ Final response
        if (todayDate <= expiryDate) {
            console.log("Plan is active");
            res.status(200).json({
                isSuccess: true,
                expiryDate: expiryDate,
                planId:planId,
                schedule: scheduleArray,
                planCategory: planCategory
            });
        } else {
            console.log("Plan is expired");
            res.status(200).json({isSuccess: false,expiryDate: expiryDate,schedule: [],planCategory: null});
        }

    } catch (err) {
        errorfunction.errorHandler(err, req, res);
    }
});

const AdditionalPlan = asyncHandler(async(req,res) => {
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

        const _userRole = await UserRole.findOne({ _id: user.roleId })
        
        if (_userRole.name !== userRole) {
            res.status(401)
            throw new Error('Unauthorized access!!')
        }


        // const { profileID, planID, planDuration, planPeriod,viewCountLimit, downloadCountLimit, viewImageCountLimit } = req.body
        const { profileID, planID,razorpay_order_id,razorpay_payment_id,razorpay_signature} = req.body.data;
        const profile = await PUMarriageProfile.findOne({ _id:profileID})

            const Plan = await PlanCatagory.findOne({_id:planID})
            
                    if(!Plan){
                        res.status(401);
                        throw new Error("Plan not found");
                    }
        const existingSchedule = await PlanSchedule.findOne({
            profileID: profileID,
            'planSchedule.planID': planID,
            'planSchedule.expiryDate': { $gte: new Date() }  // Check for active (not yet expired) plan
        })
        if (existingSchedule) {  
            return res.status(200).json({ isSuccess: false, message: 'The plan already exists for this profile.' });
        }

                const payment = await razorPayment.create({
                planId:planID,
                userId:user._id,
                isPayment:"success",
                updatedAt:new Date(),
                updeatedAt:new Date(),
                razorpayOrderId:razorpay_order_id,
                razorpayPaymentId:razorpay_payment_id,
                razorpaySignature:razorpay_signature
            })
    
           if(!payment){
                return res.status(200).json({isSuccess:false})
            }

        let planDays;
        if (Plan.planPeriod === "Week") {
            planDays = 7;
        } else if (Plan.planPeriod === "Month") {
            planDays = 28;
        }
        else if (Plan.planPeriod == "Daily") {
            planDays = 1;
        }
        else {
            console.log("Incorrect plan period");
            return;
        }

        const totalDaysOfPlan = Plan.planDuration * planDays;
        let today = new Date();
        let expiryDate = new Date(today.setDate(today.getDate() + totalDaysOfPlan));

        let planDate = new Date();
        let arrScheduleFields = [];

        // Calculate seriallNo and Date for each schedule
        for (let i = 1; i <= totalDaysOfPlan; i++) {
            let ScheduleFields = {
                seriallNo: i,
                Date: new Date(planDate), // Use the current planDate
                viewCountLimit: Plan.viewCountLimit,
                currentViewCount: 0,
                downloadCountLimit: Plan.downloadCountLimit,
                currentDownloadCount: 0,
                viewImageCountLimit: Plan.viewImageCountLimit,
                currentViewImageCount: 0,
                status: 'Active',
            };

            // Increment the planDate for the next iteration
            planDate.setDate(planDate.getDate() + 1);

            arrScheduleFields.push(ScheduleFields);
        }
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

        // Create the planSchedule document
        const schedule = await PlanSchedule.create({
            profileID: profileID,
            isPublicProfile: true,
            planSchedule: [planScheduleFields], // Make sure planSchedule is an array
        });
        let planId = schedule.planSchedule[0]

const Additionalplan = await PUMarriageProfile.updateOne(
    { "_id": profileID },
    { $set: { "planID": planID } }
);
console.log("end",Additionalplan)
if(Additionalplan){
        return res.status(200).json({isSuccess:true,getAdditionalplan:Additionalplan,message:"Plan added successfully"})
}
    }
        catch (err) {
        errorfunction.errorHandler(err, req, res);
    }
})

const getAllPUplans = asyncHandler(async(req,res) =>{
    try{
        console.log('mani')
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

        // const _userRole = await UserRole.findOne({ _id: user.roleId })
        
        // if (_userRole.name !== userRole) {
        //     res.status(401)
        //     throw new Error('Unauthorized access!!')
        // }

const profile = await PUMarriageProfile.findOne({ userId: user.id });

if (!profile) {
  throw new Error("Profile not found");
}


const currentPlan = await PlanSchedule.aggregate([
  { $match: { "profileID": profile._id,"planSchedule.planID":profile.planID } },
  { $unwind: "$planSchedule" },
  {
    $project: {
      planID: "$planSchedule.planID",
      isExpired: {
        $lt: ["$planSchedule.expiryDate", "$$NOW"]
      }
    }
  },
  {
    $group: {
      _id: "$isExpired",  // true = expired, false = active
      planIDs: { $addToSet: "$planID" }
    }
  }
]);


const activePlan = currentPlan.filter(item => item._id === false);


if(activePlan && activePlan.length == 1)// current plan is active, so no needs to show the popup
{
  return  res.json({ isSuccess:true,plan:false,planactive:true }); 
}
else if(activePlan && activePlan.length == 0) // current plan is not active and expired
{


const expiredAndActive = await PlanSchedule.aggregate([
  { $match: { profileID: profile._id } },
  { $unwind: "$planSchedule" },
  {
    $project: {
      planID: "$planSchedule.planID",
      isExpired: {
        $lt: ["$planSchedule.expiryDate", "$$NOW"]
      }
    }
  },
  {
    $group: {
      _id: "$isExpired",  // true = expired, false = active
      planIDs: { $addToSet: "$planID" }
    }
  }
]);

console.log('expiredAndActive')

console.log(expiredAndActive)


const activePlanFromList = expiredAndActive.filter(item => item._id === false);
console.log(activePlanFromList.length )
if(activePlanFromList.length == 1 && activePlanFromList[0].planIDs.length ==1)
{
    console.log(activePlanFromList[0].planIDs[0])
    let newplan = activePlanFromList[0].planIDs[0]

const additionalplan = await PUMarriageProfile.updateOne(
    { "_id": profile },
    { $set: { "planID": newplan } }
);

//  let PUexists = Boolean(PUPlan)

return  res.json({ isSuccess:true,plan:false,planactive:true ,additionalplan}); 

}
else if(activePlanFromList.length ==1 && activePlanFromList[0].planIDs.length > 1 )
{

const allPlanSchedule = await PlanSchedule.find({ profileID: profile._id })

const activeGroup = expiredAndActive.find(item => item._id === false);

const activePlanIDs = activeGroup?.planIDs || [];

const _planName = await PlanCatagory.find({_id:activePlanIDs})


return res.json({ isSuccess:true,plan:_planName, getAllPuplicUserplans: allPlanSchedule,planactive:true });

}



}

//else 






// const expiredAndActive = await PlanSchedule.aggregate([
//   { $match: { profileID: profile._id } },
//   { $unwind: "$planSchedule" },
//   {
//     $project: {
//       planID: "$planSchedule.planID",
//       isExpired: {
//         $lt: ["$planSchedule.expiryDate", "$$NOW"]
//       }
//     }
//   },
//   {
//     $group: {
//       _id: "$isExpired",  // true = expired, false = active
//       planIDs: { $addToSet: "$planID" }
//     }
//   }
// ]);

// const activeGroup = expiredAndActive.find(item => item._id === false);

// const activePlanIDs = activeGroup?.planIDs || [];

// const _planName = await PlanCatagory.find({_id:activePlanIDs})
// console.log("sanjay",_planName)
// // const planactive = Boolean(_planName)

// // const plan = await PlanSchedule.find({planID:profile.planID})

// res.json({ isSuccess:true,plan:_planName, getAllPuplicUserplans: allPlanSchedule,planactive:planactive });


    }
    catch (err) {
        errorfunction.errorHandler(err, req, res);
    }
})

const activePlan = asyncHandler(async(req,res) => {
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

        const _userRole = await UserRole.findOne({ _id: user.roleId })
        
        if (_userRole.name !== userRole) {
            res.status(401)
            throw new Error('Unauthorized access!!')
        }
        
const {planID} = req.body

const profile = await PUMarriageProfile.findOne({ userId: user.id });

const Additionalplan = await PUMarriageProfile.updateOne(
    { "_id": profile },
    { $set: { "planID": planID } }
);

if(Additionalplan){
        return res.status(200).json({isSuccess:true,plans:Additionalplan,message:"Plan active successfully"})
}
    }
        catch (err) {
        errorfunction.errorHandler(err, req, res);
    }
})

const viewplan = asyncHandler(async(req,res) => {
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

        const _userRole = await UserRole.findOne({ _id: user.roleId })
        
        if (_userRole.name !== userRole) {
            res.status(401)
            throw new Error('Unauthorized access!!')
        }

        const profile = await PUMarriageProfile.findOne({ userId: user.id })

        // const planID = profile.planID
       
        const now = new Date(); // current time

       const currentPlan = await PlanSchedule.aggregate([
       { $match: { profileID: profile._id } },
       { $unwind: "$planSchedule" },
       {$match: {"planSchedule.expiryDate": { $gte: now }}},
       {$project: {planID: "$planSchedule.planID"}}
]);

      const planIDs = currentPlan.map(item => item.planID);

    const ViewPlanlist = await PlanCatagory.find({ _id: { $in: planIDs}});
     
     
     if (ViewPlanlist) {
            return res.send(ViewPlanlist);
    }

    }        
    catch (err) {
        errorfunction.errorHandler(err, req, res);
    }
})


const viewplanActive = asyncHandler(async(req,res) => {
    
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

        const _userRole = await UserRole.findOne({ _id: user.roleId })
        
        if (_userRole.name !== userRole) {
            res.status(401)
            throw new Error('Unauthorized access!!')
        }

        const { profileId, planID} = req.body

       const planActive = await PUMarriageProfile.updateOne({ _id: profileId }, { $set: { planID: planID} })

       if(planActive){
        return res.status(200).json({isSuccess:true,message:"Plan active successfully"})
}
       
    }        
    catch (err) {
        errorfunction.errorHandler(err, req, res);
    }
})

module.exports = {
    upgradePlan,
    getPublicUserPlans,
    PUBalanceQuota,
    AdditionalPlan,
    getAllPUplans,
    activePlan,
    viewplan,
    viewplanActive
}

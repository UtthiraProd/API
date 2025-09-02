const asyncHandler = require ('express-async-handler')
const PlanCatagory = require ('../models/planModel')
const Broker = require ('../models/brokerModel')
const User = require ('../models/userModel')
const PlanSchedule = require('../models/planScheduleModel')
const MarriageProfile = require('../models/marriageProfileModel')
const ValidationConfig = require('../models/validationConfigModel')
const { errorfunction,fieldValidationfunction } = require('./commonController')
const UserRole = require('../models/userRoleModel')
const UserAdminRole ="Admin"
const ObjectId = require('mongodb')

const PLAN_FOR_BROKER = "Broker"

const createPlan = asyncHandler(async(req,res)=>{
   try {
        const user = await User.findById(req.user.id)
        console.log(user)
       
               if (!user) {
                   res.status(401)
                   throw new Error('User not found')}
    
                   
        const{planName,isActive,planFor,brokerId,planPeriod,planDuration,planCost,viewPerNoOfdays,viewCountLimit,downloadCountLimit,viewImageCountLimit} =req.body.data
        console.log("message")
       console.log(req.body.data)


        if(!planName || !isActive || !planFor || !planPeriod || !planDuration || !planCost || !viewPerNoOfdays ||
            !viewCountLimit || !downloadCountLimit || !viewImageCountLimit) {
                return res.send({isSuccess: false, message: "Invaild Data"})
         }


          if(planFor == PLAN_FOR_BROKER)
          {
            console.log("hello")
            if(!brokerId)
                {

                    return res.send({isSuccess: false, message: "Invaild Data"})
                }
          }

         for (const [key, value] of Object.entries(req.body.data)) {
                    let arrValidation = await ValidationConfig.find({ formName: 'AddEditUserPlan', fieldName: key })
                    for (const currentObject of arrValidation) {
        
                        let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                        if (message != '') {
                            res.status(400)
                            console.log(message)
                            throw new Error(message);
                        }
                    }
                }

       // if(planFor == PLAN_FOR_BROKER){

        const brok = await PlanCatagory.findOne({brokerId:brokerId,planName:planName})
        console.log(brok)
        console.log(brokerId)

        if(brok){
            res.status(200).json({isSuccess:false,message:" Already Used"})
            return
        }

         let broker = null
         
         if(brokerId !="")
         broker = await Broker.findOne({_id:brokerId})
    
        const _plan = await PlanCatagory.create({
           
            planName:planName,
            isActive:true,
            planFor:planFor,
            brokerName: (planFor === PLAN_FOR_BROKER && brokerId !="")? broker.name : "",
            brokerId: planFor === PLAN_FOR_BROKER ? brokerId:"",
            planPeriod:planPeriod,
            planDuration:planDuration,
            planCost:planCost,
            viewPerNoOfdays:1,
            viewCountLimit:viewCountLimit,
            downloadCountLimit:downloadCountLimit,
            viewImageCountLimit:viewImageCountLimit,
            createdBy:req.user.id,
            updatedBy:req.user.id,
        })
        console.log(_plan)
        if(_plan){
            res.send({isSuccess:true, message: "Plan Add Successfully..!"})
        } 
}
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

const getBrokerId = asyncHandler(async(req,res)=>{
    try{
        const user = await User.findById(req.user.id)
        console.log(user)
       
               if (!user) {
                   res.status(401)
                   throw new Error('User not found')}
        const brokerId = await Broker.find({})

        if(brokerId){
            return res.send(brokerId)
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

const deletePlan = asyncHandler(async(req,res)=>{

try {

    const { id, planName } = req.body;

  const _planSchedule = await PlanSchedule.findOne({
    "planSchedule": { $elemMatch: { planID: id } }
  })

  if(_planSchedule) {
    return res.status(201).json({ isSuccess: false, message: "This plan used a plan Schedule" });
  }

  const brokerid = await PlanCatagory.findOne({ _id: id });

  if (!brokerid) {
    return res.status(200).json({ isSuccess: false, message: "Plan not found" });
  }

  if (planName !== brokerid.planName) {
    return res.status(200).json({ isSuccess: false, message: "Plan names do not match" });
  }

  const plan = await PlanCatagory.deleteOne({ _id: id });
  res.status(200).json({ isSuccess: true, message: "Deleted Successfully" });

} catch (err) {
  errorfunction.errorHandler(err, req, res);
}
})

const updatePlan = asyncHandler(async(req,res)=>{
    try{
        const user = await User.findById(req.user.id)
               if (!user) {
                   res.status(401)
                   throw new Error('User not found')}

        const {id,isActive,planPeriod,planDuration,planCost,viewPerNoOfdays,viewCountLimit,downloadCountLimit,viewImageCountLimit}= req.body.data

        for (const [key, value] of Object.entries(req.body.data)) {
                   let arrValidation = await ValidationConfig.find({ formName: 'AddEditUserPlan', fieldName: key })
                   for (const currentObject of arrValidation) {
       
                       let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                       if (message != '') {
                           res.status(400)
                           console.log(message)
                           throw new Error(message);
                       }
                   }
               }

        var updateAgainst ={_id:id};
        console.log("is :", id)
        var newvalues = {$set: {
          
            isActive:isActive,
            // planFor:planFor,
            planPeriod:planPeriod,
            planDuration:planDuration,
            planCost:planCost,
            viewPerNoOfdays:1,
            viewCountLimit:viewCountLimit,
            downloadCountLimit:downloadCountLimit,
            viewImageCountLimit:viewImageCountLimit,
            updatedBy:req.user.id,
        }}

        const _plan = await PlanCatagory.updateOne(updateAgainst,newvalues)
        console.log(_plan)

        // const plan = await PlanCatagory.findById(id)
        if(_plan){
            res.status(201).json({ isSuccess:true,message:"Updated successfully..."})
        }
        else {
            res.status(400)
            throw new console.error('Error while updating Plan!!!');
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

// const getPlanByName = asyncHandler(async (req, res) => {
//     try {
//       const { planName, brokerName } = req.query;
//       console.log(req.query)
  
//       if (planName.length > 1) {
//         const _planName = await PlanCatagory.find({
//           planName: { $regex: planName, $options: 'i' }
//         })
//         res.send(_planName)
//       }
  
//       if (brokerName.length > 1) {
//         const _brokerName = await PlanCatagory.find({
//           brokerName: { $regex: brokerName, $options: 'i' }
//         })
//         res.send(_brokerName)
//       }
  
//       else if (brokerName.length === 0 && planName.length === 0) {
//         const allPlans = await PlanCatagory.find({})
//         return res.status(200).json(allPlans)
//       }
//     } 
//     catch (err) {
//       errorfunction.errorHandler(err, req, res)
//     }
//   })
const getAllPlan = asyncHandler(async (req, res) => {
    try {
      
        let _skip = 1;
        let _pagesize = 10;

         const {planName,planFor,brokerId,planPeriod,planDuration,planCost,viewCountLimit,downloadCountLimit,skip,pagesize} = req.body.data

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
         
        let query ={};
 
         if(planName){
            query.planName = planName
            console.log(planName)
         }
         if(planFor){
            query.planFor = planFor
            console.log(planFor)
         }
         if(brokerId){
            query.brokerId = brokerId
            console.log(brokerId)
         }
         if(planPeriod){
            query.planPeriod = planPeriod
            console.log(planPeriod)
         }
         if(planDuration){
            query.planDuration = planDuration
            console.log(planDuration)
         }
         if(planCost){
            query.planCost = planCost
            console.log(planCost)
         }
         if(viewCountLimit){
            query.viewCountLimit = viewCountLimit
            console.log(viewCountLimit)
         }
         if(downloadCountLimit){
            query.downloadCountLimit = downloadCountLimit
            console.log(downloadCountLimit)
         }
         if(!planName || !planFor || !planPeriod || !planDuration || !planCost ||
            !viewCountLimit || !downloadCountLimit){
                const _planLists = await PlanCatagory.find({})
            }
         const _planLists = await PlanCatagory.find(query).skip(_skip).limit(_pagesize) 
        const _totalRecord = await PlanCatagory.find(query).countDocuments()

         res.status(200).json({"PlanList":_planLists, "totalPlanRecourd": Math.ceil(_totalRecord/ _pagesize), "totalPlanRecourds": _totalRecord})
        //  console.log(_planLists)
  
        }
        
    catch (err) {
      errorfunction.errorHandler(err, req, res)
    }
  })

const getPlanDetailsBYId = asyncHandler(async(req,res)=>{
    try{
        const {id}= req.query
        console.log(id)

        const planId = await PlanCatagory.findById({_id:id})
        console.log(planId)
        if(planId){
            res.status(200).json({PlanDetails:planId})
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
 * Author: Nalini A Krishnan, 9 Apr 2024
 * Update History: 
 */

const createPlanSchedule = asyncHandler(async (req, res) => {
    try {
          const user = await User.findById(req.user.id)
            if (!user) {
                res.status(401)
                throw new Error('User not found')}

        const { profileID, planID, planPeriod, planDuration, viewCountLimit, downloadCountLimit,viewImageCountLimit } = req.body.data;
        console.log(req.body)

        let balanceAmount;
        let planCost;

        const broker = await Broker.findOne({userId:user.id})
             balanceAmount = broker.balanceAmount
             
        const plan = await PlanCatagory.findOne({_id:planID})
             planCost = plan.planCost
        
        if (balanceAmount < planCost) {
              return res.status(200).json({ isSuccess: false, message: "Insufficient balance to activate this plan." });
         }
        

        const existingSchedule = await PlanSchedule.findOne({
            profileID: profileID,
            'planSchedule.planID':planID,
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
        else if(planPeriod == "Daily")
        {
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
                viewImageCountLimit:viewImageCountLimit,
                currentViewImageCount:0,
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

        console.log("planScheduleFields...............old");

        // Create the planSchedule document
        const schedule = await PlanSchedule.create({
            profileID: profileID,
            planSchedule: [planScheduleFields], // Make sure planSchedule is an array
        });

        if (schedule) {
           
            var updateAgainst = {_id:profileID}
            var newvalue = {$set:{
                planID:planID
            }}
         const _profile = await MarriageProfile.updateOne(updateAgainst,newvalue)

             if (_profile) {
                 const _broker = await Broker.updateOne(
                  { _id: broker._id },
                 { $inc: { balanceAmount: -planCost } }
                 );
        
            res.status(200).json({isSuccess: true,message: "Plan Added Successfully..!",
        
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

/**
 * Function Description: to increment the todays count after every profile view or profile download
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Nalini A Krishnan, 9 Apr 2024
 * Update History: 
 */


const CountProfileViewDownload = asyncHandler(async (req, res) => {
    try {
        const { profileID, planID, action } = req.body;

        // Assuming today is the date you're looking for
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to 00:00:00.000 for proper date comparison

        if (action == 'View'){

            // Find the planSchedule document based on userID and planID
            const planScheduleDoc = await PlanSchedule.findOneAndUpdate(
                {
                    'profileID': profileID, // the user ID you're looking for
                    'planSchedule.planID': planID, // the plan ID you're looking for
                    'planSchedule.Schedule.Date': {
                        $gte: today, // Start of today
                        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // End of today (24 hours later)
                    },
                },
                {
                    $inc: {
                        'planSchedule.$.Schedule.$[elem].currentViewCount': 1  // Increment currentViewCount by 1
                    }
                },
                {
                    new: true,  // Return the updated document
                    arrayFilters: [{ 'elem.Date': { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } }]  // Ensure correct schedule element is selected
                }
            );

            if (planScheduleDoc) {
                console.log("Successfully incremented view count.");
                res.send({ isSuccess: true, message: 'View count incremented successfully' });
            } else {
                return res.status(500).json({ isSuccess: false, message: 'View count increment unsuccessful' });
            }

        } else if (action == 'Download'){

            // Find the planSchedule document based on userID and planID
            const planScheduleDoc = await PlanSchedule.findOneAndUpdate(
                {
                    'profileID': profileID, // the user ID you're looking for
                    'planSchedule.planID': planID, // the plan ID you're looking for
                    'planSchedule.Schedule.Date': {
                        $gte: today, // Start of today
                        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // End of today (24 hours later)
                    },
                },
                {
                    $inc: {
                        'planSchedule.$.Schedule.$[elem].currentDownloadCount': 1  // Increment currentViewCount by 1
                    }
                },
                {
                    new: true,  // Return the updated document
                    arrayFilters: [{ 'elem.Date': { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } }]  // Ensure correct schedule element is selected
                }
            );

            if (planScheduleDoc) {
                console.log("Successfully incremented view count.");
                res.send({ isSuccess: true, message: 'Download count incremented successfully' });
            } else {
                return res.status(500).json({ isSuccess: false, message: 'Download count increment unsuccessful' });
            }

        }


    } catch (err) {
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


const ViewOrDownloadProfileCountCheck = asyncHandler(async (req, res) => {
    try {
        const { profileID, planID, action } = req.body;

        // Assuming today is the date you're looking for
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to 00:00:00.000 for proper date comparison

        // Find the planSchedule document based on userID and planID
        const planScheduleDoc = await PlanSchedule.findOne(
            {
                'profileID': profileID, // the user ID you're looking for
                'planSchedule.planID': planID, // the plan ID you're looking for
                'planSchedule.Schedule.Date': {
                    $gte: today, // Start of today
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // End of today (24 hours later)
                },
            },
        );

        if (!planScheduleDoc) {
            return res.status(404).json({ isSuccess: false, message: 'Plan schedule not found for today' });
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
            return res.status(404).json({ isSuccess: false, message: 'No schedule found for today' });
        }


        console.log(scheduleToday.currentViewCount);
        console.log(scheduleToday.viewCountLimit);
        console.log(scheduleToday.currentDownloadCount);
        console.log(scheduleToday.downloadCountLimit);

        if (action == 'View'){
            if (scheduleToday.currentViewCount < scheduleToday.viewCountLimit) {

                console.log("You can still view profiles");
                res.send({ isSuccess: true, message: 'You can still view profiles' });
            } else {
                return res.status(500).json({ isSuccess: false, message: 'Your profile view quota for today is exhausted' });
            }

        } else if (action == 'Download'){

            if (scheduleToday.currentDownloadCount < scheduleToday.downloadCountLimit) {
                console.log("You can still download profiles");
                res.send({ isSuccess: true, message: 'You can still download profiles' });
            } else {
                return res.status(500).json({ isSuccess: false, message: 'Your profile view quota for today is exhausted' });
            }

        }

    } catch (err) {
        errorfunction.errorHandler(err, req, res);
    }
});


// const balanceQuota = asyncHandler(async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       res.status(401);
//       throw new Error('User not found');
//     }

//     const { profileId } = req.body.data;
//     console.log(profileId)

//     const profile = await MarriageProfile.findById(profileId);
//     if (!profile) {
//       res.status(404);
//       throw new Error('MarriageProfile not found');
//     }
//     console.log(profile)

//     const planId = profile.planID;
//     const planCatagory = await PlanCatagory.findById(planId);
//     if (!planCatagory) {
//       res.status(404);
//       throw new Error('Plan Category not found');
//     }

//     const planScheduleDoc = await PlanSchedule.findOne({ 'profileID': profile._id,'planSchedule.planID':planId });
                                         
//     if (!planScheduleDoc || !planScheduleDoc.planSchedule?.length) {
//       res.status(404);
//       throw new Error('PlanSchedule not found or empty');
//     }
//     console.log('planScheduleDoc')
//     console.log(planScheduleDoc)
//     // Extract the first plan schedule
//     const firstSchedule = planScheduleDoc.planSchedule[0];
//     const expiryDate = firstSchedule.expiryDate;

//      let todayDate = new Date();
//      let dateString = todayDate.toDateString()

//     const scheduleArray = firstSchedule.Schedule.filter(planView=>{
//         const scheduledate = new Date(planView.Date).toDateString()
//         return scheduledate === dateString
//     })

//     if (todayDate <= new Date(expiryDate)) {
//       console.log("Plan is active");
//     } 
//     else {
//       console.log("Plan is expired");
//     }

//     res.status(200).json({isSuccess: true,expiryDate: expiryDate,schedule: scheduleArray, planCatagory:planCatagory
//     });
// console.log(expiryDate)
//   } 
//   catch (err) {
//     errorfunction.errorHandler(err, req, res);
//   }
// });

module.exports ={
    createPlan,
    getAllPlan,
    getBrokerId,
    deletePlan,
    updatePlan,
    getPlanDetailsBYId,
    createPlanSchedule,
    CountProfileViewDownload,
    ViewOrDownloadProfileCountCheck,
    // balanceQuota,
}
const asyncHandler = require ('express-async-handler')
const PlanCatagory = require ('../../models/planModel')
const Broker = require ('../../models/brokerModel')
const User = require ('../../models/userModel')
const PlanSchedule = require('../../models/planScheduleModel')
const MarriageProfile = require('../../models/marriageProfileModel')
const ValidationConfig = require('../../models/validationConfigModel')
const { errorfunction,fieldValidationfunction } = require('../commonController')
const UserRole = require('../../models/userRoleModel')
const UserAdminRole ="Admin"
const ObjectId = require('mongodb')

const PLAN_FOR_BROKER = "Broker"

const createPlan = asyncHandler(async(req,res)=>{
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
                   
        const{planName,isActive,planFor,brokerId,planPeriod,planDuration,planCost,viewPerNoOfdays,viewCountLimit,downloadCountLimit,viewImageCountLimit} =req.body.data
 
        if(!planName || !isActive || !planFor || !planPeriod || !planDuration || !planCost || !viewPerNoOfdays ||
            !viewCountLimit || !downloadCountLimit || !viewImageCountLimit) {
                return res.send({isSuccess: false, message: "Invaild Data"})
         }

          if(planFor == PLAN_FOR_BROKER)
          {
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

        const brok = await PlanCatagory.findOne({brokerId:brokerId,planName:planName})

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
       
               if (!user) {
                   res.status(401)
                   throw new Error('User not found')
                }
                else if(user.isLoggedin !== true)
                {
                   res.status(404)
                   throw new Error('User not logged in')
                }

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
    return res.status(201).json({ isSuccess: false, message: "This plan is in use and therefore cannot be deleted" });
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

} 
catch (err) {
  errorfunction.errorHandler(err, req, res);
}
})

const updatePlan = asyncHandler(async(req,res)=>{
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
         }
         if(planFor){
            query.planFor = planFor
         }
         if(brokerId){
            query.brokerId = brokerId
         }
         if(planPeriod){
            query.planPeriod = planPeriod
         }
         if(planDuration){
            query.planDuration = planDuration
         }
         if(planCost){
            query.planCost = planCost
         }
         if(viewCountLimit){
            query.viewCountLimit = viewCountLimit
         }
         if(downloadCountLimit){
            query.downloadCountLimit = downloadCountLimit
         }
         if(!planName || !planFor || !planPeriod || !planDuration || !planCost ||
            !viewCountLimit || !downloadCountLimit){
                const _planLists = await PlanCatagory.find({})
            }
         const _planLists = await PlanCatagory.find(query).skip(_skip).limit(_pagesize) 
         const _totalRecord = await PlanCatagory.find(query).countDocuments()

         res.status(200).json({"PlanList":_planLists, "totalPlanRecourd": Math.ceil(_totalRecord/ _pagesize), "totalPlanRecourds": _totalRecord})  
        }  
    catch (err) {
      errorfunction.errorHandler(err, req, res)
    }
  })

/**
 * Function Description: to increment the todays count after every profile view or profile download
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Nalini A Krishnan, 9 Apr 2024
 * Update History: 
 */


// const CountProfileViewDownload = asyncHandler(async (req, res) => {
//     try {
//         const { profileID, planID, action } = req.body;

//         // Assuming today is the date you're looking for
//         const today = new Date();
//         today.setHours(0, 0, 0, 0); // Reset time to 00:00:00.000 for proper date comparison

//         if (action == 'View'){

//             // Find the planSchedule document based on userID and planID
//             const planScheduleDoc = await PlanSchedule.findOneAndUpdate(
//                 {
//                     'profileID': profileID, // the user ID you're looking for
//                     'planSchedule.planID': planID, // the plan ID you're looking for
//                     'planSchedule.Schedule.Date': {
//                         $gte: today, // Start of today
//                         $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // End of today (24 hours later)
//                     },
//                 },
//                 {
//                     $inc: {
//                         'planSchedule.$.Schedule.$[elem].currentViewCount': 1  // Increment currentViewCount by 1
//                     }
//                 },
//                 {
//                     new: true,  // Return the updated document
//                     arrayFilters: [{ 'elem.Date': { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } }]  // Ensure correct schedule element is selected
//                 }
//             );

//             if (planScheduleDoc) {
//                 console.log("Successfully incremented view count.");
//                 res.send({ isSuccess: true, message: 'View count incremented successfully' });
//             } else {
//                 return res.status(500).json({ isSuccess: false, message: 'View count increment unsuccessful' });
//             }

//         } else if (action == 'Download'){

//             // Find the planSchedule document based on userID and planID
//             const planScheduleDoc = await PlanSchedule.findOneAndUpdate(
//                 {
//                     'profileID': profileID, // the user ID you're looking for
//                     'planSchedule.planID': planID, // the plan ID you're looking for
//                     'planSchedule.Schedule.Date': {
//                         $gte: today, // Start of today
//                         $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // End of today (24 hours later)
//                     },
//                 },
//                 {
//                     $inc: {
//                         'planSchedule.$.Schedule.$[elem].currentDownloadCount': 1  // Increment currentViewCount by 1
//                     }
//                 },
//                 {
//                     new: true,  // Return the updated document
//                     arrayFilters: [{ 'elem.Date': { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } }]  // Ensure correct schedule element is selected
//                 }
//             );

//             if (planScheduleDoc) {
//                 console.log("Successfully incremented view count.");
//                 res.send({ isSuccess: true, message: 'Download count incremented successfully' });
//             } else {
//                 return res.status(500).json({ isSuccess: false, message: 'Download count increment unsuccessful' });
//             }

//         }


//     } catch (err) {
//         errorfunction.errorHandler(err, req, res);
//     }
// });



/**
 * Function Description: to increment the todays count after every profile view or profile download
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Nalini A Krishnan, 9 Apr 2024
 * Update History: 
 */


// const ViewOrDownloadProfileCountCheck = asyncHandler(async (req, res) => {
//     try {
//         const { profileID, planID, action } = req.body;

//         // Assuming today is the date you're looking for
//         const today = new Date();
//         today.setHours(0, 0, 0, 0); // Reset time to 00:00:00.000 for proper date comparison

//         // Find the planSchedule document based on userID and planID
//         const planScheduleDoc = await PlanSchedule.findOne(
//             {
//                 'profileID': profileID, // the user ID you're looking for
//                 'planSchedule.planID': planID, // the plan ID you're looking for
//                 'planSchedule.Schedule.Date': {
//                     $gte: today, // Start of today
//                     $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // End of today (24 hours later)
//                 },
//             },
//         );

//         if (!planScheduleDoc) {
//             return res.status(404).json({ isSuccess: false, message: 'Plan schedule not found for today' });
//         }

//         // Access the specific Schedule entry for today
//         let scheduleToday = null;
//         for (let plan of planScheduleDoc.planSchedule) {
//             scheduleToday = plan.Schedule.find(schedule => {
//                 const scheduleDate = new Date(schedule.Date);
//                 return scheduleDate >= today && scheduleDate < new Date(today.getTime() + 24 * 60 * 60 * 1000); // Check if the Date is today
//             });
//             if (scheduleToday) {
//                 break; // Stop searching once we find the entry for today
//             }
//         }

//         if (!scheduleToday) {
//             return res.status(404).json({ isSuccess: false, message: 'No schedule found for today' });
//         }


//         console.log(scheduleToday.currentViewCount);
//         console.log(scheduleToday.viewCountLimit);
//         console.log(scheduleToday.currentDownloadCount);
//         console.log(scheduleToday.downloadCountLimit);

//         if (action == 'View'){
//             if (scheduleToday.currentViewCount < scheduleToday.viewCountLimit) {

//                 console.log("You can still view profiles");
//                 res.send({ isSuccess: true, message: 'You can still view profiles' });
//             } else {
//                 return res.status(500).json({ isSuccess: false, message: 'Your profile view quota for today is exhausted' });
//             }

//         } else if (action == 'Download'){

//             if (scheduleToday.currentDownloadCount < scheduleToday.downloadCountLimit) {
//                 console.log("You can still download profiles");
//                 res.send({ isSuccess: true, message: 'You can still download profiles' });
//             } else {
//                 return res.status(500).json({ isSuccess: false, message: 'Your profile view quota for today is exhausted' });
//             }
//         }
//     } catch (err) {
//         errorfunction.errorHandler(err, req, res);
//     }
// });

module.exports ={
    createPlan,
    getAllPlan,
    getBrokerId,
    deletePlan,
    updatePlan,
    // CountProfileViewDownload,
    // ViewOrDownloadProfileCountCheck,
}
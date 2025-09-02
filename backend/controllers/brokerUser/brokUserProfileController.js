const asyncHandler = require ('express-async-handler')
const User = require ('../../models/userModel')
const UserRole = require('../../models/userRoleModel')
const {errorfunction} =require ('../commonController')
const MarriageProfile =require ('../../models/marriageProfileModel')
const PlanCatagory = require ('../../models/planModel')
const PlanSchedule = require('../../models/planScheduleModel')
const USER_ROLE_USER ="BrokerUser"

/**
 * Function Description: to get all profiles with broker id
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Deepika ,13 May 2025
 * Update History: 
 */

const brokerUserDetails = asyncHandler(async(req, res)=>{
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

                const {userId} = req.body;
               
   
        let _userId;    
        if(!userId){ 
             const userRole = await UserRole.findById({_id:user.roleId})

             if(userRole.name == USER_ROLE_USER){
                 const profile = await MarriageProfile.findById({_id:user.profileId}) 
                 if(!profile){
                  res.status(401)
                  throw new Error('Profile not found')
                 }                
             }
        }
        else{
            _userId = userId
        }
          const userDetails = await User.findById(user.id) 
            
          res.send({isSuccess: true, userDetails:userDetails})
          console.log(userDetails)
    }
    catch (err) {
            errorfunction.errorHandler(err, req, res)
        }
})

/**
 * Function Description: to get all profiles with broker id
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Deepika ,14 May 2025
 * Update History: 
 */


const userBalanceQuota = asyncHandler(async (req, res) => {
  try {
    let users;
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

    const { profileId } = req.body.data;
   
    const profile = await MarriageProfile.findById({_id:user.profileId});
    
    if(profile.brokerId.toString() !== req.user.brokerId.toString()){
        res.status(404)
        throw new error("Unauthorized access")
    }
    if (!profile) {
      res.status(404);
      throw new Error('MarriageProfile not found');
    }
    
    let planId = profile.planID;
    const planCatagory = await PlanCatagory.findById(planId);
    if (!planCatagory) {
      res.status(404);
      throw new Error('Plan Category not found');
    }

    const planScheduleDoc = await PlanSchedule.findOne({ 'profileID': profile._id,'planSchedule.planID':planId });

    if (!planScheduleDoc || !planScheduleDoc.planSchedule?.length) {
      res.status(404);
      throw new Error('PlanSchedule not found or empty');
    }

    // Extract the first plan schedule
    const firstSchedule = planScheduleDoc.planSchedule[0];
    const expiryDate = firstSchedule.expiryDate;

     let todayDate = new Date();
     let dateString = todayDate.toDateString()

    const scheduleArray = firstSchedule.Schedule.filter(planView=>{
        const scheduledate = new Date(planView.Date).toDateString()
        return scheduledate === dateString
    })

     // Step 1: Set start of today
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

// Step 2: Set end of today (start of next day)
const todayEnd = new Date(todayStart);
todayEnd.setDate(todayEnd.getDate() + 1);


// const planScheduleDoc1 = await PlanSchedule.findOne({
//     'profileID': profile._id, // the user ID you're looking for
//     'planSchedule.planID': profile.planID, // the plan ID you're looking for
//    'planSchedule.Schedule.Date': {
//        $gte: todayStart, // Start of today (00:00:00)
//        $lt: todayEnd     // Start of tomorrow (exclusive)
//     }
// });

// console.log( planScheduleDoc1.planSchedule.Schedule)
    
    if (todayDate <= new Date(expiryDate)) {
      console.log("Plan is active");
    } 
    else {
      console.log("Plan is expired");
    }

    res.status(200).json({isSuccess: true,expiryDate: expiryDate,schedule: scheduleArray, planCatagory:planCatagory
    });
  } 
  catch (err) {
    errorfunction.errorHandler(err, req, res);
  }
});

const BUplanexists = asyncHandler(async(req,res)=>{

    try{

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

     const _profile =await MarriageProfile.findById({_id :user.profileId})

     let planExists = false;
     
      const planId = _profile.planID;

      const _plan = await PlanSchedule.findOne({
              profileID: _profile._id,
              'planSchedule.planID': planId
        });

         if (_plan) {
        const firstSchedule = _plan.planSchedule[0];
        const expiryDate = firstSchedule.expiryDate
        const todayDate = new Date();

        if (todayDate <= expiryDate) {
          planExists = true; // Plan is still active
        }
      }

      res.json({ planExists })
    }
    catch(err){
      errorfunction.errorHandler(err,res,req);
    }
})



module.exports ={
    brokerUserDetails,
    userBalanceQuota,
    BUplanexists
}
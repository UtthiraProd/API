const asyncHandler = require("express-async-handler")
const UserRole = require('../models/userRoleModel')
const User = require('../models/userModel')
const MarriageProfile = require('../models/marriageProfileModel')
const Broker = require('../models/brokerModel')
const { errorfunction } = require('./commonController')
const PlanCatagory = require ('../models/planModel')
const userBrokerRole = "Broker"
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')  
const TempUserOTP =  require('../models/tempUserOTPModel')
const emailsend=require('../models/emailSendModel')
const PlanSchedule = require('../models/planScheduleModel')
  


const getMarriageProfiles = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    let _skip = 1;
    let _pagesize = 10;
   
    if (!user) {
        res.status(401)
        throw new Error('User not found')
    }
    
    const {BrokerId,skip,pagesize,name,phoneNumber,profileID,email} = req.body
        
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
     let _brokerId = BrokerId


    if (!_brokerId) {
        const _userRole = await UserRole.findOne({ _id: user.roleId });

        if (_userRole.name == userBrokerRole) {
            let _brokerDetail = await Broker.findOne({ userId: req.user.id });
            _brokerId = _brokerDetail._id
        }
       
    }
    else {
        _brokerId = BrokerId
    }
    if(name){
        query.name = name;
    }
    if (phoneNumber){
        query.phoneNumber = phoneNumber
    }
    if(profileID){
        query.profileID = profileID
    }
    if(email){
        query.email = email
    }

    query.brokerId = _brokerId

    const _marriageProfileList = await MarriageProfile.find(query).skip(_skip).limit(_pagesize)
    const _totalRecord = await MarriageProfile.find(query).countDocuments()

    // const imageUrlList = await Promise.all(
    //     (await _marriageProfileList).map(async (doc) => {
    //         // Perform asynchronous operations here if needed
    //         let imageurl = await getPrfileimageUrl(_brokerId, doc._id)

    //         return { "profileID": doc.profileID, "imageUrl": imageurl };
    //     })
    
    // );
    res.status(200).json({ "profilesList": _marriageProfileList, 
      "totalProfile": Math.ceil(_totalRecord/ _pagesize), 
    //   "profileImage": imageUrlList, 
       "totalProfiles": _totalRecord
    })
}
  catch (err) {
    errorfunction.errorHandler(err, req, res)
}

})

const getMarriageProfileById=asyncHandler(async(req,res)=>{
    try{
     
      const {id}=req.query

    const _profile = await MarriageProfile.findById(id);
  
    if(_profile){
    res.status(200).json({isSuccess:true,profileDetail:_profile})
     }
    else{
        res.status(400).json({isSuccess:false,message:'Error occur'})
    }
    }
    catch (err){
        errorfunction.errorHandler(err,req,res)
    }
})


//**User Login Create **//
const userLoginCreate = asyncHandler(async(req,res)=>{
    try{

      const user = await User.findById(req.user.id)
      
              if (!user) {
                  res.status(401)
                  throw new Error('User not found')
              }

        const {profID,email,password,confirmPassword} = req.body.data
        
        if(!email || !password|| !confirmPassword){
            return res.status(400).json({isSuccess:false, message:"Invaild Data"})
        }
  
        if(!validatePassword(password)) 
          {
           return res.send({isSuccess:false,message: "Your password must be at least 8 characters long and include: an uppercase letter, a lowercase letter, a number, and a special character" })
          } 
        if(!isValidEmail(email))
          {
          return res.send({ isSuccess:false,message: "Invalid email format" })
          }

        if(profID){
            const userId = await User.findOne({profileId:profID})
            if(userId){
                return res.send({isSuccess:false,message:userId.name  + " Already Exists"})
            }    

            const userEmail = await User.findOne({email:email})            
            if(userEmail){
                return res.send({isSuccess:false,message:"Already Exists"})
            }
        }  if (password != confirmPassword) {
          res.status(400)
          return res.send({isSuccess: false, message: "Password mismatch" })
      }

   else
   {
    const userProfile = await MarriageProfile.findById({_id:profID})
    
    const userRole = await UserRole.findOne({ name: "User" })

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

        if(userProfile){
            const createLogin = await User.create({
                name:userProfile.name,
                email:email,
                isBroker:false,
                phoneNumber:userProfile.phoneNumber,
                password:hashedPassword,
                roleId:userRole._id,
                brokerId:userProfile.brokerId,
                profileId:userProfile._id
            })
        }
        res.status(200).json({isSuccess:true, message:"User Created Successfully..!!"})
    }}
    
     catch (err) {
            errorfunction.errorHandler(err, req, res)
        }
})

function validatePassword(password) {
  try {
      // Regular expression to validate password
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/


      // At least 8 characters long
      // Contains at least one uppercase letter
      // Contains at least one lowercase letter
      // Contains at least one digit
      //Contains at least one special character

      // Test the password against the regex
      return passwordRegex.test(password);
  }
  catch (err) {
      errorfunction.errorHandler(err, req, res)
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}



//**Get All Plan By Broker */
const getPlanByBroker = asyncHandler(async(req,res)=>{
    try{
         const user = await User.findById(req.user.id)
              if (!user) {
                  res.status(401)
                  throw new Error('User not found')}

             const {broker}=req.body          
             let brokerId =broker         

          if(!brokerId){
            const _userRole = await UserRole.findOne({_id:user.roleId})

            if(_userRole.name == userBrokerRole){
                let _broker =  await Broker.findOne({userId:req.user.id})
                brokerId = _broker._id
            }
          }

      const _plans = await PlanCatagory.find({brokerId})

      if(_plans){
        return res.send(_plans)
      }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

const deleteUserLogin = asyncHandler(async (req, res) => {
  try {

      //  const user = await User.findById(req.user.id)

      //   // if(!user){
      //   //     res.status(401)
      //   //     throw new Error('User not Found')
      //   // }

    const { profileId, deleteName } = req.body
    
    const user = await User.findOne({ profileId: profileId });

    const _profileId = await PlanSchedule.findOne({ profileID: user.profileId });

    if (_profileId && String(user.profileId) == String(_profileId.profileID)) {
      return res.status(201).json({ isSuccess: false, message: 'User Plan PlanSchedule  ' });
    }

    if (deleteName !== user.name) {
      return res.status(200).json({ isSuccess: false, message: 'Name does not match.' });
    }

    await User.deleteOne({ _id: user._id });
    return res.status(200).json({ isSuccess: true, message: 'User deleted successfully.' });
    
  } catch (err) {
    errorfunction.errorHandler(err, req, res);
  }
});


const getUserDetailsById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    const { id } = req.query;
    console.log(req.query)

    let profileId;
    const _user = await User.findById(id)
    console.log(_user)
    if (_user && _user.profileId) {
      profileId = _user.profileId;
    } 
    else {
      profileId = id;
    }
    console.log(profileId)
    
    const users = await User.aggregate([
      {
        $match: {
          profileId: new mongoose.Types.ObjectId(profileId)
        }
      },
      {
        $lookup: {
          from: 'marriageprofiles',
          localField: 'profileId',
          foreignField: '_id',
          as: 'userLogin'
        }
      },
      {
        $unwind: {
          path: '$userLogin',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          name: '$name',
          phoneNumber: '$phoneNumber',
          email: '$email',
          profileID: '$userLogin.profileID',
          profileUniqueId:'$userLogin._id',
          sex:'$userLogin.sex',
          imageUrls: '$userLogin.imageUrls'
        }
      }
    ]); 
    // const data =users[0].data
    // console.log(data)

    let balanceAmount;
        const balanceAmountByBroker = await Broker.findOne({userId:user.id})
        balanceAmount = balanceAmountByBroker.balanceAmount
 
        res.status(200).json({ isSuccess: true, userDetail: users, 
          balanceAmount: balanceAmount
        });
  } 
  catch (err) {
    errorfunction.errorHandler(err, req, res);
  }
});



const getLoginUserProfile = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    const { brokerId, skip, pagesize } = req.body;

    let _skip = 0;
    let _pagesize = 10;

    // Adjust pagination parameters if provided
    if (pagesize) {
      _pagesize = Math.min(pagesize, 10); // Cap pagesize at 10
    }
    
    if (skip) {
      _skip = (skip - 1) * _pagesize; // Calculate skip correctly
    }

    let _brokerId = brokerId;

    if (!_brokerId) {
      const _userRole = await UserRole.findOne({ _id: user.roleId });
      if (_userRole.name === userBrokerRole) {
        let _brokerDetail = await Broker.findOne({ userId: req.user.id });
        _brokerId = _brokerDetail._id;
      }
    }

    const _userProfileList1 = await User.find({brokerId:_brokerId})

    // Aggregate to find the user profiles with joined marriage profiles
    const _userProfileList = await User.aggregate([
    
        {
          $match: {brokerId: new mongoose.Types.ObjectId(_brokerId)}
        },
        {
          $lookup: {
            from: 'marriageprofiles',
            localField: 'profileId',
            foreignField: '_id',
            as: 'marriageProfile'
          }
        },
        {
          $unwind: {
            path: '$marriageProfile',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'plans',
            localField: 'marriageProfile.planID',
            foreignField: '_id',
            as: 'plan'
          }
        },
        {
          $unwind: {
            path: '$plan',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: '$marriageProfile._id',
            name: '$name',
            district: '$marriageProfile.district',
            DOB: '$marriageProfile.DOB',
            phoneNumber: '$marriageProfile.phoneNumber',
            planName:'$plan.planName',
            age: {
             $dateDiff: {
             startDate: '$marriageProfile.DOB',
             endDate: '$$NOW',
             unit: 'year'
             }
                },
            sex: '$marriageProfile.sex', 
            imageUrls: '$marriageProfile.imageUrls' 
          }
        },
        {
          $facet: {
            data: [
              { $skip: _skip },
              { $limit: _pagesize }
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }  
    ]);

    // Count the total records matching the query (for pagination)
    const totalRecords = await User.aggregate([
      {
        $match: { brokerId: new mongoose.Types.ObjectId(_brokerId) }
      },
      {
        $count: 'total' // Count total number of records
      }
    ]);

    const data = _userProfileList[0].data;
    const totalCount = _userProfileList[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / _pagesize);

console.log('data')
    console.log(data)
   res.status(200).json({
       loginUserProfile: data,
       totalRecourd: totalCount,
       totalPages: totalPages,
       currentPage: skip ? skip : 1,
   });
  } 
  
  catch (err) {
    errorfunction.errorHandler(err, req, res);
  }
}); 


const getLoginUserName = asyncHandler(async(req,res)=>{

try {

  const user = await User.findById(req.user.id)
  if (!user) {
      res.status(401)
      throw new Error('User not found')
  }

  const { name,brokerId } = req.query;

  let _brokerId = brokerId
 
  if (!_brokerId) {
             const _userRole = await UserRole.findOne({ _id: user.roleId });
             if (_userRole.name == userBrokerRole) {
                 let _brokerDetail = await Broker.findOne({ userId: req.user.id });
                 _brokerId = _brokerDetail._id
             }
         }

         const _userProfileList1 = await User.find({brokerId:_brokerId})
      
  if (name.length > 2) {
    
    // Perform a search in User and join MarriageProfile to get the district
    const _userProfileList = await User.aggregate([
      {
        $match: { name: { $regex: name, $options: "i" } },
      },

      {
        $match: { brokerId: new mongoose.Types.ObjectId(_brokerId) }
      },
 

      {
        $lookup: {
          from: "marriageprofiles", // The collection to join
          localField: "profileId", // Join on profileId from User
          foreignField: "_id", // Match with _id from MarriageProfile
          as: "marriageProfile", // The alias for the joined data
        },
      },
      {
        $unwind: {
          path: "$marriageProfile", // Flatten the array of joined profiles
          preserveNullAndEmptyArrays: true, // Include users with no marriage profile
        },
      },
        {
          $lookup: {
            from: 'plans',
            localField: 'marriageProfile.planID',
            foreignField: '_id',
            as: 'plan'
          }
        },
        {
          $unwind: {
            path: '$plan',
            preserveNullAndEmptyArrays: true
          }
        },
      {
        $project: {
         _id: '$marriageProfile._id',
            name: '$name',
            district: '$marriageProfile.district',
            DOB: '$marriageProfile.DOB',
            sex:'$marriageProfile.sex',
            phoneNumber: '$marriageProfile.phoneNumber',
            planName:'$plan.planName',
            age: {
             $dateDiff: {
             startDate: '$marriageProfile.DOB',
             endDate: '$$NOW',
             unit: 'year'
             }
                }
              }
      },
    ]);

    if (_userProfileList.length > 0) {
      res.status(201).json(_userProfileList);
    } else {
      res.status(404).json({ message: "No users found" });
    }
  } 
  
  // else if (name.length === 0) {
  //   const _userProfileList = await User.find({});
  //   res.status(201).json(_userProfileList);
  // }
} 
catch (err){
  errorfunction.errorHandler(err,req,res)
}

})


module.exports={
    getMarriageProfiles,
    getMarriageProfileById,
    userLoginCreate,
    getPlanByBroker,
    deleteUserLogin,
    getLoginUserProfile,
    getUserDetailsById,
    getLoginUserName,
  }
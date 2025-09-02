const asyncHandler = require("express-async-handler")
const UserRole = require('../../models/userRoleModel')
const User = require('../../models/userModel')
const MarriageProfile = require('../../models/marriageProfileModel')
const Broker = require('../../models/brokerModel')
const { errorfunction } = require('../commonController')
const PlanCatagory = require('../../models/planModel')
const { getPrfileimageUrl } = require('../../azureservice/commonService');
const userBrokerRole = "Broker"
const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs')  
// const TempUserOTP =  require('../../models/tempUserOTPModel')
// const emailsend=require('../../models/emailSendModel')
const PlanSchedule = require('../../models/planScheduleModel')
const { getImageByContainerAndBlob } = require('../../azureservice/fileUploadService')
const sharp = require('sharp');



const getMarriageProfiles = asyncHandler(async (req, res) => {
  try {

    const user = await User.findById(req.user.id)
    let _skip = 1;
    let _pagesize = 10;

    if (!user) {
      res.status(401)
      throw new Error('User not found')
    }
    else if (user.isLoggedin !== true) {
      res.status(404)
      throw new Error('User not logged in')
    }
    
    const isActive = await Broker.findOne({userId:user._id})
                            
    if(isActive.isActive !== true ){
        throw new Error('Broker isActive is false')
    }

    const { BrokerId, skip, pagesize, name, phoneNumber, profileID, email } = req.body

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
    if(name && name.trim() !=='' && name.length>=2){
        query.name = {$regex:name,$options:'i'};
    }
    if (phoneNumber) {
      query.phoneNumber = phoneNumber
    }
    if (profileID) {
      query.profileID = profileID
    }
    if (email) {
      query.email = email
    }

    query.brokerId = _brokerId

    const _marriageProfileList = await MarriageProfile.find(query).skip(_skip).limit(_pagesize)
    const _totalRecord = await MarriageProfile.find(query).countDocuments()

    const imageList = await Promise.all(
      _marriageProfileList.map(async (doc) => {
        try {
          const image = doc.imageUrls;
          let imageName = '';

          if (image?.length > 0) {
            const result = image.find((item) => item.isProfile === true);
            imageName = result?.name || image[0].name;
          }
          

          if (!imageName) {
            return { profileID: doc.profileID, imageBase64: null };
          }

          const broker = await Broker.findOne({ _id: _brokerId });

          const blobResponse = await getImageByContainerAndBlob(broker.container, imageName);

          if (!blobResponse || !blobResponse.readableStreamBody) {
            return { profileID: doc.profileID, imageBase64: null };
          }

          let imageToShow;
          imageToShow = blobResponse.readableStreamBody.pipe(sharp())

          const blurredBuffer = await streamToBuffer(imageToShow);

          const base64Image = `data:image/jpeg;base64,${blurredBuffer.toString('base64')}`;

          return {
            profileID: doc.profileID,
            imageBase64: base64Image,
          };
        } catch (err) {
          console.error(`Error processing image for profile ${doc._id}:`, err);
          return { profileID: doc.profileID, imageBase64: null };
        }
      })
    );

    res.status(200).json({
      "profilesList": _marriageProfileList,
      "totalProfile": Math.ceil(_totalRecord / _pagesize),
      "totalProfiles": _totalRecord,
      images: imageList,
    })
  }
  catch (err) {
    errorfunction.errorHandler(err, req, res)
  }

})

const getMarriageProfileById = asyncHandler(async (req, res) => {

  try {

    const user = await User.findById(req.user.id)

    if (!user) {
      res.status(401)
      throw new Error('User not found')
    }
    else if (user.isLoggedin !== true) {
      res.status(404)
      throw new Error('User not logged in')
    }
    
    const isActive = await Broker.findOne({userId:user._id})
                            
    if(isActive.isActive !== true ){
        throw new Error('Broker isActive is false')
    }

    const { id } = req.query

    const _profile = await MarriageProfile.findById(id);

    if (_profile) {
      res.status(200).json({ isSuccess: true, profileDetail: _profile })
    }
    else {
      res.status(400).json({ isSuccess: false, message: 'Error occur' })
    }
  }
  catch (err) {
    errorfunction.errorHandler(err, req, res)
  }
})

//**Get All Plan By Broker */
const getPlanByBroker = asyncHandler(async (req, res) => {

  try {
    const user = await User.findById(req.user.id)
    
    if (!user) {
      res.status(401)
      throw new Error('User not found')
    }
    else if (user.isLoggedin !== true) {
      res.status(404)
      throw new Error('User not logged in')
    }

    const isActive = await Broker.findOne({userId:user._id})
                            
    if(isActive.isActive !== true ){
        throw new Error('Broker isActive is false')
    }

    const { broker } = req.body
    let brokerId = broker

    if (!brokerId) {
      const _userRole = await UserRole.findOne({ _id: user.roleId })

      if (_userRole.name == userBrokerRole) {
        let _broker = await Broker.findOne({ userId: req.user.id })
        brokerId = _broker._id
      }
    }

    const _plans = await PlanCatagory.find({ brokerId })

    if (_plans) {
      return res.send(_plans)
    }
  }
  catch (err) {
    errorfunction.errorHandler(err, req, res)
  }
})

const deleteUserLogin = asyncHandler(async (req, res) => {

  try {

    //  const useR = await User.findById(req.user.id)

    //   if(!useR){
    //       res.status(401)
    //       throw new Error('User not Found')
    //   }

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
    else if (user.isLoggedin !== true) {
      res.status(404)
      throw new Error('User not logged in')
    }

    const isActive = await Broker.findOne({userId:user._id})
                            
    if(isActive.isActive !== true ){
        throw new Error('Broker isActive is false')
    }

    const { id } = req.query;

    let profileId;
    const _user = await User.findById(id)

    if (_user && _user.profileId) {
      profileId = _user.profileId;
    }
    else {
      profileId = id;
    }
    
    const _users = await User.findOne({profileId:id})

     if (isActive._id.toString() !== _users.brokerId.toString()) {
           res.status(401)
          throw new Error('Unauthorized access!!')
        }

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
          profileUniqueId: '$userLogin._id',
          sex: '$userLogin.sex',
          imageUrls: '$userLogin.imageUrls'
        }
      }
    ]);

    let balanceAmount;
    const balanceAmountByBroker = await Broker.findOne({ userId: user.id })
    balanceAmount = balanceAmountByBroker.balanceAmount

    res.status(200).json({
      isSuccess: true, userDetail: users,
      balanceAmount: balanceAmount
    });

  }
  catch (err) {
    errorfunction.errorHandler(err, req, res);
  }
});


const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};



const getLoginUserProfile = asyncHandler(async (req, res, next) => {

  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }
    else if (user.isLoggedin !== true) {
      res.status(404)
      throw new Error('User not logged in')
    }

    const isActive = await Broker.findOne({userId:user._id})
                            
    if(isActive.isActive !== true ){
        throw new Error('Broker isActive is false')
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

    const _userProfileList1 = await User.find({ brokerId: _brokerId })
    // console.log(_userProfileList1)
    // Aggregate to find the user profiles with joined marriage profiles
    const _userProfileList = await User.aggregate([

      {
        $match: { brokerId: new mongoose.Types.ObjectId(_brokerId) }
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
          planName: '$plan.planName',
          profileID: '$marriageProfile.profileID',
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

    const profileIds = _userProfileList1.map(user => user.profileId);

    const _marriageProfileList = await MarriageProfile.find({ _id: { $in: profileIds } })

    const imageUrlList = await Promise.all(
      _marriageProfileList.map(async (doc) => {
        // Perform asynchronous operations here if needed
        // let imageurl = await getPrfileimageUrl(_brokerId, doc._id)
        // return { "profileID": doc._id, "imageUrl": imageurl };

        try {
          const image = doc.imageUrls;
          let imageName = '';

          if (image?.length > 0) {
            const result = image.find((item) => item.isProfile === true);
            imageName = result?.name || image[0].name;
          }

          if (!imageName) {
            return { profileID: doc.profileID, imageBase64: null };
          }

          const broker = await Broker.findOne({ _id: _brokerId });

          const blobResponse = await getImageByContainerAndBlob(broker.container, imageName)

          if (!blobResponse || !blobResponse.readableStreamBody) {
            return { profileID: doc.profileID, imageBase64: null };
          }

          let imageToShow;
          imageToShow = blobResponse.readableStreamBody.pipe(sharp())

          const blurredBuffer = await streamToBuffer(imageToShow);

          const base64Image = `data:image/jpeg;base64,${blurredBuffer.toString('base64')}`;

          return {
            profileID: doc.profileID,
            imageBase64: base64Image,
          };

        }

        catch (err) {
          console.error(`Error processing image for profile ${doc._id}:`, err);
          return { profileID: doc.profileID, imageBase64: null };
        }

      },
      )
    )
    res.status(200).json({
      loginUserProfile: data,
      totalRecourd: totalCount,
      totalPages: totalPages,
      currentPage: skip ? skip : 1,
      imageUrl: imageUrlList
    });

  }

  catch (err) {
    errorfunction.errorHandler(err, req, res);
  }
});


const getLoginUserName = asyncHandler(async (req, res) => {

  try {

    const user = await User.findById(req.user.id)

    if (!user) {
      res.status(401)
      throw new Error('User not found')
    }
    else if (user.isLoggedin !== true) {
      res.status(404)
      throw new Error('User not logged in')
    }

    const isActive = await Broker.findOne({userId:user._id})
                            
    if(isActive.isActive !== true ){
        throw new Error('Broker isActive is false')
    }

    const { name, brokerId } = req.query;

    let _brokerId = brokerId

    if (!_brokerId) {
      const _userRole = await UserRole.findOne({ _id: user.roleId });
      if (_userRole.name == userBrokerRole) {
        let _brokerDetail = await Broker.findOne({ userId: req.user.id });
        _brokerId = _brokerDetail._id
      }
    }

    const _userProfileList1 = await User.find({ brokerId: _brokerId })

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
            sex: '$marriageProfile.sex',
            phoneNumber: '$marriageProfile.phoneNumber',
            planName: '$plan.planName',
            profileID: '$marriageProfile.profileID',
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
  catch (err) {
    errorfunction.errorHandler(err, req, res)
  }

})


module.exports = {
  getMarriageProfiles,
  getMarriageProfileById,
  getPlanByBroker,
  deleteUserLogin,
  getLoginUserProfile,
  getUserDetailsById,
  getLoginUserName,
}
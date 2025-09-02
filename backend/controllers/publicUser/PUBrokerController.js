const sharp = require('sharp');
const asyncHandler = require('express-async-handler')
const Broker = require('../../models/brokerModel')
const UserRole = require('../../models/userRoleModel')
const User = require('../../models/userModel')
const { errorfunction, fieldValidationfunction } = require('../commonController')
const MarriageProfile = require('../../models/marriageProfileModel')
const bcrypt = require('bcryptjs')
const PublicUser = require('../../models/PUMarriageProfileModel')
const PlanSchedule = require('../../models/PUPlanScheduleModel')
const { getBrokerimageUrl } = require('../../azureservice/commonService');
const {getImageByContainerAndBlob} = require('../../azureservice/fileUploadService')
const { promises } = require('stream')
const { PUPlanFunction } = require('../../reUsable/PUPlanFuntion')


const getAllBroker = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }
     else if(user.isLoggedin !== true)
    {
      res.status(404)
      throw new Error('User not logged in')
    }

    // Pagination setup
    let _skip = 0;
    let _pagesize = 10;
    const { name, district, matrimonyName, phoneNumber, skip, pagesize } = req.body;

    if (pagesize) {
      if (skip == 1) {
        _skip = 0;
        _pagesize = pagesize;
      } else {
        _skip = (skip - 1) * pagesize;
        _pagesize = pagesize;
      }

      if (_pagesize > 10) {
        _pagesize = 10;
      }
    }

    // Filters
    let query = { isPublic: true};

    if (name && name.trim() !=='' & name.length > 3 ){ 
      query.name = {$regex: name, $options: 'i'}}

    if (matrimonyName && matrimonyName.trim() !==''& matrimonyName.length> 2 ){
      query.matrimonyName = {$regex: matrimonyName, $options: 'i'}}
      
    if (district) query.district = district;
    if (phoneNumber) query.phoneNumber = phoneNumber;

    // Get paginated brokers
    const _brokerList = await Broker.find(query).skip(_skip).limit(_pagesize);
    const _totalRecord = await Broker.countDocuments(query);
    const brokerIds = _brokerList.map(b => b._id);

    // Get user's public profile
    const userStatus = await PublicUser.findOne({ userId: user.id });

    let userGender = null;
    let oppositeGender = null;

    if (userStatus?.sex) {
      userGender = userStatus.sex;
      oppositeGender = userGender === "Male" ? "Female" : "Male";
    }

    // Get opposite gender counts per broker only from _brokerList
    const genderCounts = await MarriageProfile.aggregate([
      {
        $match: {
          brokerId: { $in: brokerIds },
          sex: oppositeGender
        }
      },
      {
        $group: {
          _id: "$brokerId",
          count: { $sum: 1 }
        }
      }
    ]);

    // Map: brokerId => oppositeGenderCount
    const countMap = {};
    genderCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    // Add count to brokers
    const brokersWithCounts = _brokerList.map(broker => {
      const id = broker._id.toString();
      return {
        ...broker.toObject(),
        oppositeGenderCount: countMap[id] || 0
      };
    });

    // Find user's associated brokers (optional)
    let commonBrokerIds = []

    if (userStatus) {
      const publicUser = await MarriageProfile.aggregate([
        { $match: { publicProfId: userStatus._id } },
        { $group: { _id: "$brokerId" } }
      ]);

      if (publicUser.length > 0) {
        const brokerIdsInBrokerCollection = await Broker.find({}, { _id: 1 });
        const brokerIds = brokerIdsInBrokerCollection.map(broker => broker._id.toString());

        const brokerIdSet = new Set(brokerIds);
        commonBrokerIds = publicUser.filter(profile =>
          brokerIdSet.has(profile._id.toString())
        )
      }
    }

    const brokImageList = await Promise.all(
      await _brokerList.map(async (doc) => {
        try{
              const image = doc.imageName;

              const blobResponse = await getImageByContainerAndBlob(doc.container, image);

         if (!blobResponse || !blobResponse.readableStreamBody) {
            return { _id: doc._id, imageBase64: null };
          }         
              let imageToShow;
              imageToShow = blobResponse.readableStreamBody.pipe(sharp())
            
              const blurredBuffer = await streamToBuffer(imageToShow);
              
              const base64Image = `data:image/jpeg;base64,${blurredBuffer.toString('base64')}`;

          return {
            _id: doc._id,
            imageBase64: base64Image,
          };
          
        }
        catch (err) {
          console.error(`Error processing image for profile ${doc._id}:`, err);
          return { profileID: doc.profileID, imageBase64: null };
        }
      })
    )

    // Final response
    res.status(200).json({
      brokerList: brokersWithCounts,
      totalRecord: Math.ceil(_totalRecord / _pagesize),
      userStatus: userStatus.status,
      userExists: commonBrokerIds,
      userGender,
      brokImageList: brokImageList,
      totalRecords: _totalRecord,
    });

  } catch (err) {
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


const getAllProfilesByBrokers = asyncHandler(async (req, res) => {

  try {
    const user = await User.findById(req.user.id);
    let _skip = 1;
    let _pagesize = 10;

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }
     else if(user.isLoggedin !== true)
    {
      res.status(404)
      throw new Error('User not logged in')
    }

    const { brokerId, skip, pagesize, religion, caste, isViewedImageProfile, qualification } = req.body.data;

    if (pagesize) {

      if (skip == 1) {
        _skip = skip - 1
        _pagesize = pagesize
      }
      else {
        _skip = ((skip - 1) * pagesize)
        _pagesize = pagesize
      }
    }

    const publicUser = await PublicUser.findOne({ userId: req.user.id });

    if (!publicUser) {
      res.status(404);
      throw new Error("Public profile not found");
    }

     if( user._id.toString () !== publicUser.userId.toString()){
             res.status(404)
            throw new error("Unauthorized access")
        }

        const plan = await PlanSchedule.findOne({profileID:publicUser._id})

         if(!plan){
            res.status(404)
            throw new error("Plan not found")
       }

          const planId = publicUser.planID;
    
          const _plan = await PlanSchedule.findOne({
            profileID: publicUser._id,
            'planSchedule.planID': planId
          });
    
          if (_plan && _plan.planSchedule && _plan.planSchedule.length > 0) {
            const firstSchedule = _plan.planSchedule[0];
            const expiryDate = new Date(firstSchedule.expiryDate);
            const todayDate = new Date();
    
            if(todayDate >= expiryDate) {
              return
            }
        }
        // const schedule = _plan.planSchedule[0];
        // const allViewedProfiles = schedule.Schedule.flatMap(item => item.viewedProfile);
        // const viewed = [...new Set(allViewedProfiles)];

    let query = {

      brokerId: brokerId,
      sex: publicUser.sex === "Female" ? "Male" : "Female",
      isPublicProfile:true
    };

    // const currentDateForFrom = new Date();
    // currentDateForFrom.setFullYear(currentDateForFrom.getFullYear() - ageFrom);

    // // Calculate the date 30 years ago from the current date
    // const currentDateForTo = new Date();
    // currentDateForTo.setFullYear(currentDateForTo.getFullYear() - ageTo);

    if (religion) {
      query.religion = religion;
    }
    if (caste) {
      query.caste = caste;
    }
    // if (ageFrom) {
    //   query.DOB = { $lte: currentDateForFrom, $gte: currentDateForTo }
    // }
    if(qualification) {
      query.qualification = qualification
    }


    if (isViewedImageProfile) {
      const _userProfilePlan = await PublicUser.findOne({ userId: user.id })

      let viewedImageProfile = await appFunction.getTodayImageViewedProfiles(_userProfilePlan.id, _userProfilePlan.planID)

      if (viewedImageProfile?.length > 0) {
        query._id = { $in: viewedImageProfile };
        console.log('view ID found')
      }
      else {
        console.log('view ID not found')
      }
    }
    const _marriageProfiles = await MarriageProfile.find(query).skip(_skip).limit(pagesize);

    const _profileTotal = await MarriageProfile.find(query).countDocuments()


    const _userProfilePlan = await PublicUser.findOne({ userId: user.id })

    const imageUrlList = await Promise.all(
      _marriageProfiles.map(async (doc) => {
        try {

                if (doc.isPublicImage === false) {
        return { profileID: doc.profileID, imageBase64: null };
      }
      
          const image = doc.imageUrls;
          let imageName = '';

          if (image?.length > 0) {
            const result = image.find((item) => item.isProfile === true);
            imageName = result?.name || image[0].name
          }

          if (!imageName) {
            return { profileID: doc.profileID, imageBase64: null }
          }

          const broker = await Broker.findOne({ _id: brokerId })

          const blobResponse = await getImageByContainerAndBlob(broker.container, imageName)

          if (!blobResponse || !blobResponse.readableStreamBody) {
            return { profileID: doc.profileID, imageBase64: null }
          }

          let isProfileViewedToday = await PUPlanFunction.isProfileViewedToday(_userProfilePlan.id, _userProfilePlan.planID, doc._id)

          console.log(isProfileViewedToday)
          let imageToShow;

          if (isProfileViewedToday)
            imageToShow = blobResponse.readableStreamBody.pipe(sharp())
          else
            imageToShow = blobResponse.readableStreamBody.pipe(sharp().blur(8))

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
      })
    )

     res.status(200).json({
      profiles: _marriageProfiles, profileTotal: Math.ceil(_profileTotal / _pagesize),
      totalRecord: _profileTotal, imageUrl: imageUrlList
    });
  }
  catch (err) {
    errorfunction.errorHandler(err, req, res);
  }
});


const PUExistsingPlan = asyncHandler(async (req, res) => {
  
  try {
    
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }
    else if(user.isLoggedin !== true)
    {
      res.status(404)
      throw new Error('User not logged in')
    }

    const _PublicUser = await PublicUser.findOne({ userId: user._id });
  

    if (!_PublicUser) {
      console.log("errorr")
      return res.status(404).json({ message: "Public user not found", PUexists: false, planExists: false });
    }

    // Check if any PlanSchedule exists
    const PUPlan = await PlanSchedule.findOne({ profileID: _PublicUser._id });

    let PUexists = Boolean(PUPlan);
    let planExists = false;

    if (PUexists) {
      const planId = _PublicUser.planID;

      const _plan = await PlanSchedule.findOne({
        profileID: _PublicUser._id,
        'planSchedule.planID': planId
      });

      if (_plan && _plan.planSchedule && _plan.planSchedule.length > 0) {
        const firstSchedule = _plan.planSchedule[0];
        const expiryDate = new Date(firstSchedule.expiryDate);
        const todayDate = new Date();

        if (todayDate <= expiryDate) {
          planExists = true; // Plan is still active
        }
      }
    }

    res.json({ PUexists, planExists });

  } catch (err) {
    errorfunction.errorHandler(err, req, res);
  }
});



module.exports = {
  getAllBroker,
  getAllProfilesByBrokers,
  PUExistsingPlan
}
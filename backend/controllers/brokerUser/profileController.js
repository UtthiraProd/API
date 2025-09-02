
const sharp = require('sharp');
const asyncHandler =require('express-async-handler')
const User =require('../../models/userModel')
const Broker =require('../../models/brokerModel')
const MarriageProfile = require('../../models/marriageProfileModel')
const {errorfunction} =require ('../commonController')
const {appFunction} =require ('../../reUsable/appFunction')
const {getImageByContainerAndBlob} = require('../../azureservice/fileUploadService')
const PlanSchedule =require('../../models/planScheduleModel')


/**
 * Function Description: to get all profiles with broker id
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Manikandan ,6 May 2025
 * Update History: 
 */

// module.exports={getAllProfilesByBrokerId,
//     getProfileDetailsById,getBrokerDetails,getProfileHoroscopeDetailsById
//   }


/**
 * Function Description: to get all profiles details by an id
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 14 May 2025
 * Update History: 
 */

const getProfileDetailsById = asyncHandler(async (req, res) => {

    try {

        const user = await User.findById(req.user.id)

        let _brokerId = user.brokerId

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        else if(user.isLoggedin !== true)
        {
            res.status(404)
            throw new Error('User not logged in')
        }
                    const plan = await PlanSchedule.findOne({ profileID: user.profileId })

                    if (!plan) {
                        return res.status(200).json({ isSuccess: false, message: 'Please contact broker to select the plan..' });
                    }        
     
     const _profile =await MarriageProfile.findOne({_id :user.profileId})


      const planId = _profile.planID;

      const _plan = await PlanSchedule.findOne({
              profileID: _profile._id,
              'planSchedule.planID': planId
        });

         if (_plan && _plan.planSchedule && _plan.planSchedule.length > 0) {
        const firstSchedule = _plan.planSchedule[0];
     
        const expiryDate = firstSchedule.expiryDate

        const todayDate = new Date();
        console.log(expiryDate)

        if (todayDate >= expiryDate) {
              return  
        }
       
      } 

        const { profileId } = req.body
 const _marriageProfileForPlan  = await MarriageProfile.findOne({ _id:user.profileId })

  let errorMessage = appFunction.checkPlanValidation(user.profileId,_marriageProfileForPlan.planID,'View')

  if(errorMessage !="")
  {

  }
        let _marriageProfileDetail = await MarriageProfile.findOne({ _id: profileId })
        .select('-contactPerson -phoneNumber -POB -address1 -address2 -star -rasi -birthHour -birthMin -meridiem -dhosam -qualification -job');

        if (!_marriageProfileDetail) {
            res.status(404)
            throw new Error('profile detail not found')
        } 

        if(_marriageProfileDetail.brokerId.toString() !== _brokerId.toString())
        {
          
            res.status(404)
            throw new Error('Unauthorized access!!')
        }    

const horo = _marriageProfileDetail.horoScope?.toObject?.() || _marriageProfileDetail.horoScope;
if (Object.keys(horo).length > 0) {
  _marriageProfileDetail.horoScope = { profileId: _marriageProfileDetail._id };
}
else
 _marriageProfileDetail.horoScope = null;

        appFunction.CountProfileViewDownload(user.profileId,_marriageProfileForPlan.planID,'View')
        console.log(_marriageProfileDetail)
        res.status(200).json({profileDetails:_marriageProfileDetail})   
    
  
}
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};


const getAllProfilesByBrokerId = asyncHandler(async (req, res) => {

    try {

        // get user using the id in the JWT
        // let _brokerId;
        // let _broker;
        let _skip = 1;
        let _pagesize = 10;
        // let _totalRecord;

        //  console.log('mani')
        const user = await User.findById(req.user.id)
        // console.log(user)
        
        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        else if(user.isLoggedin !== true)
        {
            res.status(404)
            throw new Error('User not logged in')
        }

        const {skip,pagesize,sex, religion, caste, ageFrom,ageTo,isViewedImageProfile} = req.body



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

        const currentDateForFrom = new Date();
        currentDateForFrom.setFullYear(currentDateForFrom.getFullYear() - ageFrom);

        // Calculate the date 30 years ago from the current date
        const currentDateForTo = new Date();
        currentDateForTo.setFullYear(currentDateForTo.getFullYear() - ageTo);

        let query = {};
        let _brokerId = user.brokerId


        query.brokerId = _brokerId

        // if (sex) {
        //     query.sex = sex;
        // }
        if (religion) {
            query.religion = religion;
        }
        if (caste) {
            query.caste = caste;
        }
        if (ageFrom) {
            query.DOB = { $lte: currentDateForFrom, $gte: currentDateForTo }
        }

        if(isViewedImageProfile)
        { 
       const _marriageProfileForPlan  = await MarriageProfile.findOne({ _id:user.profileId })
        let viewedImageProfile =await appFunction.getTodayImageViewedProfiles(user.profileId,_marriageProfileForPlan.planID)

        if (viewedImageProfile?.length > 0) {
          query._id = { $in: viewedImageProfile };
          console.log('view ID found')
        }
        else
        {
            console.log('view ID not found')
        }
       }

const ownProfile = await MarriageProfile.findOne(user.profileId)

    if(ownProfile.sex == "Female")
    {
     query.sex = "Male"
    }
      
    else
    {
      query.sex = "Female"
    }

        const _marriageProfileList = await MarriageProfile.find(query).skip(_skip).limit(_pagesize)
       

        const _totalRecord = await MarriageProfile.find(query).countDocuments()

const _marriageProfileForPlan = await MarriageProfile.findOne({ _id: user.profileId })

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

      if (!blobResponse.readableStreamBody) {
        return { profileID: doc.profileID, imageBase64: null };
      }

      let isProfileViewedToday = await appFunction.isProfileViewedToday(user.profileId,_marriageProfileForPlan.planID,doc._id)
      console.log(isProfileViewedToday)
      let imageToShow;

      if(isProfileViewedToday)
        imageToShow =  blobResponse.readableStreamBody.pipe(sharp())
      else
        imageToShow = blobResponse.readableStreamBody.pipe(sharp().blur(8))

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
        // res.status(200).json({ "profiles": _marriageProfileList, "totalRecourd": Math.ceil(_totalRecord / _pagesize), "imageUrls": imageUrlList, "totalRecords": _totalRecord })

        res.status(200).json({
  profiles: _marriageProfileList,
  totalRecourd: Math.ceil(_totalRecord / _pagesize),
  images: imageList, // now contains base64 images
  totalRecords: _totalRecord,
});


    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
        console.log(err)
    }

})

/**
 * Function Description: to get all profiles details by an id
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 14 May 2025
 * Update History: 
 */

const getProfileHoroscopeDetailsById = asyncHandler(async (req, res) => {

    try {
        const user = await User.findById(req.user.id)

        let _brokerId = user.brokerId

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        else if(user.isLoggedin !== true)
        {
            res.status(404)
            throw new Error('User not logged in')
        }
                    const plan = await PlanSchedule.findOne({ profileID: user.profileId })

                    if (!plan) {
                        return res.status(200).json({ isSuccess: false, message: 'Please contact broker to select the plan..' });
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

        if (todayDate >= expiryDate) {
           return  ;

        }}
        
        const { profileId } = req.body

 const _marriageProfileForPlan  = await MarriageProfile.findOne({ _id:user.profileId })

  let errorMessage = appFunction.checkPlanValidation(user.profileId,_marriageProfileForPlan.planID,'View')

  if(errorMessage !="")
  {

  }
        let _marriageProfileDetail = await MarriageProfile.findOne({ _id: profileId })
        .select('-contactPerson -phoneNumber -POB -address1 -address2');

        console.log(_marriageProfileDetail)

        if (!_marriageProfileDetail) {
            res.status(404)
            throw new Error('profile detail not found')
        } 

        if(_marriageProfileDetail.brokerId.toString() !== _brokerId.toString())
        {
            res.status(404)
            throw new Error('Unauthorized access!!')
        }    
      let result = await  appFunction.CountProfileViewDownload(user.profileId,_marriageProfileForPlan.planID,'Download',profileId)
      console.log('result')
      console.log(result)

      if(result.isSuccess)
        return res.send({ "isSuccess": true, "message": result.message, "data":_marriageProfileDetail.horoScope })
      else 
      return res.send({ "isSuccess": false, "message": result.message, "data":{} })
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


/**
 * Function Description: to get broker details by id
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getBrokerDetails = asyncHandler(async (req, res) => {

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

        const _brokerDetail = await Broker.findOne({ _id: user.brokerId }, { "profileIds": 0 });

        if (!_brokerDetail) {
            res.status(404)
            throw new Error('Broker detail not found')
        }

        res.status(200).json(_brokerDetail)

    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


module.exports={getAllProfilesByBrokerId,
    getProfileDetailsById,getBrokerDetails,getProfileHoroscopeDetailsById
  }